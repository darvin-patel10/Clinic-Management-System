import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    drId: {
        type: String,
        required: [true, "Doctor ID is required"],
    },
    uniqueno: {
        type: Number,
        required: [true, "Unique Number is required"],
    },
    patientName: {
        type: String,
        required: [true, "Patient Name is required"],
    },
    patientAge: {
        type: Number,
        required: [true, "Patient Age is required"],
    },
    patientGender: {
        type: String,
        required: [true, "Patient Gender is required"],
    },
    phonenumber: {
        type: Number,
        required: [true, "Phone number is required"],
    },
    region: {
        type: String,
        required: [true, "Region is required"],
    },
    prescription: [{
        medicine: [
            {
                medicineId: {
                    type: String,
                    required: [true, "Medicine ID is required"],
                },
                medicineName: {
                    type: String,
                    required: [true, "Medicine Name is required"],
                },
                quantity: {
                    type: Number,
                    required: [true, "Quantity is required"],
                },
                price: {
                    type: Number,
                    required: [true, "Price is required"],
                }
            }
        ],
        note: {
            type: String,
            default: "No note",
        },
        totalPrice: {
            type: Number,
            required: [true, "Total Price is required"],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }
    }]

}, {
    timestamps: true
})

const patientModel = mongoose.model("Patients", patientSchema);
export default patientModel;