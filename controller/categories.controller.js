import Category from "../model/Category.js";
import { UploadService } from "../services/uploadImage.js";
import fs from "fs";

// Create category with image
export const createCategory = async (req, res) => {
    // console.log(req.user)
  try {
    const { name, description} = req.body;
    
    // Validate required fields
    if (!name || !description) {
      // Clean up uploaded file if validation fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(400).json({
        success: false,
        message: "Name, description are required",
      });
    }
    
    // Validate image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Category image is required",
      });
    }
    
    // Upload image to Cloudinary
    const uploadedImage = await UploadService.uploadSingleAndClean(req.file, "categories");
    
    // Create category in database
    const category = await Category.create({
      name,
      description,
      image: uploadedImage
    });
    
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
    
  } catch (error) {
    console.error("Error creating category:", error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
};

// Get all categorys
export const getAllCategories = async (req, res) => {
  try {
 
    const categories = await Category.find()
      
    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
    
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch categories",
    });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description} = req.body;
    
    // Find existing category
    const category = await Category.findById(id);
    
    if (!category) {
      // Clean up uploaded file if exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    // Handle image update if new image provided
    let imageData = category.image;
    if (req.file) {
      // Delete old image from Cloudinary
      await UploadService.deleteImageFromCloud(category.image.publicId);
      
      // Upload new image
      imageData = await UploadService.uploadSingleAndClean(req.file, "categories");
    }
    
    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: name || category.name,
        description: description || category.description,
        image: imageData,
        
      },
      { new: true }
    )
    
    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
    
  } catch (error) {
    console.error("Error updating category:", error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update category",
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
  
    // Delete image from Cloudinary
    await UploadService.deleteImageFromCloud(category.image.publicId);
    
    // Delete category from database
    await Category.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
    
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
};

