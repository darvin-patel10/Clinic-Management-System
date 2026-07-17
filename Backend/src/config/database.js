import mongoose from "mongoose";
import config from "../config/config.js";

async function connectDB() {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("Database connected");
    } catch (error) {
        console.log(error);
    }
}

export default connectDB;