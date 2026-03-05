import { getProducts, createProduct, getProductById, updateProduct, deleteProduct } from "../controller/products.controller.js   ";
import express from "express";

const router = express.Router();

router.get("/", getProducts);
router.post("/", createProduct);

router.get("/:id", getProductById);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;