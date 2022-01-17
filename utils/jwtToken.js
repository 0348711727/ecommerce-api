import { setJWTToken } from "../controllers/user.js";

const sendToken = (email, res) => {

    const token = setJWTToken(email);

    const options = {
        expires: new Date(
            Date.now() + process.env.COOCKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    return res.cookie('token', token, options)
}

export default sendToken;