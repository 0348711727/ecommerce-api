import ErrorHandler from "../utils/handlerError.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import User from "../models/user.model.js";
import { hashPassword, updateResetPasswordToken, passwordCompare } from "./user.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

// import sendToken from "../utils/jwtToken.js";

const userController = {
    signUp: catchAsyncError(async (req, res, next) => {
        const { name, email, password } = req.body;

        if (!email || !password || !name) return next(new ErrorHandler(`Please fill in all the required fields`));

        const user = await User.findOne({ email })
        if (user) return next(new ErrorHandler(`Email: ${user.email} is already exist`, 404));

        hashPassword(req.body, res)

    }),
    logIn: catchAsyncError(async (req, res, next) => {
        const { email, password } = req.body;

        if (!email || !password) return next(new ErrorHandler(`Please enter email and password`, 404))

        const user = await User.findOne({ email }).select("+password")

        if (!user) return next(new ErrorHandler(`Invalid email or password`, 404))

        const passwordHashed = user.password;

        // const check = await checkAccountActive(email, res)

        passwordCompare(req.body, passwordHashed, res, next)

        // checkAccountActive(req.body, passwordHashed, res, next)

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
        async function verify() {
            let email = 'coccc1999@gmail.com'
            let smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'Quangbrave21@gmail.com',
                    pass: 'ocbgwldtvylitxda' //mật khẩu ứng dụng của gmail
                },
            });
            var mailOptions = {
                from: 'Quangbrave21@gmail.com',
                to: email,
                subject: ' | new message !',
                text: "message"
            }
            smtpTransport.sendMail(mailOptions, async (error, response) => {
                if (error) return next(new ErrorHandler(`Can't send code to your email`))

                const verifySuccess = await User.findOneAndUpdate({ email }, { $set: { active: true } }, { new: true })

                if (!verifySuccess) return next(new ErrorHandler(`A verify code has been send to ${email}, please login to receive this code ! :) `, 400))
                return res.json({ message: `Verify successfully` })

            });
        }
        verify();
    })
    ,
    forgotPassword: catchAsyncError(async (req, res, next) => {
        const { email, password } = req.body;

        const user = await User.find({ email })

        if (!user) return next(new ErrorHandler(`Email does not exist`, 400))



        console.log(user[0].lastpassword)

        if (user[0].lastpassword === null || user[0].lastpassword.includes(req.body.password)) return next(new ErrorHandler(`abc`))

        updateResetPasswordToken(email)
        return res.status(200).json(user)
    })
}

export default userController;