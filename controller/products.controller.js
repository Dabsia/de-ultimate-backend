import Product from "../model/Product.model.js";

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req, res) => {
    const { name, price, description, image, category } = req.body; // destructuring the request body
    if (!name || !price || !description || !image || !category) {
        return res.status(400).json({ message: "All fields are required" });
    }       

    if (await Product.findOne({ name })) {
        return res.status(400).json({ message: "Product with this name already exists" });
    }

    try {
        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


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
            data: product
        }); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};