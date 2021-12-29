import ErrorHandler from "../utils/handlerError.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import User from "../models/user.model.js";

const userController = {
    signUp: catchAsyncError(async (req, res) => {
        const { name, email, password } = req.body;

        const user = await User.create({
            name, email, password,
            avatar: {
                public_id: 'sample-image',
                url: 'http://example.com'
            }
        })
        return res.status(200).json({ success: true, message: 'Sign up successfully', user });
    })
}
export default userController;