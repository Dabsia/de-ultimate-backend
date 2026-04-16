import express from "express";
import { login, createUser, resetPassword, changePassword, updatePassword } from "../controller/auth.controller.js";
import { loginValidator, registerValidator } from "../validators/userValidator.js";
import { protect } from "../middleware/index.js";
const router = express.Router()

router.post("/register", registerValidator, createUser);
router.post("/login", loginValidator, login);
router.post('/reset-password', resetPassword)
router.post('/change-password/:token', changePassword)
router.post('/update-password', protect, updatePassword)


export default  router