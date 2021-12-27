import express from 'express';
import productController from "../controllers/product.controller.js";

const router = express.Router();

router.get('/', productController.getAllProducts)
router.post('/', productController.createProduct)
router.put('/:id', productController.updateProduct)
router.delete('/:id', productController.deleteProduct)
router.get('/:id', productController.getProductById)

export default router;