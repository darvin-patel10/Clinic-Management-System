import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is requied"],
        unique: [true, "Username must be unique"],
    },
    email: {
        type: String,
        required: [true, "Email is requied"],
        unique: [true, "Email must be unique"]
    },
    password: {
        type: String,
        required: [true, "Password is requied"],
    },
    verified: {
        type: Boolean,
        default: false,
    },
})

const userModel = mongoose.model("Users", userSchema);
export default userModel;