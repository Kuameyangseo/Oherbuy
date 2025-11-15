import express from 'express';
import {
	createDiscountCode,
	deleteDiscountCode,
	deleteProductImage,
	getCategories,
	getDiscountCodes,
	uploadProductImage,
	transformProductImage,
	createProduct,
	getShopProducts,
	deleteProduct,
	getProduct,
	updateProduct,
} from '../controllers/product-controller';
import isAuthenticated from '../../../../packages/middleware/isAuthenticated';


const router = express.Router();

router.get('/get-categories',  getCategories) 
router.post('/create-discount-code', isAuthenticated, createDiscountCode)
router.get('/get-discount-codes', isAuthenticated, getDiscountCodes)
router.delete('/delete-discount-code/:id', isAuthenticated, deleteDiscountCode)
router.post('/upload-product-image', isAuthenticated, uploadProductImage)
router.post('/transform-product-image', transformProductImage)
router.delete("/delete-product-image", isAuthenticated, deleteProductImage)
router.delete('/delete-product/:id', isAuthenticated, deleteProduct)
router.post("/create-product", isAuthenticated, createProduct)
router.get("/get-shop-products", isAuthenticated, getShopProducts)
router.get('/get-product/:id', isAuthenticated, getProduct)
router.put('/update-product/:id', isAuthenticated, updateProduct)

export default router;
