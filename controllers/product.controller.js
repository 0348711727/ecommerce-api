import Product from "../models/product.model.js";
import ErrorHandler from "../utils/handlerError.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import ApiFeatures from "../utils/apiFeatures.js";

const productController = {
    getAllProducts: catchAsyncError(async (req, res, next) => { //use catchAsyncError so we don't have to use try catch

        const productPage = 5;
        const apiFeatures = new ApiFeatures(Product.find(), req.query)
            .search()//localhost:5000/api/product?name="abc" 
            .filter()
            .pagination(productPage);
        // const product = await Product.find({});
        const product = await apiFeatures.query;
        //useMiddleware
        // if (!productsFound) return res.status(404).json({ success: false, message: 'Product not found' })
        // if (!product) return next(new ErrorHandler(`Product not found with id ${id}`, 404))

        return res.status(200).json({ success: true, product })
    }),
    //create Product with admin role
    createProduct: catchAsyncError(async (req, res, next) => {

        req.body.user = req.user.id;

        const product = await Product.create(req.body)

        return res.status(200).json({ success: true, message: "Product created successfully", product })
    }),
    updateProduct: catchAsyncError(async (req, res, next) => {
        const id = req.params.id;
        let product = await Product.findById(id)

        if (!product) return next(new ErrorHandler(`Product not found with id ${id}`, 404))

        product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true, useFindAndModify: false })

        return res.status(200).json({ success: true, product })
    }),
    deleteProduct: catchAsyncError(async (req, res, next) => {
        const id = req.params.id;
        let product = await Product.findById(id)

        if (!product) return next(new ErrorHandler(`Product not found with id ${id}`, 404))

        product = await Product.findByIdAndDelete(id)
    }),
    getProductById: catchAsyncError(async (req, res, next) => {
        const id = req.params.id;
        let product = await Product.findById(id)

        if (!product) return next(new ErrorHandler('Product not found', 404))

        return res.status(200).json({ success: true, message: `Product successfully found`, product })
    })
}

export default productController;