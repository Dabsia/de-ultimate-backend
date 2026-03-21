import express from "express";
import { login, createUser, resetPassword, changePassword } from "../controller/auth.controller.js";

const router = express.Router()

router.post("/register", createUser);
router.post("/login", login);
router.post('/reset-password', resetPassword)
router.post('/change-password/:token', changePassword)


export default  router