import ErrorHandler from "../utils/handlerError.js";
import catchAsyncError from "./catchAsyncError.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
export const isAuthenticated = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) return next(new ErrorHandler(`Please login to access this resource`, 404))

    const decoded = jwt.verify(token, process.env.SECRET_KEY)

    req.user = await User.findOne({ email: decoded.email })
    console.log(req.user.roles)
    next();
})
export const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.roles)) return next(new ErrorHandler(`Role ${req.user.roles} can't access this resource`, 400))

        next();
    }
}