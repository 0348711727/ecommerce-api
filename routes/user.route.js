import express from 'express';
import userController from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.js";
const router = express.Router();

router.post('/signup', userController.signUp);
router.post('/login', userController.logIn);
router.get("/logout", userController.logOut);
router.get("/logout", userController.logOut);
router.get('/', userController.getAllUsers);
router.post('/verify', userController.verifyEmail);
router.post("/forgot", userController.forgotPassword);
router.put("/updatepass", userController.updateNewPassword);
router.get("/me", isAuthenticated, userController.getUserDetails);

export default router;