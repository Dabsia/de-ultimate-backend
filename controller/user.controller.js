import User from "../model/User.model.js";

export const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (await User.findOne({ email })) {
        return res.status(400).json({ message: "User already exists" })
    }
    const user = await User.create({ name, email, password, role });
    res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user
    });
};  
