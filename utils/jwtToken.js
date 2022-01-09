import { setJWTToken } from "../controllers/user.js";

const sendToken = (email, user, res, message, statusCode) => {
    const token = setJWTToken(email);
    const options = {
        expires: new Date(
            Date.now() + process.env.COOCKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    return res.status(statusCode).cookie('token', token, options).json({ succes: true, token, message });
}

export default sendToken;