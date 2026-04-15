// import { getProductsByUserId } from "../controller/products.controller.js";
import { getAllUsers, getUser } from "../controller/user.controller.js";
import express from "express";
import { adminOnly, protect } from "../middleware/index.js";

const router = express.Router();


router.get("/", protect, adminOnly, getAllUsers);
router.get("/:id", protect, getUser);
// router.get("/user/:userId", protect, getProductsByUserId);

export default router;