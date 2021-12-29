import express from 'express';
import userController from "../controllers/user.controller.js";
const router = express.Router();

router.post('/signup', userController.signUp);

export default router;