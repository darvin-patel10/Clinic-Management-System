import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "User is required"]
    },
    otpHash: {
        type: String,
        required: [true, "OTP is required"]
    }
}, {
    timestamps: true
})

// MongoDB will automatically delete OTP documents 2 minutes after creation.
// This matches the "Expires in 2 minutes" notice in the email template.
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 });

const otpModel = mongoose.model("otp", otpSchema);
export default otpModel;