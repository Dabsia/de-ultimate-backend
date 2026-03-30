import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../model/Product.model.js";
import {validationResult} from 'express-validator'
import AppError from '../utils/AppError.js'

export const getProducts = asyncHandler(async (req, res) => {
   
    const products = await Product.find();
    res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: products
    });
   
});

export const createProduct = asyncHandler(async (req, res) => {
    // express-validator errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }
  
    const { name, price, description, image, category } = req.body;
  
    // manual validation (optional if using express-validator properly)
    if (!name || !price || !description || !image || !category) {
      throw new AppError('All fields are required', 400);
    }
  
    // check duplicate
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      throw new AppError('Product with this name already exists', 400);
    }
  
    // create product
    const product = await Product.create(req.body);
  
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  });


export const getProductById = async (req, res) => {
    const { id } = req.params; // destructuring the request params
    if (!id) {
        return res.status(400).json({ message: "Product ID is required" });
    }
    if (!await Product.findById(id)) {
        return res.status(400).json({ message: "Product not found" });
    }
    try {
        const product = await Product.findById(req.params.id);
        res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: product
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
    const { id } = req.params; // destructuring the request params
    const { name, price, description, image, category } = req.body; // destructuring the request body
    if (!id) {
        return res.status(400).json({ message: "Product ID is required" });
    }
    if (!name || !price || !description || !image || !category) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};  


export const deleteProduct = async (req, res) => {
    const { id } = req.params; // destructuring the request params
    if (!id) {
        return res.status(400).json({ message: "Product ID is required" });
    }
    if (!await Product.findById(id)) {
        return res.status(400).json({ message: "Product not found" });
    }
    try {
        const product = await Product.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            data: null
        }); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getProductsByUserId = async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    try{
        const products = await Product.find({ userId });
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};