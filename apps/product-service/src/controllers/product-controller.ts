

import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../../../packages/error-handler';
import prisma from '../../../../packages/libs/prisma';
import { imagekit } from '../../../../packages/libs/imagekit';


export const getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const config = await prisma.site_config.findFirst();

        if (!config) {
            return res.status(404).json({ message: 'Site configuration not found' });
        }
        return res.status(200).json({
            categories: config.categories,
            subCategories: config.subCategories
        });
    } catch (error) {
        return next(error)
    }
};

export const createDiscountCode = async (
    req:any,
    res: Response,
    next: NextFunction
) => {
    try {
        const { public_name, discountType, discountValue, discountCode } = req.body;

        const isDiscountCodeExists = await prisma.discountCodes.findUnique({
            where: {
                discountCode
            }
        });
        if (isDiscountCodeExists) {
            return next(
                new ValidationError(
                    'Discount code already exists',
                )
            )
        }

        const newDiscountCode = await prisma.discountCodes.create({
            data: {
                public_name,
                discountType,
                discountValue: parseFloat(discountValue),
                discountCode,
                sellerId: req.seller?.id,
            }
        });

        return res.status(201).json(newDiscountCode);
    } catch (error) {
        return next(error)
    }
};

export const getDiscountCodes = async (
    req:any,
    res: Response,
    next: NextFunction
) => {
    try {
        const discountCodes = await prisma.discountCodes.findMany({
            where: {
                sellerId: req.seller?.id
            }
        });
        return res.status(200).json(discountCodes);
    } catch (error) {
        return next(error);
    }
};

export const deleteDiscountCode = async (
    req:any,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const sellerId = req.seller?.id;

        const discountCode = await prisma.discountCodes.findUnique({
            where: {
                id
            },
            select: { id: true, sellerId: true }
        });

        if (!discountCode) {
            return next(new ValidationError('Discount code not found'));
        }

        if (discountCode.sellerId !== sellerId) {
            return next(new ValidationError('Unauthorized to delete this discount code'));
        }
        await prisma.discountCodes.delete({
            where: {
                id
            }
        });

        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
};

export const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileName } = req.body;

        // Normalize the imported imagekit module to obtain the actual client instance
        let client: any = imagekit as any;

        // Common interop shapes to check
        if (client && client.default && typeof client.default.upload === 'function') {
            client = client.default;
        } else if (client && client.imagekit && typeof client.imagekit.upload === 'function') {
            client = client.imagekit;
        }

        if (!client) {
            console.error('ImageKit module is falsy:', imagekit);
            throw new Error('ImageKit client not initialized');
        }

        // Try several possible upload method locations depending on SDK version
        let uploadFn: ((opts: any) => Promise<any>) | undefined;
        let usedMethod = '';

        if (typeof client.upload === 'function') {
            uploadFn = (opts: any) => (client as any).upload(opts);
            usedMethod = 'client.upload';
        } else if (client.files && typeof client.files.upload === 'function') {
            uploadFn = (opts: any) => (client as any).files.upload(opts);
            usedMethod = 'client.files.upload';
        } else if (client.files && typeof client.files.uploadFile === 'function') {
            uploadFn = (opts: any) => (client as any).files.uploadFile(opts);
            usedMethod = 'client.files.uploadFile';
        } else if (typeof (client as any).uploadFile === 'function') {
            uploadFn = (opts: any) => (client as any).uploadFile(opts);
            usedMethod = 'client.uploadFile';
        }

        if (!uploadFn) {
            console.error('ImageKit client upload method not found. module:', imagekit);
            throw new Error('ImageKit client upload method not available');
        }

        console.debug('Using ImageKit upload method:', usedMethod);

        const response = await uploadFn({
            file: fileName,
            fileName: `product-${Date.now()}.jpg`,
            folder: '/product',
        });

        res.status(201).json({
            file_url: response.url,
            fileId: response.fileId,
        });
    } catch (error) {
        console.error('uploadProductImage error:', (error as any)?.message || error);
        next(error);
    }
};

export const transformProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { imageUrl, effect } = req.body;
        if (!imageUrl || !effect) {
            return res.status(400).json({ message: 'imageUrl and effect are required' });
        }

        // remove any existing tr= parameters to avoid duplicate/stacked transforms
        const cleaned = (imageUrl as string).replace(/[?&]tr=[^&?]*/g, '');
        const separator = cleaned.includes('?') ? '&' : '?';
        const transformedUrl = `${cleaned}${separator}tr=${encodeURIComponent(effect)}`;

        // helper that performs a HEAD request with timeout and returns ok/status/contentType
        const headCheck = async (url: string, timeoutMs = 7000): Promise<{ ok: boolean; status: number; contentType: string | null }> => {
            const controller = new AbortController();
            const id = setTimeout(() => (controller as any).abort('timeout'), timeoutMs);
            try {
                const resp = await fetch(url, { method: 'HEAD', signal: controller.signal });
                clearTimeout(id);
                const ct = resp.headers.get('content-type');
                return { ok: resp.ok, status: resp.status, contentType: ct };
            } catch (err) {
                clearTimeout(id);
                return { ok: false, status: 0, contentType: null };
            }
        };

        // first quick check (short timeout)
        const first = await headCheck(transformedUrl, 8000);
        if (first.ok && first.contentType && first.contentType.startsWith('image/')) {
            return res.status(200).json({ transformedUrl });
        }
        if (first.status === 403) {
            console.error('ImageKit HEAD returned 403 for transform (extensions may be limited)', { effect, transformedUrl });
            return res.status(422).json({ message: 'ImageKit extensions limit exceeded', effect, transformedUrl });
        }

        // retry once with longer timeout
        const second = await headCheck(transformedUrl, 12000);
        if (second.ok && second.contentType && second.contentType.startsWith('image/')) {
            return res.status(200).json({ transformedUrl });
        }
        if (second.status === 403) {
            console.error('ImageKit HEAD (retry) returned 403 for transform (extensions may be limited)', { effect, transformedUrl });
            return res.status(422).json({ message: 'ImageKit extensions limit exceeded', effect, transformedUrl });
        }

        // final diagnostic GET attempts (try a couple times with longer timeout to avoid transient 504s)
        const maxGetAttempts = 2;
        let lastErr: any = null;
        for (let attempt = 1; attempt <= maxGetAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const id = setTimeout(() => (controller as any).abort('timeout-final'), 15000);
                const resp = await fetch(transformedUrl, { method: 'GET', signal: controller.signal });
                clearTimeout(id);
                const bodyText = await resp.text().catch(() => '<no body>');
                const ct = resp.headers.get('content-type') || null;
                // capture upstream headers (ImageKit sets helpful headers like `ik-error`)
                const headersObj: Record<string, string> = {};
                resp.headers.forEach((v, k) => {
                    headersObj[k] = v;
                });

                console.error('ImageKit transform GET result', { attempt, status: resp.status, contentType: ct, body: bodyText, headers: headersObj });

                if (resp.status === 403 && /extensions limit/i.test(bodyText)) {
                    return res.status(422).json({ message: 'ImageKit extensions limit exceeded', effect, transformedUrl, details: { status: resp.status, body: bodyText, headers: headersObj } });
                }

                if (ct && ct.startsWith('image/')) {
                    // Successful image response (GET returned image body) — return transformedUrl
                    return res.status(200).json({ transformedUrl });
                }

                return res.status(422).json({ message: 'Upstream returned non-image content', details: { status: resp.status, contentType: ct, body: bodyText, headers: headersObj } });
            } catch (err) {
                lastErr = err;
                console.error(`ImageKit transform GET attempt ${attempt} failed`, err);
            }
        }

        // All GET attempts failed — determine if timeout/abort was the likely cause
        const isAbort = (lastErr as any)?.name === 'AbortError' || String(lastErr).toLowerCase().includes('timeout');
        if (isAbort) return res.status(504).json({ message: 'Upstream timed out', details: { lastError: String(lastErr) } });
        return res.status(502).json({ message: 'Transformation failed or timed out', details: { lastError: String(lastErr) } });
    } catch (error) {
        return next(error);
    }
};

export const deleteProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileId } = req.body;

        // Normalize the imported imagekit module to obtain the actual client instance
        let client: any = imagekit as any;

        // Common interop shapes to check
        if (client && client.default && typeof client.default.deleteFile === 'function') {
            client = client.default;
        } else if (client && client.imagekit && typeof client.imagekit.deleteFile === 'function') {
            client = client.imagekit;
        }

        if (!client) {
            console.error('ImageKit module is falsy:', imagekit);
            throw new Error('ImageKit client not initialized');
        }

        // Try several possible delete method locations depending on SDK version
        let deleteFn: ((id: string) => Promise<any>) | undefined;
        let usedMethod = '';

        if (typeof client.deleteFile === 'function') {
            deleteFn = (id: string) => (client as any).deleteFile(id);
            usedMethod = 'client.deleteFile';
        } else if (client.files && typeof client.files.delete === 'function') {
            deleteFn = (id: string) => (client as any).files.delete(id);
            usedMethod = 'client.files.delete';
        } else if (client.files && typeof client.files.deleteFile === 'function') {
            deleteFn = (id: string) => (client as any).files.deleteFile(id);
            usedMethod = 'client.files.deleteFile';
        } else if (typeof (client as any).deleteById === 'function') {
            deleteFn = (id: string) => (client as any).deleteById(id);
            usedMethod = 'client.deleteById';
        }

        if (!deleteFn) {
            console.error('ImageKit client delete method not found. module:', imagekit);
            throw new Error('ImageKit client delete method not available');
        }

        console.debug('Using ImageKit delete method:', usedMethod);

        const response = await deleteFn(fileId);

        res.status(200).json({
            success: true,
            response,
        });
    } catch (error) {
        console.error('deleteProductImage error:', (error as any)?.message || error);
        next(error);
    }
}

export const createProduct = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            title, 
            short_description,
            detailed_description,
            warranty,
            custom_specifications,
            slug,
            tags,
            cash_on_delivery,
            brand,
            video_url,
            category,
            colors = [],
            sizes = [],
            discountCodes,
            stock,
            sale_price,
            regular_price,
            subCategory,
            customProperties = {},
            images = [],
    } = req.body;

    // Accept either `subCategory` (camelCase) or `subcategory` (snake/lower) from clients
    const resolvedSubCategory = subCategory ?? (req.body as any).subcategory;

        // More robust required-field checks. Avoid treating 0 or empty arrays as missing
        const missing: string[] = [];
        if (!title || String(title).trim() === '') missing.push('title');
        if (!short_description || String(short_description).trim() === '') missing.push('short_description');
        if (!slug || String(slug).trim() === '') missing.push('slug');
        if (!tags || (Array.isArray(tags) ? tags.length === 0 : String(tags).trim() === '')) missing.push('tags');
        if (!brand || String(brand).trim() === '') missing.push('brand');
    if (!category || String(category).trim() === '') missing.push('category');
    if (!resolvedSubCategory || String(resolvedSubCategory).trim() === '') missing.push('subCategory');
        // numeric fields: ensure they are provided and valid numbers
        if (stock === undefined || stock === null || stock === '' || isNaN(Number(stock))) missing.push('stock');
        if (sale_price === undefined || sale_price === null || sale_price === '' || isNaN(Number(sale_price))) missing.push('sale_price');
        if (regular_price === undefined || regular_price === null || regular_price === '' || isNaN(Number(regular_price))) missing.push('regular_price');
        // images must be an array with at least one valid image
        if (!Array.isArray(images) || images.length === 0) missing.push('images');

        if (missing.length > 0) {
            return next(new ValidationError(`missing required field(s): ${missing.join(', ')}`));
        }

        // Defensive check: req.seller may be undefined when the auth middleware
        // did not populate it. Use optional chaining to avoid a crash and
        // return a ValidationError that will be handled by the error middleware.
        if (!req.seller?.id) {
            return next(new ValidationError("Only seller can create products!"));
        }

        const slugChecking = await prisma.products.findUnique({
            where: {
                slug,
            }
        });

        if (slugChecking) {
            return next(
                new ValidationError("Slug already exist! Please use a different slug ")
            )
        }

        // Try to create product with nested images. If we hit a unique constraint
        // (P2002) while creating images (this can happen if DB has unique indexes
        // on image foreign keys), fall back to creating the product first and
        // then create images separately (skipping any image inserts that fail).
        let newProduct: any = null;
        try {
            newProduct = await prisma.products.create({
                data: {
                    title,
                    short_description,
                    detailed_description,
                    warranty,
                    cashOnDelivery: cash_on_delivery,
                    slug,
                    shopId: req.seller?.shop?.id!,
                    tags: Array.isArray(tags) ? tags : tags.split(","),
                    brand,
                    video_url,
                    category,
                    subCategory: resolvedSubCategory,
                    colors: colors || [],
                    discount_codes: Array.isArray(discountCodes) ? discountCodes.map((codeId:string) => codeId) : [],
                    sizes: sizes || [],
                    stock: parseInt(stock),
                    sale_price: parseFloat(sale_price),
                    regular_price: parseFloat(regular_price),
                    custom_properties: customProperties || {},
                    custom_specifications: custom_specifications || {},
                    images: {
                        create: Array.isArray(images)
                            ? images
                                .filter((image:any) => image && image.fileId && image.file_url)
                                .map((image:any) => ({
                                    file_id: image.fileId,
                                    url: image.file_url,
                                }))
                            : []
                    }
                },
                include: { images: true },
            });
        } catch (err: any) {
            // If unique constraint failed when creating nested images, fall back.
            if (err?.code === 'P2002') {
                console.warn('Prisma unique constraint during nested create, falling back to two-step create', err.meta || err);
                // Create product without images
                newProduct = await prisma.products.create({
                    data: {
                        title,
                        short_description,
                        detailed_description,
                        warranty,
                        cashOnDelivery: cash_on_delivery,
                        slug,
                        shopId: req.seller?.shop?.id!,
                        tags: Array.isArray(tags) ? tags : tags.split(","),
                        brand,
                        video_url,
                        category,
                        subCategory: resolvedSubCategory,
                        colors: colors || [],
                        discount_codes: Array.isArray(discountCodes) ? discountCodes.map((codeId:string) => codeId) : [],
                        sizes: sizes || [],
                        stock: parseInt(stock),
                        sale_price: parseFloat(sale_price),
                        regular_price: parseFloat(regular_price),
                        custom_properties: customProperties || {},
                        custom_specifications: custom_specifications || {},
                    },
                });

                // Try to insert images one-by-one, skipping ones that fail (e.g., unique index)
                if (Array.isArray(images)) {
                    for (const image of images.filter((i:any) => i && i.fileId && i.file_url)) {
                        try {
                            await prisma.images.create({
                                data: {
                                    file_id: image.fileId,
                                    url: image.file_url,
                                    productId: newProduct.id,
                                }
                            });
                        } catch (imgErr: any) {
                            console.warn('Failed to create image for product (skipping)', imgErr?.code || imgErr);
                        }
                    }
                }

                // Reload product with images (whatever succeeded)
                newProduct = await prisma.products.findUnique({ where: { id: newProduct.id }, include: { images: true } });
            } else {
                throw err;
            }
        }

        res.status(201).json({ success: true, newProduct });
    } catch (error) {
        next(error)
    }
}

export const getShopProducts = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.seller?.shop?.id) {
            return next(new ValidationError("Only seller can access their products!"));
        }

        const products = await prisma.products.findMany({
            where: {
                shopId: req.seller.shop.id,
                isDeleted: false,
            },
            include: { images: true },
        });

        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        next(error);
    }
}

export const deleteProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!req.seller?.shop?.id) {
            return next(new ValidationError('Only seller can delete products'));
        }

        // Ensure the product belongs to the seller's shop
        const product = await prisma.products.findUnique({ where: { id } });
        if (!product) {
            return next(new ValidationError('Product not found'));
        }
        if (product.shopId !== req.seller.shop.id) {
            return next(new ValidationError('Unauthorized to delete this product'));
        }

        // Soft-delete: mark isDeleted true and set deletedAt
        await prisma.products.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });

        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
}

export const getProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const product = await prisma.products.findUnique({ where: { id }, include: { images: true } });
        if (!product) return next(new ValidationError('Product not found'));

        // ensure ownership: only seller who owns the shop can access
        if (!req.seller?.shop?.id || product.shopId !== req.seller.shop.id) {
            return next(new ValidationError('Unauthorized to access this product'));
        }

        return res.status(200).json({ success: true, product });
    } catch (error) {
        return next(error);
    }
}

export const updateProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const existing = await prisma.products.findUnique({ where: { id }, include: { images: true } });
        if (!existing) return next(new ValidationError('Product not found'));

        if (!req.seller?.shop?.id || existing.shopId !== req.seller.shop.id) {
            return next(new ValidationError('Unauthorized to edit this product'));
        }
        // Merge incoming fields with existing product so partial updates keep previously stored values
        const body = req.body || {};

        const merged: any = {
            title: body.title ?? existing.title,
            short_description: body.short_description ?? existing.short_description,
            detailed_description: body.detailed_description ?? existing.detailed_description,
            warranty: body.warranty ?? existing.warranty,
            cashOnDelivery: body.cash_on_delivery ?? existing.cashOnDelivery,
            slug: body.slug ?? existing.slug,
            tags: body.tags !== undefined ? (Array.isArray(body.tags) ? body.tags : String(body.tags).split(',')) : existing.tags,
            brand: body.brand ?? existing.brand,
            video_url: body.video_url ?? existing.video_url,
            category: body.category ?? existing.category,
            subCategory: body.subCategory ?? existing.subCategory,
            colors: body.colors ?? existing.colors ?? [],
            discount_codes: body.discountCodes !== undefined ? (Array.isArray(body.discountCodes) ? body.discountCodes : []) : existing.discount_codes ?? [],
            sizes: body.sizes ?? existing.sizes ?? [],
            stock: body.stock !== undefined && body.stock !== null && body.stock !== '' && !isNaN(Number(body.stock)) ? parseInt(body.stock) : existing.stock,
            sale_price: body.sale_price !== undefined && body.sale_price !== null && body.sale_price !== '' && !isNaN(Number(body.sale_price)) ? parseFloat(body.sale_price) : existing.sale_price,
            regular_price: body.regular_price !== undefined && body.regular_price !== null && body.regular_price !== '' && !isNaN(Number(body.regular_price)) ? parseFloat(body.regular_price) : existing.regular_price,
            custom_properties: body.customProperties ?? existing.custom_properties ?? {},
            custom_specifications: body.custom_specifications ?? existing.custom_specifications ?? {},
        };

        // basic post-merge validation to ensure required fields still exist
        const missing: string[] = [];
        if (!merged.title || String(merged.title).trim() === '') missing.push('title');
        if (!merged.short_description || String(merged.short_description).trim() === '') missing.push('short_description');
        if (!merged.slug || String(merged.slug).trim() === '') missing.push('slug');
        if (!merged.tags || (Array.isArray(merged.tags) ? merged.tags.length === 0 : String(merged.tags).trim() === '')) missing.push('tags');
        if (!merged.brand || String(merged.brand).trim() === '') missing.push('brand');
        if (!merged.category || String(merged.category).trim() === '') missing.push('category');
        if (!merged.subCategory || String(merged.subCategory).trim() === '') missing.push('subCategory');
        if (merged.stock === undefined || merged.stock === null || merged.stock === '' || isNaN(Number(merged.stock))) missing.push('stock');
        if (merged.sale_price === undefined || merged.sale_price === null || merged.sale_price === '' || isNaN(Number(merged.sale_price))) missing.push('sale_price');
        if (merged.regular_price === undefined || merged.regular_price === null || merged.regular_price === '' || isNaN(Number(merged.regular_price))) missing.push('regular_price');

        if (missing.length > 0) {
            return next(new ValidationError(`missing required field(s): ${missing.join(', ')}`));
        }

        // perform update with merged values
        await prisma.products.update({
            where: { id },
            data: {
                title: merged.title,
                short_description: merged.short_description,
                detailed_description: merged.detailed_description,
                warranty: merged.warranty,
                cashOnDelivery: merged.cashOnDelivery,
                slug: merged.slug,
                tags: merged.tags,
                brand: merged.brand,
                video_url: merged.video_url,
                category: merged.category,
                subCategory: merged.subCategory,
                colors: merged.colors,
                discount_codes: merged.discount_codes,
                sizes: merged.sizes,
                stock: merged.stock,
                sale_price: merged.sale_price,
                regular_price: merged.regular_price,
                custom_properties: merged.custom_properties,
                custom_specifications: merged.custom_specifications,
            }
        });

        // handle images replacement only if images supplied in body
        if (Object.prototype.hasOwnProperty.call(body, 'images') && Array.isArray(body.images)) {
            const images = body.images;
            try {
                await prisma.images.deleteMany({ where: { productId: id } });
            } catch (e) {
                console.warn('Failed to delete existing images during update', (e as any)?.message || e);
            }

            for (const image of images.filter((i:any) => i && i.fileId && i.file_url)) {
                try {
                    await prisma.images.create({ data: { file_id: image.fileId, url: image.file_url, productId: id } });
                } catch (imgErr) {
                    console.warn('Failed to create image during update (skipping)', (imgErr as any)?.message || imgErr);
                }
            }
        }

        const updated = await prisma.products.findUnique({ where: { id }, include: { images: true } });

        return res.status(200).json({ success: true, product: updated });
    } catch (error) {
        return next(error);
    }
}