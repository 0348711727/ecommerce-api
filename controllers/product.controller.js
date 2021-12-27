import Product from "../models/product.model.js";
import ErrorHandler from "../utils/handlerError.js";

const productController = {
    getAllProducts: async (req, res, next) => {
        const product = await Product.find({});
        try {
            //useMiddleware
            // if (!productsFound) return res.status(404).json({ success: false, message: 'Product not found' })
            if (!product) return next(new ErrorHandler(`Product not found with id ${id}`, 404))

            return res.status(200).json({ success: true, productsFound })
        } catch (error) {
            console.log(error)
        }
    },
    createProduct: async (req, res, next) => {
        try {
            const product = await Product.create(req.body)

            return res.status(200).json({ success: true, message: "Product created successfully", product })
        } catch (error) {
            console.log(error)
        }
    },
    updateProduct: async (req, res, next) => {
        const id = req.params.id;
        try {
            let product = await Product.findById(id)

            //useMiddleware

            // if (!product) return res.status(404).json({ success: false, message: `Product not found with id ${id}` })
            if (!product) return next(new ErrorHandler(`Product not found with id ${id}`, 404))

            product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true, useFindAndModify: false })

            return res.status(200).json({ success: true, product })
        } catch (error) {
            console.log(error)
        }
    },
    deleteProduct: async (req, res, next) => {
        const id = req.params.id;
        try {
            let product = await Product.findById(id)

            //useMiddleware
            // if (!product) return res.status(404).json({ success: false, message: `Product not found with id ${id}` })
            if (!product) return next(new ErrorHandler(`Product not found with id ${id}`, 404))

            product = await Product.findByIdAndDelete(id)

            return res.status(200).json({ success: true, message: `Product successfully deleted`, product })
        } catch (error) {
            console.log(error)
        }
    },
    getProductById: async (req, res, next) => {
        const id = req.params.id;
        try {
            let product = await Product.findById(id)

            // if (!product) return res.status(404).json({ success: false, message: `Product not found with id ${id}` })
            //useMiddleware
            if (!product) return next(new ErrorHandler('Product not found', 404))

            return res.status(200).json({ success: true, message: `Product successfully found`, product })
        } catch (error) {
            console.log(error)
        }
    }
}

export default productController;