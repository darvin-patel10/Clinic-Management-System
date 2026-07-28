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
    qulification: {
        doctorName: {
            type: String,
            default: ""
        },
        qualification: {
            type: String,
            default: ""
        },
        registrationNo: {
            type: String,
            default: "",
            unique: [true, "Registration number must be unique"],
            sparse: true
        },
        specialty: {
            type: String,
            default: ""
        },
        experienceYears: {
            type: String,
            default: ""
        },
        medicalcouncil: {
            type: String,
            default: ""
        }
    },
    clinicinfo: {
        clinicName: {
            type: String,
            default: ""
        },
        clinicphone: {
            type: Number,
            default: 0
        },
        consultationfee: {
            type: Number,
            default: 0
        },
        clinicAddress: {
            address: {
                type: String,
                default: ""
            },
            city: {
                type: String,
                default: ""
            },
            state: {
                type: String,
                default: ""
            },
            pinCode: {
                type: String,
                default: ""
            }
        },
        clinicTiming: {
            type: String,
            default: ""
        }
    },
    emergencyAvailable: {
        type: Boolean,
        default: false
    },
    teleConsultation: {
        type: Boolean,
        default: false
    }
})

const userModel = mongoose.model("Users", userSchema);
export default userModel;