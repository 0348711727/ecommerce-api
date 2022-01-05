import { getJWTToken } from "../controllers/user.controller.js";

const sendToken = (email, user, res, statusCode) => {
    const token = getJWTToken(email);
    const options = {
        expires: new Date(
            Date.now() + process.env.COOCKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    return res.status(statusCode).cookie('token', token, options).json({ succes: true, user, token });
}

export default sendToken;