import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/handlerError.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import emailExistence from "email-existence";
//sign up action
export async function hashPassword(props, res) {

    const { password } = props;

    return new Promise((resolve, reject) => {

        bcrypt.hash(password, 12, (err, result) => {

            if (err) reject(err);

            resolve(result);
        })
    })
}

export async function addUser(props, passwordHash) {
    const { name, email } = props;
    const newUser = new User({
        email,
        name,
        password: passwordHash,
        avatar: {
            public_id: 'avatar.sample',
            url: 'https://123456'
        },
        tokenForSignup: crypto.randomBytes(3).toString('hex'),
        resetPasswordToken: crypto.randomBytes(3).toString("hex") //gerenating password token

    })
    await newUser.save();
    return newUser;
}

export async function sendMail(email, next, token, subject) {

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
        subject: `This is an auto mail send ${subject}`,
        text: `${token}`
    }
    return new Promise((resolve, reject) => {
        smtpTransport.sendMail(mailOptions, async (error, response) => {
            if (error) reject(next(new ErrorHandler(`Can't send code to your email`)))

            resolve({ success: true, message: `A code has been sent to ${email}` })
        })
    })
}

export async function verifyJWT(token, next) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded) return next(new ErrorHandler(`Something wrong`))

    return await findUser(decoded.email, next)
}

//create new code verify for forgot password
export async function updateResetPasswordToken(email, next) {

    //hashing and add reset token to User Model in Mongo
    const user = findUser(email, next);

    const { resetPasswordToken, resetPasswordExpire } = user;

    const resetToken = await User.findOneAndUpdate({ email },
        {
            $set: {
                resetPasswordToken: crypto.createHash('sha256')
                    .update(user.resetPasswordToken)
                    .digest('hex'),
                resetPasswordExpire: Date.now() + 15 * 60 * 1000
            },
        }, { new: true }, (err, result) => {

            if (err) return next(new ErrorHandler(`Can't reset password token`), 400)

        })
    return resetToken;
}
//compare password for login action
export async function passwordCompare(props, passwordHashed, next) {

    const user = await User.find({ email: props.email }).select("+password")

    return new Promise((resolve, reject) => {

        bcrypt.compare(props.password, passwordHashed, async (err, result) => {

            if (!result) { reject(next(new ErrorHandler(`Password is incorrect`, 404))) }

            resolve(result)
        })

        // await checkAccountActive(props, res, next)

    })
}

export async function checkGmailExist(email) {
    return new Promise((resolve, reject) => {
        emailExistence.check(email, function (error, response) {
            if (error) reject(error)

            resolve(response)
        })
    });
}

export function setJWTToken(email) {

    return jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRE })

}

export async function checkAccountActive(email, res, next) {

    const user = await findUser(email, next)

    const token = setJWTToken(user.email)

    if (!user.active) {
        await res.cookie('token', token, {
            expires: new Date(
                Date.now() + process.env.COOCKIE_EXPIRE * 24 * 60 * 60 * 1000
            ),
            httpOnly: true
        })

        return next(new ErrorHandler(`Account is not active yet, Please active your account`, 400))
    }
    return res.status(200).json({ success: true, message: 'Login successfully', user })
}

export async function findUser(email, next) {
    const user = await User.findOne({ email });

    if (!user) return next(new ErrorHandler(`Your account does not exist`, 400))

    return user;
}