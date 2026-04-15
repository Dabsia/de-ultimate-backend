import Product from "../model/Product.model.js";
import { UploadService } from "../services/uploadImage.js";
import fs from "fs";

// Create product with image
export const createProduct = async (req, res) => {
    // console.log(req.user)
  try {
    const { name, description, price, category, brand, size, descriptionEnglish, descriptionEsti, instock } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !category || !descriptionEnglish || !descriptionEsti || !instock) {
      // Clean up uploaded file if validation fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(400).json({
        success: false,
        message: "Name, description, price, category, descriptionEnglish, descriptionEsti, instock are required",
      });
    }
    
    // Validate image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required",
      });
    }
    
    // Upload image to Cloudinary
    const uploadedImage = await UploadService.uploadSingleAndClean(req.file, "products");
    
    // Create product in database
    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      image: uploadedImage,
      instock,
      brand,
      size,
      descriptionEnglish,
      descriptionEsti
    });
    
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
    
  } catch (error) {
    console.error("Error creating product:", error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
 
    const products = await Product.find()
      
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
    
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    
    return res.status(200).json({
      success: true,
      data: product,
    });
    
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product",
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, instock, brand, size, descriptionEnglish, descriptionEsti} = req.body;
    
    // Find existing product
    const product = await Product.findById(id);
    
    if (!product) {
      // Clean up uploaded file if exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    console.log(product)
 
    // Check authorization
    // if (product.createdBy.toString() !== req.user._id.toString()) {
    //   // Clean up uploaded file if exists
    //   if (req.file && fs.existsSync(req.file.path)) {
    //     fs.unlinkSync(req.file.path);
    //   }
      
    //   return res.status(403).json({
    //     success: false,
    //     message: "Not authorized to update this product",
    //   });
    // }
    
    // Handle image update if new image provided
    let imageData = product.image;
    if (req.file) {
      // Delete old image from Cloudinary
      await UploadService.deleteImageFromCloud(product.image.publicId);
      
      // Upload new image
      imageData = await UploadService.uploadSingleAndClean(req.file, "products");
    }
    
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: name || product.name,
        description: description || product.description,
        price: price !== undefined ? Number(price) : product.price,
        category: category || product.category,
        instock: instock || product.instock,
        brand: brand || product.brand,
        size: size || product.size,
        descriptionEnglish: descriptionEnglish || product.descriptionEnglish,
        descriptionEsti: descriptionEsti || product.descriptionEsti,
        image: imageData,
        
      },
      { new: true }
    )
    
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
    
  } catch (error) {
    console.error("Error updating product:", error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
  
    // Delete image from Cloudinary
    await UploadService.deleteImageFromCloud(product.image.publicId);
    
    // Delete product from database
    await Product.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
    
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
};

