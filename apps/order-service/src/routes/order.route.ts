import express from 'express';
import { initiatePayment, verifyPayment, updateOrderStatus, createOrder, getUserOrders, getOrder, getShopOrders, getOrders, getShopsAudit } from '../controllers/order-controller';
import isAuthenticated from '../../../../packages/middleware/isAuthenticated';


const router = express.Router();

router.get('/get-order/:id',isAuthenticated, getOrder);
// Support GET /api/orders to return current user's orders (proxied from gateway /orders)
router.get('/orders', isAuthenticated, getOrders);
// Support POST /api/orders (proxied from gateway POST /orders) as an alias
// for createOrder so clients can POST to /orders through the gateway.
router.post('/orders', isAuthenticated, createOrder);
router.get('/get-user-orders/:userId',isAuthenticated, getUserOrders);
router.get('/get-shop-orders', isAuthenticated, getShopOrders);
router.post('/create-order',isAuthenticated, createOrder);
// Development helper: allow unauthenticated order creation when DEV_ALLOW_UNAUTH=true
router.post('/dev-create-order', (req, res, next) => {
	if (process.env.DEV_ALLOW_UNAUTH !== 'true') {
		return res.status(403).json({ message: 'Dev unauth endpoint disabled. Set DEV_ALLOW_UNAUTH=true to enable.' });
	}
	return createOrder(req as any, res as any, next as any);
});
router.put('/update-order-status/:id',isAuthenticated, updateOrderStatus);
router.post('/initiate-payment',isAuthenticated, initiatePayment);
router.post('/verify-payment',isAuthenticated, verifyPayment);
router.get('/shops-audit', isAuthenticated, getShopsAudit);


export default router;