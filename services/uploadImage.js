import fs from "fs";
import { uploadImage, deleteImage } from "../helpers/cloudinary.helpers.js";

export class UploadService {
  // Upload single image and clean up temp file
  static async uploadSingleAndClean(file, folder = "products") {
    if (!file) return null;
    
    try {
      // Upload to Cloudinary
      const uploadedImage = await uploadImage(file.path, folder);
      
      // Clean up temporary file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      return {
        url: uploadedImage.url,
        publicId: uploadedImage.publicId,
      };
      
    } catch (error) {
      // Clean up on error
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }
  
  // Delete image from Cloudinary 
  static async deleteImageFromCloud(publicId) {
    if (!publicId) return;
    await deleteImage(publicId);
  }
}