import { ValidationError } from '../../../../packages/error-handler';
import prisma from '../../../../packages/libs/prisma';
import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
// Paystack is an optional runtime dependency. Require it safely so the app doesn't crash when it's not installed.
let paystack: any = null
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    paystack = require('paystack')
} catch (err) {
    // leave paystack as null; handlers will check and return a friendly error
    paystack = null
}
import { Prisma } from '@prisma/client';
import { sendEmail } from '../utils/send-email';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Accept multiple payload shapes from different clients and derive missing fields from auth middleware
        const body = req.body || {};
        let userId = body.userId || (req as any).user?.id || (req as any).seller?.id || null;
        const items = Array.isArray(body.items) ? body.items : (Array.isArray(body.products) ? body.products : []);
        const totalAmount = body.totalAmount ?? body.total ?? body.total_price ?? null;
        const paymentMethod = body.paymentMethod || body.payment || 'UNKNOWN';
        const shipping = typeof (body.shippingAddress || body.shipping || body.address) === 'object' && (body.shippingAddress || body.shipping || body.address) !== null
            ? (body.shippingAddress || body.shipping || body.address)
            : null;
        // Normalize shopId which may be provided as an object or string
        const rawShop = body.shopId ?? body.shop ?? null;
        let shopId: string | null = null;
        if (rawShop && typeof rawShop === 'object') {
            shopId = String(rawShop.id ?? rawShop._id ?? rawShop.shopId ?? rawShop);
        } else if (rawShop) {
            shopId = String(rawShop);
        }

        // attempt to derive sellerId from multiple sources (body, auth, or user)
        let sellerId = body.sellerId || (req as any).seller?.id || (req as any).user?.sellerId || null;

        // Basic validation + type coercion to avoid Prisma runtime errors
        if (!userId || !Array.isArray(items) || items.length === 0 || totalAmount == null || !paymentMethod || !shipping) {
            throw new ValidationError('Missing or invalid required fields');
        }

        // Normalize items to a predictable shape before persisting as JSON
        const normalizedItems = items.map((it: any) => ({
            productId: String(
                it.productId ?? it.id ?? it._id ?? (it.product && (it.product.id ?? it.product._id)) ?? ''
            ),
            price: Number(it.price ?? it.sale_price ?? it.product?.price ?? 0),
            quantity: Number(it.quantity ?? it.qty ?? 1),
        }));

        // Ensure numeric totalAmount
        const total = Number(totalAmount || 0);

        // If sellerId is missing but shopId is present, try to look it up
        if (!sellerId && shopId) {
            try {
                const shopRec: any = await prisma.shops.findUnique({ where: { id: String(shopId) } });
                if (shopRec) {
                    const candidate = shopRec.sellerId ?? shopRec.ownerId ?? shopRec.vendorId ?? shopRec.userId ?? shopRec.createdBy ?? null;
                    if (candidate) {
                        sellerId = String(candidate);
                    } else {
                        console.warn('[order-service] shop record found but no sellerId-like field present', { shopId: shopRec.id, keys: Object.keys(shopRec) });
                    }
                }
            } catch (lookupErr) {
                const lookupMsg = (typeof lookupErr === 'object' && lookupErr !== null && 'message' in lookupErr)
                    ? (lookupErr as any).message
                    : String(lookupErr);
                console.warn('[order-service] Failed to lookup shop for sellerId', lookupMsg);
            }
        }

        // If still missing, try to derive sellerId by inspecting product records for any seller-like field or shopId
        if (!sellerId && Array.isArray(normalizedItems) && normalizedItems.length > 0) {
            try {
                const productIds = normalizedItems.map((p: any) => String(p.productId)).filter((pid: string) => pid && pid !== '');
                if (productIds.length > 0) {
                    // fetch product records and inspect them for seller/shop hints
                    const prodRecs: any[] = await prisma.products.findMany({ where: { id: { in: productIds } } as any });
                    if (!prodRecs || prodRecs.length === 0) {
                        console.warn('[order-service] No product records found for productIds', { requested: productIds.slice(0, 10) });
                    }
                    for (const pr of prodRecs || []) {
                        // first check product-level seller-like fields
                        const prodCandidate = pr?.sellerId ?? pr?.ownerId ?? pr?.vendorId ?? pr?.userId ?? pr?.createdBy ?? null;
                        if (prodCandidate) {
                            sellerId = String(prodCandidate);
                            break;
                        }

                        // some products may embed a `seller` or `vendor` object
                        if (pr?.seller && (pr.seller.id || pr.seller._id || pr.seller.sellerId)) {
                            sellerId = String(pr.seller.id ?? pr.seller._id ?? pr.seller.sellerId);
                            break;
                        }

                        // if product points to a shop, look up shop record for seller hints
                        const prodShopId = pr?.shopId ?? pr?.shop ?? null;
                        if (prodShopId) {
                            try {
                                const shopRec2: any = await prisma.shops.findUnique({ where: { id: String(prodShopId) } });
                                if (shopRec2) {
                                    const cand2 = shopRec2.sellerId ?? shopRec2.ownerId ?? shopRec2.vendorId ?? shopRec2.userId ?? shopRec2.createdBy ?? null;
                                    if (cand2) {
                                        sellerId = String(cand2);
                                        break;
                                    } else {
                                        console.warn('[order-service] product-derived shop record missing sellerId-like field', { shopId: shopRec2.id, productId: pr?.id, shopKeys: Object.keys(shopRec2) });
                                    }
                                }
                            } catch (innerErr) {
                                // continue trying other products
                                console.warn('[order-service] Failed to lookup shop for product-derived shopId', String(innerErr));
                            }
                        }
                    }
                }
            } catch (deriveErr) {
                const msg = (typeof deriveErr === 'object' && deriveErr !== null && 'message' in deriveErr)
                    ? (deriveErr as any).message
                    : String(deriveErr);
                console.warn('[order-service] Failed to derive sellerId from products', msg);
            }
        }

        // Extra fallback: check nested body.seller / body.shop objects or item-level seller/shop info
        if (!sellerId) {
            try {
                if (body.seller && (body.seller.id || body.seller._id || body.seller.sellerId)) {
                    sellerId = String(body.seller.id ?? body.seller._id ?? body.seller.sellerId);
                }

                // Check each item for sellerId or shopId directly on the item
                if (!sellerId && Array.isArray(items)) {
                    for (const it of items) {
                        if (!it) continue;
                        if (it.sellerId) {
                            sellerId = String(it.sellerId);
                            break;
                        }
                        const itemShop = it.shopId ?? it.shop ?? it.product?.shopId ?? it.product?.shop;
                        if (itemShop) {
                            try {
                                const shopRec3: any = await prisma.shops.findUnique({ where: { id: String(itemShop) } });
                                if (shopRec3 && shopRec3.sellerId) {
                                    sellerId = String(shopRec3.sellerId);
                                    break;
                                }
                            } catch (inner) {
                                // ignore and continue
                            }
                        }
                    }
                }
            } catch (fbErr) {
                console.warn('[order-service] Extra sellerId fallback failed', String(fbErr));
            }
        }

        // If still missing, run richer diagnostics (product lookups + shop keys) then fail
        if (!sellerId) {
            // prepare basic debug object
            const debugBase: any = {
                shopId,
                sellerId: sellerId || null,
                bodyShape: Object.keys(body || {}).slice(0, 20),
                itemsSample: Array.isArray(items) ? items.slice(0, 3) : items,
            };

            try {
                // compute productIds we attempted to use during derivation
                const productIds = Array.isArray(normalizedItems)
                    ? normalizedItems.map((p: any) => String(p.productId)).filter((pid: string) => pid && pid !== '')
                    : [];
                debugBase.requestedProductIds = productIds.slice(0, 50);

                if (productIds.length > 0) {
                    // attempt a read-only fetch to surface what products (if any) exist
                    const prodRecs: any[] = await prisma.products.findMany({ where: { id: { in: productIds } } as any, select: { id: true, shopId: true } as any });
                    debugBase.foundProducts = (prodRecs || []).map((p: any) => ({ id: p.id, shopId: p.shopId }));

                    // for any shopIds referenced by those products, fetch shop keys to reveal schema drift
                    const referencedShopIds = Array.from(new Set((prodRecs || []).map((p: any) => p?.shopId).filter(Boolean)));
                    if (referencedShopIds.length > 0) {
                        const shopRecords: any[] = await prisma.shops.findMany({ where: { id: { in: referencedShopIds } } as any });
                        debugBase.referencedShops = (shopRecords || []).map((s: any) => ({ id: s.id, keys: Object.keys(s) }));
                    }
                }
            } catch (diagErr) {
                // Type-safe extraction of error message for TypeScript
                debugBase.diagnosticError = (typeof diagErr === 'object' && diagErr !== null && 'message' in diagErr)
                    ? String((diagErr as any).message)
                    : String(diagErr);
            }

            console.error('[order-service] createOrder missing sellerId after derivation. Detailed debug:', debugBase);

            // Opt-in fallback for local/dev environments: allow setting DEFAULT_SELLER_ID in env
            const defaultSeller = process.env.DEFAULT_SELLER_ID || process.env.DEV_DEFAULT_SELLER_ID;
            if (defaultSeller) {
                console.warn('[order-service] Using DEFAULT_SELLER_ID fallback for order creation');
                sellerId = String(defaultSeller);
            }

            if (!sellerId) {
                throw new ValidationError('Missing sellerId (required by orders schema)');
            }
        }

        try {
            // generate an external orderId used in emails and as unique identifier
            const externalOrderId = 'ORD-' + Date.now().toString(36).slice(-8).toUpperCase();
            // create order storing items as JSON in `products` field (schema uses a JSON column)
            const order = await prisma.orders.create({
                data: {
                    orderId: externalOrderId,
                    userId: String(userId),
                    shopId: shopId ? String(shopId) : undefined,
                    sellerId: sellerId ? String(sellerId) : undefined,
                    total: total,
                    totalAmount: total,
                    status: 'PENDING',
                    customerName: (shipping as any)?.name || null,
                    email: (shipping as any)?.email || (body.email || null),
                    shippingAddress: shipping as unknown as Prisma.JsonValue,
                    products: normalizedItems as unknown as Prisma.JsonValue,
                    items: normalizedItems as unknown as Prisma.JsonValue,
                } as unknown as Prisma.ordersCreateInput,
            });

            // Send order confirmation email asynchronously (do not block the response)
            try {
                const recipient = (shipping as any)?.email || (req.body?.email as string) || null;
                if (recipient) {
                    const templateName = 'order-comfirmation-email';
                    const subject = `Order Confirmation - ${ (order as any).orderId || order.id }`;
                    // normalize the order object for the email template (ensure `items` is present)
                    const emailOrder = {
                        ...order,
                        items: (order as any).products || (order as any).items || [],
                    };
                    // fire-and-forget but log failures
                    sendEmail(recipient, subject, templateName, { order: emailOrder })
                        .then((sent) => {
                            if (!sent) console.error('[order-service] Failed to send order confirmation email', order.id);
                        })
                        .catch((err) => console.error('[order-service] Error sending order confirmation email', err));
                } else {
                    console.warn('[order-service] No recipient email found for order', order.id);
                }
            } catch (emailErr) {
                console.error('[order-service] Unexpected error attempting to send order email', emailErr);
            }

            // If you need to persist items relationally, create them in a separate call (model name/shape may vary)
            return res.status(201).json(order);
        } catch (prismaErr: any) {
            // Wrap known Prisma errors to provide better debugging output while still using the error middleware
            console.error('Prisma create order error:', prismaErr);
            return next(prismaErr);
        }
    } catch (error) {
        return next(error);
    }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const order = await prisma.orders.findUnique({
            where: { id },
        });
        res.status(200).json(order);
    } catch (error) {
        return next(error);
    }
};

export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const orders = await prisma.orders.findMany({
            where: { userId: String(userId) },
        });
        res.status(200).json(orders);
    } catch (error) {
        return next(error);
    }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Prefer authenticated user id, fall back to query param
        const authUserId = (req as any).user?.id || null;
        const queryUserId = req.query.userId as string | undefined;
        const userId = authUserId || queryUserId;
        if (!userId) {
            throw new ValidationError('User not authenticated');
        }
        const orders = await prisma.orders.findMany({ where: { userId: String(userId) } });
        return res.status(200).json(orders);
    } catch (error) {
        return next(error);
    }
};

export const getShopOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Optionally filter by shopId via query param
        const { shopId } = req.query;
        const where: any = {};
        if (shopId) where.shopId = String(shopId);
        const orders = await prisma.orders.findMany({ where });
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        return next(error);
    }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        // Accept `status` in the request body but map to the Prisma field `orderStatus`.
        const { status } = req.body;
        if (!status) {
            throw new ValidationError('Status is required');
        }
        const order = await prisma.orders.update({
            where: { id },
            data: { orderStatus: status } as unknown as Prisma.ordersUpdateInput,
        });
        res.status(200).json(order);
    } catch (error) {
        return next(error);
    }
};

export const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!paystack) {
            throw new ValidationError('Paystack SDK is not installed or configured. Install the `paystack` package or disable payment features.')
        }
        const { orderId, email } = req.body;
        if (!orderId || !email) {
            throw new ValidationError('Order ID and email are required');
        }
        const order = await prisma.orders.findUnique({
            where: { id: String(orderId) },
        });
        if (!order) {
            throw new ValidationError('Order not found');
        }
        const paystackResponse = await (paystack as any).transaction.initialize({
            amount: Number(order.total) * 100, // in kobo
            email,
            reference: `ORDER_${order.id}_${crypto.randomBytes(8).toString('hex')}`,
        });
        res.status(200).json({ authorizationUrl: paystackResponse.data.authorization_url });
    } catch (error) {
        return next(error);
    }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!paystack) {
            throw new ValidationError('Paystack SDK is not installed or configured. Install the `paystack` package or disable payment features.')
        }
        const { reference } = req.query;
        if (!reference) {
            throw new ValidationError('Reference is required');
        }
        const referenceStr = Array.isArray(reference) ? String(reference[0]) : String(reference);
        const paystackResponse = await (paystack as any).transaction.verify(referenceStr);
        if (paystackResponse.data.status !== 'success') {
            throw new ValidationError('Payment verification failed');
        }
        const parts = referenceStr.split('_');
        if (parts.length < 2) {
            throw new ValidationError('Invalid payment reference format');
        }
        const orderIdFromRef = parts[1];
        const order = await prisma.orders.update({
            where: { id: orderIdFromRef },
            data: { orderStatus: 'PAID' } as unknown as Prisma.ordersUpdateInput,
        });
        res.status(200).json(order);
    } catch (error) {
        return next(error);
    }
};

export const sendOrderConfirmationEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderId, email } = req.body;
        if (!orderId || !email) {
            throw new ValidationError('Order ID and email are required');
        }
        const order = await prisma.orders.findUnique({
            where: { id: String(orderId) },
        });
        if (!order) {
            throw new ValidationError('Order not found');
        }

            // Build the order object for the email template
            const orderObj = {
                id: order.id,
                totalAmount: order.totalAmount,
                status: order.status,
                createdAt: order.createdAt,
                customerName: order.customerName,
                email,
                items: order.products,
                shippingAddress: order.shippingAddress,
            };

            // Send templated email using send-email module
            try {
                const sent = await sendEmail(email, `Order confirmation — ${orderObj.id}`, 'order-comfirmation-email', { order: orderObj });
                if (!sent) {
                    console.warn('Failed to send order email for', orderObj.id);
                    return res.status(201).json({ ok: true, orderId: orderObj.id, emailSent: false });
                }
                return res.status(201).json({ ok: true, orderId: orderObj.id, emailSent: true });
            } catch (err: any) {
                console.error('Error sending order email', err);
                return res.status(201).json({ ok: true, orderId: orderObj.id, emailSent: false, error: String(err?.message || err) });
            }
    } catch (error) {
        return next(error);
    }
};

export const getShopsAudit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Optional query params:
        // - ids: comma-separated list of shop ids to inspect
        // - limit: number of records to return when scanning shops with missing sellerId (default 100)
        const idsParam = req.query.ids as string | undefined;
        const limitParam = Number(req.query.limit || 100);

        if (idsParam) {
            const ids = idsParam.split(',').map(s => String(s).trim()).filter(Boolean);
            const shops = await prisma.shops.findMany({ where: { id: { in: ids } } as any });
            const result = shops.map((s: any) => ({ id: s.id, sellerId: s.sellerId ?? null, keys: Object.keys(s) }));
            return res.status(200).json({ ok: true, count: result.length, shops: result });
        }

        // Otherwise scan for shops missing sellerId (or with null/empty)
        const shops = await prisma.shops.findMany({ where: { sellerId: null } as any, take: Math.max(1, Math.min(1000, limitParam)) });
        const result = shops.map((s: any) => ({ id: s.id, sellerId: s.sellerId ?? null, keys: Object.keys(s) }));
        return res.status(200).json({ ok: true, count: result.length, shops: result });
    } catch (error) {
        return next(error);
    }
};


