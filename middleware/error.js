import ErrorHandler from "../utils/handlerError.js";

const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';
    //wrong mongo id
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`
        err = new ErrorHandler(message, 404)
    }

    res.status(err.statusCode).json({
        success: false,
        error: err.message
    })
}
export default errorMiddleware;