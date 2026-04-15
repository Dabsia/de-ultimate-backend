import express from "express";
import {adminOnly, protect} from "../middleware/index.js";
import { productValidator } from "../validators/productValidator.js";
import { uploadSingle } from "../middleware/imageUpload.js";
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "../controller/categories.controller.js";

const router = express.Router();

router.get("/", protect, adminOnly, getAllCategories);
router.post("/", protect, productValidator, uploadSingle("image"), createCategory);

router.patch("/:id", protect, productValidator, uploadSingle("image"), updateCategory);
router.delete("/:id", protect, deleteCategory);



export default router;