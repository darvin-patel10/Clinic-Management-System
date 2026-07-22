import medicineModel from "../models/medicines.model.js";

export async function addMedicine(req, res) {
    try {
        const { medicineName, quantity, unitPrice } = req.body;

        if (!medicineName || !quantity || !unitPrice) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        const existingMedicine = await medicineModel.findOne({
            drId: req.user.id,
            medicineName
        });

        if (existingMedicine) {
            return res.status(400).json({
                message: "Medicine Name must be unique"
            });
        }
        const totalPrice = unitPrice * quantity;

        const medicine = await medicineModel.create({
            drId: req.user.id,
            medicineName,
            quantity,
            unitPrice,
            totalPrice
        });

        return res.status(201).json({
            message: "Medicine created successfully",
            medicine
        });
    }
    catch (error) {
        console.error("Error in addMedicine:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function updateMedicine(req, res) {
    try {
        const { medicineName, quantity, unitPrice } = req.body ?? {};
        const drId = req.user.id;
        const medicine = await medicineModel.findById(req.params.id);

        if (!medicine) {
            return res.status(404).json({
                message: "Medicine not found. Make sure you are Selected the correct Medicine."
            });
        }

        if (drId !== medicine.drId) {
            return res.status(403).json({
                message: "You are not authorized to update this medicine"
            });
        }

        if (medicineName) medicine.medicineName = medicineName;
        if (quantity) medicine.quantity = Number(quantity);
        if (unitPrice) medicine.unitPrice = Number(unitPrice);

        // Recalculate totalPrice whenever quantity or unitPrice changes
        medicine.totalPrice = medicine.unitPrice * medicine.quantity;

        await medicine.save();

        return res.status(200).json({
            message: "Medicine updated successfully",
            medicine
        });
    }
    catch (error) {
        // Invalid MongoDB ObjectId format in the URL (e.g. wrong id)
        if (error.name === "CastError") {
            return res.status(400).json({
                message: `Invalid medicine ID format: "${req.params.id}". Use the _id from the addMedicine response.`
            });
        }
        console.error("[updateMedicine]", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function addQuntity(req, res) {
    try {
        const medicine = await medicineModel.findById(req.params.id);

        if (!medicine) {
            return res.status(404).json({
                message: "Medicine not found. Make sure you are Selected the correct Medicine."
            });
        }

        const drId = req.user.id;
        if (drId !== medicine.drId) {
            return res.status(403).json({
                message: "You are not authorized to add quantity to this medicine"
            });
        }

        const { quantity } = req.body;
        if (!quantity) {
            return res.status(400).json({
                message: "Quantity is required"
            });
        }

        medicine.quantity += Number(quantity);
        medicine.totalPrice = medicine.unitPrice * medicine.quantity;
        await medicine.save();

        return res.status(200).json({
            message: "Quantity added successfully",
            medicine
        });
    }
    catch (error) {
        console.error("[addQuntity]", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function delateMedicine(req, res) {
    try {
        const drId = req.user.id;
        const medicine = await medicineModel.findById(req.params.id);

        if (!medicine) {
            return res.status(404).json({
                message: "Medicine not found. Make sure you are Selected the correct Medicine."
            });
        }

        if (drId !== medicine.drId) {
            return res.status(403).json({
                message: "You are not authorized to delate this medicine"
            });
        }

        await medicine.deleteOne();

        return res.status(200).json({
            message: "Medicine delated successfully",
            medicine
        });
    }
    catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: `Invalid medicine ID format: "${req.params.id}". Use the _id from the addMedicine response.`
            });
        }
        console.error("[delateMedicine]", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function allMedicine(req, res) {
    try {
        const drId = req.user.id;
        const medicine = await medicineModel.find({ drId });
        if (!medicine) {
            return res.status(404).json({
                message: "Medicines not found."
            });
        }
        return res.status(200).json({
            message: "Medicines fetched successfully",
            medicine
        });
    }
    catch (error) {
        console.error("[allMedicine]", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function searchMedicine(req, res) {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({
                message: "Search query 'name' is required"
            });
        }
        const drId = req.user.id;
        const medicines = await medicineModel.find({
            drId,
            medicineName: { $regex: name, $options: "i" }
        });
        return res.status(200).json({
            message: "Medicines matched successfully",
            medicines
        });
    }
    catch (error) {
        console.error("[searchMedicine]", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}