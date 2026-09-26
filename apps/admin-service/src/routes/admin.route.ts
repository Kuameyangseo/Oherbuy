import express from 'express'
import { getAdminProfile, loginAdmin, requireAdmin } from '../auth'
import {
  archiveProduct,
  createProduct,
  uploadProductImage,
  getDashboard,
  getProduct,
  listOrders,
  listProducts,
  listUsers,
  registerSeller,
  registerUser,
  deleteSeller,
  deleteUser,
  listSellers,
  restoreProduct,
  setProductStatus,
  updateProduct,
} from '../controllers/admin.controller'

const router = express.Router()

router.post('/auth/login', loginAdmin)
router.get('/auth/me', requireAdmin, getAdminProfile)

router.use(requireAdmin)
router.post('/products/upload-image', uploadProductImage)
router.get('/dashboard', getDashboard)
router.get('/products', listProducts)
router.post('/products', createProduct)
router.get('/products/:id', getProduct)
router.patch('/products/:id', updateProduct)
router.patch('/products/:id/status', setProductStatus)
router.post('/products/:id/archive', archiveProduct)
router.post('/products/:id/restore', restoreProduct)
router.get('/sellers', listSellers)
router.post('/sellers', registerSeller)
router.delete('/sellers/:id', deleteSeller)
router.get('/users', listUsers)
router.post('/users', registerUser)
router.delete('/users/:id', deleteUser)
router.get('/orders', listOrders)

export default router
