import User from "../model/User.model.js";
import asyncHandler from '../middleware/asyncHandler.js';
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: users
  });
});


export const getUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new AppError('Id not found', 404);
    }
    // ✅ validate ID first
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid user ID', 400);
  }
    
    const user = await User.findById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: user
    });   
});
