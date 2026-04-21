import User from "../model/User.model.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import crypto from 'crypto'
import { sendEmail } from "../services/email.js";
import {validationResult} from 'express-validator'

export const createUser = async (req, res) => {

    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (await User.findOne({ email })) {
        return res.status(400).json({ message: "User already exists" })
    }
    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create new user with hashed password
    const user = await User.create({ name, email, password: hashedPassword, role });
    res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user
    });
    sendEmail({
        to: user.email,
        subject: "Welcome to Ecommerce!",
        html: `<h1>Hello ${user.name} You just created your Account</h1>`
      });
};  



export const login = async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const {email, password} = req.body
    try {
        const user = await User.findOne({email});
        if (!email || !password){
            res.status(400).json({message: 'Email and Password is required'})
        }
        if (!user){
            res.status(400).json({message: 'Incorrect email or password'})
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            res.status(400).json({message: 'Incorrect email or password'})
        }
        else{
            const token = jwt.sign(
                { id: user._id, role: user.role }, 
                process.env.JWT_SECRET,           
                { expiresIn: "7d" }              
              );
            res.status(200).json({message: "Login successful", status: 'success',  data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
              }})
        }
      
    } catch (error) {
        res.status(500).json({message: 'Something went wrong'})
    }
}



export const resetPassword = (req, res) => {
    const {email} = req.body
    crypto.randomBytes(32, (err, buffer) => {
        if (err){
            console.log(err)
        }
        const token = buffer.toString('hex')
        User.findOne({email}).then(user => {
            if (!user){
                res.status(200).json({
                    success: false,
                    message: "No account with that email found",
                });
            }
      
            user.resetToken = token
            user.resetTokenExpiration = Date.now() +  3600000
            user.save()
        }).then(result => {
            const link = `https://dabojohnson.netlify.app/reset/${token}`
            sendEmail({
                to: email,
                subject: "Welcome to Ecommerce!",
                html: `<h1>You requested a password reset</h1>
                    <a href = ${link} >Click this link to set a  password</a>
                `
            });
            res.status(200).json({
                success: true,
                message: "An Email has been sent to you",
            });
        })
        .catch(err => console.log(err ))
    })
}

export const changePassword = async(req, res) => {
    const token = req.params.token
    const {newPassword, email} = req.body
    const saltRounds = 10;
    let resetUser
    User.findOne({resetToken: token, email, resetTokenExpiration:{$gt: Date.now()}}).then(user => {
        if (!user){
            res.status(400).json({
                success: false,
                message: "User not found",
            });
        }
        resetUser = user
        return bcrypt.hash(newPassword, saltRounds);
    }).then(newHashedpassword =>{
        resetUser.password = newHashedpassword
        resetUser.resetToken = null
        resetUser.resetTokenExpiration = null
        res.status(200).json({
            success: true,
            message: "You have successfully reset your password",
        });
        return resetUser.save();
    })
    .catch(err=> console.log(err))

}

// controllers/authController.js
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // From auth middleware
    
        
        const user = await User.findById(userId);
        
        // Check if user exists
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();
    
        res.status(200).json({ message: 'Password changed successfully' });
        
      } catch (error) {
       
        res.status(500).json({ message: 'Server error', error: error.message });
      }
  };