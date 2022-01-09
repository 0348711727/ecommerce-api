import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/handlerError.js";
import crypto from "crypto";
import sendToken from "../utils/jwtToken.js";

export function hashPassword(props, res) {

    const { email, password } = props;

    bcrypt.hash(password, 12, async (err, passwordHash) => {

        if (err) return next(new ErrorHandler(`Couldn't hash password`, 404))

        try {
            const newUser = await insertToMongo(props, passwordHash)

            // setCookieToken(props.email, res)
            await sendToken(email, newUser, res, 'Login success', 200)

        } catch (error) {
            console.log(error)
        }
    })
}

export async function updateResetPasswordToken(email) {

    //hashing and add reset token to User Model in Mongo
    const user = await User.find({ email })

    if (!user) return next(new ErrorHandler(`Email does not exist`))
    const { resetPasswordToken, resetPasswordExpire } = user;

    const resetToken = await User.findOneAndUpdate({ email },
        {
            $set: {
                resetPasswordToken: crypto.createHash('sha256')
                    .update(user[0].resetPasswordToken)
                    .digest('hex'),
                resetPasswordExpire: Date.now() + 15 * 60 * 1000
            },
        }, { new: true }, (err, result) => {

            if (err) return next(new ErrorHandler(`Can't reset password token`), 400)

        })
    return resetToken;
}
export async function passwordCompare(props, passwordHashed, res, next) {

    const user = await User.find({ email: props.email }).select("+password")

    bcrypt.compare(props.password, passwordHashed, async (err, result) => {

        if (!result) return next(new ErrorHandler(`Password is incorrect`, 404))

        await checkAccountActive(props, res, next)

    })
}
async function checkAccountActive(props, res, next) {

    const user = await User.find({ email: props.email }).select("+password")

    if (user[0].active === false) return next(new ErrorHandler(`Account is not active yet, Please active your account`, 400))

    await sendToken(props.email, user, res, 'Sign Up success', 200)

    // setCookieToken(props.email, res)

}
async function insertToMongo(props, passwordHash) {
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
export function setJWTToken(email) {

    return jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: process.env.JWT_EXPIRE })

}
// function setCookieToken(email, res) {
//     const token = setJWTToken(email);

//     const options = {
//         expires: new Date(
//             Date.now() + process.env.COOCKIE_EXPIRE * 24 * 60 * 60 * 1000
//         ),
//         httpOnly: true
//     };
//     return res.status(200).cookie('token', token, options).json({ message: 'Login success', success: true, token })
// }