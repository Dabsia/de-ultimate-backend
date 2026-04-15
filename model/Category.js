import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
   
    description: {
        type: String,
        required: true
    },
    image: {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    
   
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);

export default Category;