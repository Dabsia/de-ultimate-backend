import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

const MONGO_URI = process.env.MONGODB_CONNECTION_STRING;

mongoose.connect(MONGO_URI)
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.log(err);
});


export default mongoose.connection;