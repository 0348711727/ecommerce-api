import express from 'express';
import userController from "../controllers/user.controller.js";
const router = express.Router();

router.post('/signup', userController.signUp);
router.post('/login', userController.logIn);
router.get("/logout", userController.logOut);
// router.get('/', userController.getAllUsers);

export default router;