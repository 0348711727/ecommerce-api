import ErrorHandler from "../utils/handlerError.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import User from "../models/user.model.js";
import { hashPassword, updateResetPasswordToken, passwordCompare, verifyJWT, addUser, checkAccountActive, sendMail, checkGmailExist, findUser } from "./user.js";
import sendToken from "../utils/jwtToken.js";

const userController = {
    signUp: catchAsyncError(async (req, res, next) => {
        const { name, email, password } = req.body;
        let passwordHashed = null;

        if (!email || !password || !name) return next(new ErrorHandler(`Please fill in all the required fields`));

        const user = await User.findOne({ email })
        if (user) return next(new ErrorHandler(`Email: ${user.email} is already exist`, 404));

        try {
            const check = await checkGmailExist(email)

            if (!check) return next(new ErrorHandler(`Your Google Gmail account does not exist`, 404));

            passwordHashed = await hashPassword(password);

            let user = await addUser(req.body, passwordHashed)

            await sendToken(email, res)

            // const { token } = req.cookies;

            // if (!token) return next(new ErrorHandler(`Please login first`, 400));

            // user = await verifyJWT(token, next)// reasign user from token

            const sendMailRes = await sendMail(email, next, user.tokenForSignup, `to activate your account`)

            return res.status(200).json({ sendMailRes })
        } catch (e) {
            console.log(e);
        }
    }),
    logIn: catchAsyncError(async (req, res, next) => {
        const { email, password } = req.body;

        try {
            if (!email || !password) return next(new ErrorHandler(`Please enter email and password`, 404))

            const user = await User.findOne({ email }).select("+password")

            if (!user) return next(new ErrorHandler(`Invalid email or password`, 404))

            const passwordHashed = user.password;

            await passwordCompare(req.body, passwordHashed, next);

            const isActive = await checkAccountActive(user.active, next)

            if (!isActive) return next(new ErrorHandler(`Account is not active yet, please active your account first`, 400))

            await sendToken(email, res)

            await updateResetPasswordToken(email, user.tokenResetPass)

            return res.status(200).json({ success: true, message: 'Login successfully', user })
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

        const user = await verifyJWT(token, next)

        if (user.tokenForSignup !== String(verifyCode)) return next(new ErrorHandler(`You have enter the wrong code`, 500));

        const verifySuccess = await User.findOneAndUpdate({ email: user.email }, { $set: { active: true } }, { new: true })

        if (!verifySuccess) return next(new ErrorHandler(`Can't verify your account`, 400))

        return res.status(200).json({ message: `Verify account successfully` })
    })
    ,
    forgotPassword: catchAsyncError(async (req, res, next) => {
        const { email } = req.body;

        try {
            const user = await findUser(email, next)

            if (user) {

                await sendMail(email, next, user.tokenResetPass, 'to reset your password')

                await updateResetPasswordToken(email, user.tokenResetPass, next)

                await updateNewPassword(email)

                return res.status(200).json({ success: true, message: `A reset code has been sent to ${email}` })
            }
        } catch (error) {
            console.log(error)
        }
    }),
    updateNewPassword: (email) => catchAsyncError(async (req, res, next) => {
        const { resetCode } = req.body
        let newPasswordHashed = null;
        // console.log(email)
        const user = await findUser(email, next) //1

        if (user.resetPasswordToken !== resetCode) return next(new ErrorHandler(`Your reset code is not right`, 400)) //3

        newPasswordHashed = await hashPassword(newPassword)

        const changePass = await User.findOneAndUpdate({ email },
            {
                $set: { password: newPasswordHashed }
            }, { new: true }, (error, result) => {
                if (error) return next(new ErrorHandler(`Can't change password`, 404)) //4
            }).clone()
        // console.log({ changePass })
        return res.status(200).json({ success: true, message: 'Password changed' })
    }),
    getUserDetails: catchAsyncError(async (req, res, next) => {
        // console.log(req.user)
    })
}

export default userController;