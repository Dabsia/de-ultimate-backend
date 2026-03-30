import jwt from "jsonwebtoken";
import User from "../model/User.model.js";

export const protect = async (req, res, next) => {
    try {
      let token;
  
      // 1. Get token from header
      if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
      }
  
      // 2. No token → block access
      if (!token) {
        return res.status(401).json({
          message: "Not authorized, no token"
        });
      }
  
      // 3. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // 4. Attach user to request (optional but powerful)
      const user = await User.findById(decoded.id).select("-password");
  
      if (!user) {
        return res.status(401).json({
          message: "User not found"
        });
      }
  
      req.user = user; 
  
      next(); // continue to route
  
    } catch (err) {
      return res.status(401).json({
        message: "Not authorized, token failed"
      });
    }
  };

  export const adminOnly = (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied, You are not the Admin"
      });
    }
    next();
  };