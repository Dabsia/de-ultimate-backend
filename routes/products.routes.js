import { getAllProducts, createProduct, getProductById, updateProduct, deleteProduct} from "../controller/products.controller.js   ";
import express from "express";
import {adminOnly, protect} from "../middleware/index.js";
import { productValidator } from "../validators/productValidator.js";
import { uploadSingle } from "../middleware/imageUpload.js";

const router = express.Router();

router.get("/", getAllProducts);
router.post("/", protect, productValidator, uploadSingle("image"), createProduct);

router.get("/:id", getProductById);
router.patch("/:id", protect, productValidator, uploadSingle("image"), updateProduct);
router.delete("/:id", protect, deleteProduct);



export default router;