import ErrorHandler from "../utils/handlerError.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import User from "../models/user.model.js";
import { hashPassword, updateResetPasswordToken, passwordCompare, verifyJWT, addUser, checkAccountActive, sendMail, checkGmailExist, findUser } from "./user.js";
import sendToken from "../utils/jwtToken.js";

const userController = {
    signUp: catchAsyncError(async (req, res, next) => {
        const { name, email, password } = req.body;
        let passwordHashed = null, verify = null;

        if (!email || !password || !name) return next(new ErrorHandler(`Please fill in all the required fields`));

        const user = await User.findOne({ email })
        if (user) return next(new ErrorHandler(`Email: ${user.email} is already exist`, 404));

        try {
            const check = await checkGmailExist(email)

            if (!check) return next(new ErrorHandler(`Your gmail account does not exist`, 404));

            passwordHashed = await hashPassword(req.body, res);

            let user = await addUser(req.body, passwordHashed)

            await sendToken(email, res, `Sign Up success. An email has been sent to ${email}. Please login to your gmail & active :)`, 200)

            const { token } = req.cookies;

            if (!token) return next(new ErrorHandler(`Please login first`, 400));

            user = await verifyJWT(token, next)// reasign user from token 

            await sendMail(email, next, user.tokenForSignup, 'to active your account')

        } catch (e) {
            console.log(e);
        }
    }),
    logIn: catchAsyncError(async (req, res, next) => {
        const { email, password } = req.body;
        let resultCompare = null;

        if (!email || !password) return next(new ErrorHandler(`Please enter email and password`, 404))

        const user = await User.findOne({ email }).select("+password")

        if (!user) return next(new ErrorHandler(`Invalid email or password`, 404))

        const passwordHashed = user.password;

        // const check = await checkAccountActive(email, res)

        try {
            await passwordCompare(req.body, passwordHashed, next);

            await checkAccountActive(email, res, next)

            await updateResetPasswordToken(email, next)

        } catch (error) {
            console.log(error)
        }
    }),
    logOut: catchAsyncError(async (req, res, next) => {
        // console.log(req.cookies)
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true
        })
        return res.status(200).json({ success: true, message: 'Logout success' })
    }),
    getAllUsers: catchAsyncError(async (req, res, next) => {
        const user = await User.find({})

        if (!user) return next(new ErrorHandler(`There is no user in the database`, 400))

        res.status(200).json({ success: true, user })
    }),
    verifyEmail: catchAsyncError(async (req, res, next) => {

        const { token } = req.cookies;
        const { verifyCode } = req.body;
        if (!token) return next(new ErrorHandler(`You haven't login yet`, 400))

        // console.log(email)

        const user = await verifyJWT(token, next)

        if (user.tokenForSignup !== verifyCode.toString()) return next(new ErrorHandler(`You have enter the wrong code`, 500));

        const verifySuccess = await User.findOneAndUpdate({ email: user.email }, { $set: { active: true } }, { new: true })

        if (!verifySuccess) return next(new ErrorHandler(`Can't verify your account`, 400))

        return res.status(200).json({ message: `Verify account successfully` })
    })
    ,
    forgotPassword: catchAsyncError(async (req, res, next) => {
        const { email, resetCode } = req.body;

        const user = await findUser(email, next)

        // console.log({ user })

        updateResetPasswordToken(email)
        const response = await sendMail(email, next, user.resetPasswordToken, 'to reset your password')
        // return { success: true, message: `A reset pass code was sent to ${email}` }
        // return res.status(200).json({ success: true, message: `A reset code has been sent to ${email}` })


    })
}

export default userController;