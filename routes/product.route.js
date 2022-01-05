import express from 'express';
import productController from "../controllers/product.controller.js";
import { isAuthenticated, authorizeRole } from "../middleware/auth.js";
const router = express.Router();

router.get('/', isAuthenticated, authorizeRole('admin'), productController.getAllProducts)
router.post('/', isAuthenticated, productController.createProduct)
router.put('/:id', isAuthenticated, productController.updateProduct)
router.delete('/:id', isAuthenticated, productController.deleteProduct)
router.get('/:id', isAuthenticated, productController.getProductById)

export default router;