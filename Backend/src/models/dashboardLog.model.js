import mongoose from "mongoose";

const monthlySchema = new mongoose.Schema(
    {
        month: {
            type: String, // e.g. "Jul 2026"
            required: true,
        },
        noOfPatients: {
            type: Number,
            default: 0,
        },
        noOfMedicines: {
            type: Number,
            default: 0,
        },
        revenue: {
            type: Number,
            default: 0,
        },
        patientNames: [
            {
                type: String,
            },
        ],
    },
    { _id: false }
);

const yearlySchema = new mongoose.Schema(
    {
        year: {
            type: String, // e.g. "2025"
            required: true,
        },
        noOfPatients: {
            type: Number,
            default: 0,
        },
        noOfMedicines: {
            type: Number,
            default: 0,
        },
        revenue: {
            type: Number,
            default: 0,
        },
    },
    { _id: false }
);

const dashboardLogSchema = new mongoose.Schema(
    {
        drId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        monthlyData: [monthlySchema],
        yearlyData: [yearlySchema],
    },
    {
        timestamps: true,
    }
);

const dashboardLogModel = mongoose.model("DashboardLog", dashboardLogSchema);
export default dashboardLogModel;
