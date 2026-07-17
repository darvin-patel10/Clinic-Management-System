import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
    drId: {
        type: String,
        required: [true, "Doctor ID is requied"],
    },
    medicineName: {
        type: String,
        required: [true, "Medicine Name is requied"],
        unique: [true, "Medicine Name must be unique"],
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [0, "Quantity must be greater than 0"],
    },
    unitPrice: {
        type: Number,
        required: [true, "Unit Price is requied"],
        min: [0, "Unit Price must be greater than 0"],
    },
    totalPrice: {
        type: Number,
        required: [true, "Total Price is requied"],
    }
}, {
    timestamps: true
})

const medicineModel = mongoose.model("Medicines", medicineSchema);
export default medicineModel;