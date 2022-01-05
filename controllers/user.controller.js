import ErrorHandler from "../utils/handlerError.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
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

        passwordCompare(req.body, passwordHashed, res, user, next)
    }),
    logOut: catchAsyncError(async (req, res, next) => {
        console.log(req.cookies)
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true
        })
        return res.status(200).json({ success: true, message: 'Logout success' })
    })
}

function hashPassword(props, res) {

    const { password } = props;

    bcrypt.hash(password, 12, async (err, passwordHash) => {

        if (err) return next(new ErrorHandler(`Couldn't hash password`, 404))

        try {
            const newUser = await insertToMongo(props, passwordHash)

            return res.status(200).json({ success: true, message: 'Sign up successfully', newUser });
        } catch (error) {
            console.log(error)
        }
    })
}
function passwordCompare(userInfo, passwordHashed, res, user, next) {

    bcrypt.compare(userInfo.password, passwordHashed, (err, result) => {
        if (!result) return next(new ErrorHandler(`Password is incorrect`, 404))

        setCookieToken(userInfo.email, res)
    })
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
        }
    })
    await newUser.save();
    return newUser;
}
export function getJWTToken(email) {

    return jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: process.env.JWT_EXPIRE })
}
function setCookieToken(email, res) {
    const token = getJWTToken(email);

    const options = {
        expires: new Date(
            Date.now() + process.env.COOCKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    return res.status(200).cookie('token', token, options).json({ message: 'Login success', success: true, token })
}

export default userController;