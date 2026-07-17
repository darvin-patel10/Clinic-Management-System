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

// MongoDB will automatically delete OTP documents 10 minutes after creation.
// This matches the "Expires in 10 minutes" notice in the email template.
// The TTL background task runs approximately every 60 seconds, so actual
// deletion may occur up to ~1 minute after the 10-minute window closes.
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

const otpModel = mongoose.model("otp", otpSchema);
export default otpModel;