import userModel from "../models/user.model.js";

export async function accountDetails(req, res) {
    try {
        const drId = req.params.id;
        const currentUserId = req.user._id || req.user.id;

        if (!drId) {
            return res.status(400).json({ message: "Please provide doctor ID" });
        }

        if (drId.toString() !== currentUserId.toString()) {
            return res.status(401).json({ message: "You are not authorized to access this account" });
        }
        const user = await userModel.findById(drId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            message: "User details fetched successfully",
            user
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateDetails(req, res) {
    try {
        const { username, qulification, clinicinfo, emergencyAvailable, teleConsultation } = req.body;

        if (!username && !qulification && !clinicinfo && !emergencyAvailable && !teleConsultation) {
            return res.status(400).json({ message: "No details provided" });
        }

        const user = await userModel.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (username) {
            user.username = username;
            user.qulification.doctorName = username;
        }
        if (qulification) {
            for (let q in qulification) {
                user.qulification[q] = qulification[q] || user.qulification[q];
            }
        }
        if (clinicinfo) {
            for (let c in clinicinfo) {
                user.clinicinfo[c] = clinicinfo[c] || user.clinicinfo[c];
            }
        }

        if (emergencyAvailable) {
            user.emergencyAvailable = emergencyAvailable || user.emergencyAvailable;
        }

        if (teleConsultation) {
            user.teleConsultation = teleConsultation || user.teleConsultation;
        }

        await user.save();

        return res.status(200).json({
            message: "User updated successfully",
            user
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}