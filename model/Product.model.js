import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
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
   
    sale_price: {
      type: Number,
 
    },
    expiration_date: {
      type: Date,
      required: true
    },
    size: {
      type: String
    },
    descriptionEnglish: {
      type: String,
      required: true
    },
    descriptionEsti: {
      type: String,
      // required: true
    },
    instock: {
      type: Boolean,
      default: true
    },
    category: {
        type: String,
        required: true
    },
   
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;