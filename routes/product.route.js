import express from 'express';
import productController from "../controllers/product.controller.js";
import { isAuthenticated, authorizeRole } from "../middleware/auth.js";
const router = express.Router();

router.get('/', isAuthenticated, authorizeRole('admin'), productController.getAllProducts)
router.post('/', isAuthenticated, authorizeRole('admin'), productController.createProduct)
router.put('/:id', isAuthenticated, authorizeRole('admin'), productController.updateProduct)
router.delete('/:id', isAuthenticated, authorizeRole('admin'), productController.deleteProduct)
router.get('/:id', isAuthenticated, authorizeRole('admin'), productController.getProductById)

export default router;