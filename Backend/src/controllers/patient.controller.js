import patientModel from "../models/patient.model.js";
import medicineModel from "../models/medicines.model.js";

export async function searchPatient(req, res) {
    try {

        const { uniqueno, name, phonenumber } = req.query;
        const drId = req.user.id;

        if (!uniqueno && !name && !phonenumber) {
            const patients = await patientModel.find({ drId });
            return res.status(200).json({
                message: "Patients matched successfully",
                patients
            });
        }
        if (name) {
            const patients = await patientModel.find({
                drId,
                patientName: { $regex: name, $options: "i" }
            });
            return res.status(200).json({
                message: "Patients matched successfully",
                patients
            });
        }
        else if (phonenumber) {
            const patients = await patientModel.find({
                drId,
                $expr: {
                    $regexMatch: {
                        input: { $toString: "$phonenumber" },
                        regex: String(phonenumber),
                        options: "i"
                    }
                }
            });
            return res.status(200).json({
                message: "Patients matched successfully",
                patients
            });
        }
        else if (uniqueno) {
            const patients = await patientModel.find({
                drId,
                uniqueno
            });
            return res.status(200).json({
                message: "Patients matched successfully",
                patients
            });
        }
        else {
            return res.status(400).json({
                message: "No patient found"
            });
        }
    }

    catch (error) {
        console.log(error);
    }
}

// Helper to calculate the next auto-incrementing patient unique ID with a 6-month reset
async function getNextUniqueNo(drId) {
    // Find the oldest patient for this doctor to establish the sequence reference point
    const oldestPatient = await patientModel.findOne({ drId }).sort({ createdAt: 1 });
    if (!oldestPatient) {
        return 1;
    }

    const tStart = oldestPatient.createdAt;
    const tNow = new Date();

    const startYear = tStart.getFullYear();
    const startMonth = tStart.getMonth();
    const nowYear = tNow.getFullYear();
    const nowMonth = tNow.getMonth();

    // Difference in months
    const diffMonths = (nowYear - startYear) * 12 + (nowMonth - startMonth);
    // 6-month interval index
    const intervalIndex = Math.max(0, Math.floor(diffMonths / 6));

    // Calculate the start date of the current 6-month interval
    const intervalStart = new Date(
        startYear,
        startMonth + intervalIndex * 6,
        tStart.getDate(),
        tStart.getHours(),
        tStart.getMinutes(),
        tStart.getSeconds()
    );

    // Find the patient with the maximum uniqueno in the current 6-month interval
    const lastPatientInInterval = await patientModel.findOne({
        drId,
        createdAt: { $gte: intervalStart }
    }).sort({ uniqueno: -1 });

    if (!lastPatientInInterval) {
        return 1;
    }

    return lastPatientInInterval.uniqueno + 1;
}

export async function getNextUniqueNoRoute(req, res) {
    try {
        const drId = req.user.id;
        const nextNo = await getNextUniqueNo(drId);
        return res.status(200).json({
            success: true,
            nextUniqueNo: nextNo
        });
    } catch (error) {
        console.error("Error getting next unique number:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function addPatient(req, res) {
    try {

        const { patientName, patientAge, patientGender, phonenumber, region, prescription } = req.body;

        if (!patientName || !patientAge || !patientGender || !phonenumber || !region || !prescription) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const assignedUniqueNo = await getNextUniqueNo(req.user.id);

        // 1. Gather all medicine updates first to check availability (prevent partial updates on failure)
        const medicineUpdates = [];
        const prescriptionsArray = Array.isArray(prescription) ? prescription : [prescription];

        for (const p of prescriptionsArray) {
            if (p && p.medicine && Array.isArray(p.medicine)) {
                for (const med of p.medicine) {
                    const { medicineId, quantity: prescribedQty } = med;

                    if (!medicineId || prescribedQty === undefined) {
                        return res.status(400).json({
                            message: "Medicine ID and quantity are required in prescription"
                        });
                    }

                    // Find medicine in database
                    const medicineDoc = await medicineModel.findOne({
                        _id: medicineId,
                        drId: req.user.id
                    });

                    if (!medicineDoc) {
                        return res.status(404).json({
                            message: `Medicine with ID ${medicineId} not found or you are not authorized`
                        });
                    }

                    if (medicineDoc.quantity < prescribedQty) {
                        return res.status(400).json({
                            message: `Insufficient stock for medicine "${medicineDoc.medicineName}". Available: ${medicineDoc.quantity}, Prescribed: ${prescribedQty}`
                        });
                    }

                    medicineUpdates.push({
                        doc: medicineDoc,
                        prescribedQty
                    });
                }
            }
        }

        // 2. Perform the updates (decrease quantity & recalculate totalPrice)
        for (const update of medicineUpdates) {
            const { doc, prescribedQty } = update;
            doc.quantity -= prescribedQty;
            doc.totalPrice = doc.unitPrice * doc.quantity;
            await doc.save();
        }

        // 3. Create the patient record
        const patient = await patientModel.create({
            drId: req.user.id,
            uniqueno: assignedUniqueNo,
            patientName,
            patientAge,
            patientGender,
            phonenumber,
            region,
            prescription
        });

        return res.status(201).json({
            message: "Patient added successfully",
            patient
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function fatchPatient(req, res) {
    try {
        const { id } = req.params;
        const patient = await patientModel.findById(id);
        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        const drId = req.user.id;
        if (drId !== patient.drId) {
            return res.status(403).json({
                message: "You are not authorized to fatch this patient"
            });
        }

        return res.status(200).json({
            message: "Patient fetched successfully",
            patient
        });
    }
    catch (error) {
        console.log(error);
    }
}

export async function updatePatient(req, res) {
    try {
        const { id } = req.params;
        const patient = await patientModel.findById(id);
        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }
        const drId = req.user.id;
        if (drId !== patient.drId) {
            return res.status(403).json({
                message: "You are not authorized to update this patient"
            });
        }
        const { prescription } = req.body;
        if (!prescription) {
            return res.status(404).json({
                message: "Prescription is required"
            });
        }

        // check medicine stock 
        const medicineUpdates = [];
        const prescriptionsArray = Array.isArray(prescription) ? prescription : [prescription];

        for (const p of prescriptionsArray) {
            if (p && p.medicine && Array.isArray(p.medicine)) {
                for (const med of p.medicine) {
                    const { medicineId, quantity: prescribedQty } = med;

                    if (!medicineId || prescribedQty === undefined) {
                        return res.status(400).json({
                            message: "Medicine ID and quantity are required in prescription"
                        });
                    }

                    // Find medicine in database
                    const medicineDoc = await medicineModel.findOne({
                        _id: medicineId,
                        drId: req.user.id
                    });

                    if (!medicineDoc) {
                        return res.status(404).json({
                            message: `Medicine with ID ${medicineId} not found or you are not authorized`
                        });
                    }

                    if (medicineDoc.quantity < prescribedQty) {
                        return res.status(400).json({
                            message: `Insufficient stock for medicine "${medicineDoc.medicineName}". Available: ${medicineDoc.quantity}, Prescribed: ${prescribedQty}`
                        });
                    }

                    // Populate medicineName and price from database
                    med.medicineName = medicineDoc.medicineName;
                    med.price = medicineDoc.unitPrice * prescribedQty;

                    medicineUpdates.push({
                        doc: medicineDoc,
                        prescribedQty
                    });
                }
            }
        }

        // Perform the updates (decrease quantity & recalculate totalPrice)
        for (const update of medicineUpdates) {
            const { doc, prescribedQty } = update;
            doc.quantity -= prescribedQty;
            doc.totalPrice = doc.unitPrice * doc.quantity;
            await doc.save();
        }

        //Check priscription is array or not
        const prescriptionsCheck = Array.isArray(prescription) ? prescription : [prescription];
        for (const p of prescriptionsCheck) {
            for (const med of p.medicine) {
                const { medicineId, quantity: prescribedQty } = med;
                if (!medicineId || prescribedQty === undefined) {
                    return res.status(400).json({
                        message: "Medicine ID and quantity are required in prescription"
                    });
                }
            }
            if (!p.note) {
                return res.status(400).json({
                    message: "Note is required"
                });
            }
            if (!p.totalPrice) {
                return res.status(400).json({
                    message: "Total Price is required"
                });
            }
        }

        // update prescription
        patient.prescription.push(...prescriptionsArray);
        await patient.save();

        return res.status(200).json({
            message: "Patient updated successfully",
            patient
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function updatePatientData(req, res) {
    try {
        const { id } = req.params;
        const patient = await patientModel.findById(id);
        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }
        const drId = req.user.id;
        if (drId !== patient.drId) {
            return res.status(403).json({
                message: "You are not authorized to update this patient"
            });
        }
        const { patientName, patientAge, patientGender, phonenumber, region } = req.body;
        if (patientName) {
            patient.patientName = patientName;
        }
        if (patientAge) {
            patient.patientAge = patientAge;
        }
        if (patientGender) {
            patient.patientGender = patientGender;
        }
        if (phonenumber) {
            patient.phonenumber = phonenumber;
        }
        if (region) {
            patient.region = region;
        }
        await patient.save();
        return res.status(200).json({
            message: "Patient updated successfully",
            patient
        });
    }
    catch (error) {
        console.log(error);
    }
}

//After Save Only for 24 hours

export async function editPrescriptionInfo(req, res) {
    try {
        const { id } = req.params;
        const patient = await patientModel.findById(id);
        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }
        const drId = req.user.id;
        if (drId !== patient.drId) {
            return res.status(403).json({
                message: "You are not authorized to update this patient"
            });
        }
        const { patientName, patientAge, patientGender, phonenumber, region, prescription } = req.body;

        let isDeleted = false;
        if (prescription) {
            const prescriptionObj = Array.isArray(prescription) ? prescription[0] : prescription;
            if (!prescriptionObj) {
                return res.status(400).json({
                    message: "Prescription object is required"
                });
            }
            const { prescriptionId, note, totalPrice, medicine } = prescriptionObj;
            if (!prescriptionId) {
                return res.status(400).json({
                    message: "Prescription ID is required"
                });
            }
            const existingPrescription = patient.prescription.id(prescriptionId);
            if (!existingPrescription) {
                return res.status(404).json({
                    message: "Prescription not found"
                });
            }
            const checkDate = existingPrescription.date;
            const dateNow = new Date();
            const diffInMilliseconds = dateNow - checkDate;
            const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
            if (diffInSeconds > 86400) {
                return res.status(403).json({
                    message: "You can only update the prescription within 24 hours"
                });
            }
            if (note) {
                existingPrescription.note = note;
            }
            if (totalPrice) {
                existingPrescription.totalPrice = totalPrice;
            }
            if (medicine && Array.isArray(medicine)) {
                if (totalPrice === undefined || totalPrice === null || totalPrice === "") {
                    return res.status(400).json({
                        message: "Total Price is required"
                    });
                }
                // Validate input structure
                for (const med of medicine) {
                    if (!med.medicineId || med.quantity === undefined) {
                        return res.status(400).json({
                            message: "Medicine ID and quantity are required in prescription"
                        });
                    }
                }

                // Map old medicines (medicineId -> quantity)
                const oldMedMap = new Map();
                for (const oldMed of existingPrescription.medicine) {
                    oldMedMap.set(oldMed.medicineId.toString(), oldMed.quantity);
                }

                // Map new medicines (medicineId -> quantity)
                const newMedMap = new Map();
                for (const newMed of medicine) {
                    newMedMap.set(newMed.medicineId.toString(), newMed.quantity);
                }

                // Get all unique medicine IDs involved
                const allMedIds = new Set([...oldMedMap.keys(), ...newMedMap.keys()]);
                const medicineUpdates = [];

                for (const medicineId of allMedIds) {
                    const oldQty = oldMedMap.get(medicineId) || 0;
                    const newQty = newMedMap.get(medicineId) || 0;
                    const delta = newQty - oldQty;

                    if (delta === 0) continue;

                    // Find medicine in database
                    const medicineDoc = await medicineModel.findOne({
                        _id: medicineId,
                        drId: req.user.id
                    });

                    if (!medicineDoc) {
                        return res.status(404).json({
                            message: `Medicine with ID ${medicineId} not found or you are not authorized`
                        });
                    }

                    // Check stock availability if prescribing more
                    if (delta > 0 && medicineDoc.quantity < delta) {
                        return res.status(400).json({
                            message: `Insufficient stock for medicine "${medicineDoc.medicineName}". Available: ${medicineDoc.quantity}, Needed: ${delta}`
                        });
                    }

                    medicineUpdates.push({
                        doc: medicineDoc,
                        delta,
                        newQty,
                        unitPrice: medicineDoc.unitPrice,
                        medicineId
                    });
                }

                // Perform updates on medicine inventory
                for (const update of medicineUpdates) {
                    const { doc, delta } = update;
                    doc.quantity -= delta;
                    doc.totalPrice = doc.unitPrice * doc.quantity;
                    await doc.save();
                }

                // Reconstruct updated medicine array for the prescription with calculated prices
                const updatedPrescriptionMedicine = [];
                for (const med of medicine) {
                    const updateObj = medicineUpdates.find(u => u.medicineId === med.medicineId.toString());
                    let unitPrice = 0;
                    let medicineName = med.medicineName || "";
                    if (updateObj) {
                        unitPrice = updateObj.unitPrice;
                        if (!medicineName) {
                            medicineName = updateObj.doc.medicineName;
                        }
                    } else {
                        const medicineDoc = await medicineModel.findOne({
                            _id: med.medicineId,
                            drId: req.user.id
                        });
                        if (medicineDoc) {
                            unitPrice = medicineDoc.unitPrice;
                            if (!medicineName) {
                                medicineName = medicineDoc.medicineName;
                            }
                        }
                    }

                    updatedPrescriptionMedicine.push({
                        medicineId: med.medicineId,
                        medicineName: medicineName,
                        quantity: med.quantity,
                        price: unitPrice * med.quantity
                    });
                }

                existingPrescription.medicine = updatedPrescriptionMedicine;

                // totalPrice is required and was already set above

                // If no medicines are left, completely delete the prescription
                if (updatedPrescriptionMedicine.length === 0) {
                    patient.prescription.pull(prescriptionId);
                }
            }
            isDeleted = !patient.prescription.id(prescriptionId);
        }

        if (patientName !== undefined) {
            patient.patientName = patientName;
        }
        if (patientAge !== undefined) {
            patient.patientAge = patientAge;
        }
        if (patientGender !== undefined) {
            patient.patientGender = patientGender;
        }
        if (phonenumber !== undefined) {
            patient.phonenumber = phonenumber;
        }
        if (region !== undefined) {
            patient.region = region;
        }

        await patient.save();

        let message = "Patient updated successfully";
        if (prescription) {
            message = isDeleted ? "Prescription deleted successfully" : "Prescription updated successfully";
        }

        return res.status(200).json({
            message,
            patient
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function deletePrescription(req, res) {
    try {
        const { id } = req.params;
        const patient = await patientModel.findById(id);
        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }
        const drId = req.user.id;
        if (drId !== patient.drId) {
            return res.status(403).json({
                message: "You are not authorized to delete this prescription"
            });
        }

        const { prescriptionId } = req.body;
        if (!prescriptionId) {
            return res.status(404).json({
                message: "Prescription is required"
            });
        }
        const prescription = patient.prescription.id(prescriptionId);
        if (!prescription) {
            return res.status(404).json({
                message: "Prescription not found"
            });
        }

        const { checkDate } = prescription;
        const dateNow = new Date();
        const diffInMilliseconds = dateNow - checkDate;
        const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
        if (diffInSeconds > 86400) {
            return res.status(403).json({
                message: "You can only delete the prescription within 24 hours"
            });
        }
        // Restore medicine quantities in stock
        if (prescription.medicine && Array.isArray(prescription.medicine)) {
            for (const med of prescription.medicine) {
                const { medicineId, quantity } = med;
                if (medicineId && quantity !== undefined) {
                    const medicineDoc = await medicineModel.findOne({
                        _id: medicineId,
                        drId: req.user.id
                    });
                    if (medicineDoc) {
                        medicineDoc.quantity += Number(quantity);
                        medicineDoc.totalPrice = medicineDoc.unitPrice * medicineDoc.quantity;
                        await medicineDoc.save();
                    }
                }
            }
        }

        patient.prescription.pull(prescriptionId);
        if (patient.prescription.length === 0) {
            await patientModel.findByIdAndDelete(id);
            return res.status(200).json({
                message: "Prescription and Patient deleted successfully",
                patientDeleted: true,
            });
        }
        await patient.save();
        return res.status(200).json({
            message: "Prescription deleted successfully",
            patient
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// export async function deletePatientToday(req, res) {
//     try {
//         const { id } = req.params;
//         const patient = await patientModel.findById(id);
//         if (!patient) {
//             return res.status(404).json({
//                 message: "Patient not found"
//             });
//         }
//         const drId = req.user.id;
//         if (drId !== patient.drId) {
//             return res.status(403).json({
//                 message: "You are not authorized to delete this patient"
//             });
//         }

//         const checkDate = new Date();
//         const diffInMilliseconds = checkDate - patient.createdAt;
//         const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
//         if (diffInSeconds > 86400) {
//             return res.status(403).json({
//                 message: "You can only delete the prescription within 24 hours"
//             });
//         }

//         // Restore medicine quantities in stock
//         if (patient.prescription && Array.isArray(patient.prescription)) {
//             for (const med of patient.prescription) {
//                 const { medicineId, quantity } = med;
//                 if (medicineId && quantity !== undefined) {
//                     const medicineDoc = await medicineModel.findOne({
//                         _id: medicineId,
//                         drId: req.user.id
//                     });
//                     if (medicineDoc) {
//                         medicineDoc.quantity += Number(quantity);
//                         medicineDoc.totalPrice = medicineDoc.unitPrice * medicineDoc.quantity;
//                         await medicineDoc.save();
//                     }
//                 }
//             }
//         }

//         await patientModel.findByIdAndDelete(id);

//         return res.status(200).json({
//             message: "Patient deleted successfully"
//         });
//     }
//     catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             message: "Internal server error"
//         });
//     }
// }

//delete the prescription which have difference of more then 30 days
export async function deleteOldPrescription(req, res) {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);

        const result = await patientModel.updateMany(
            {},
            { $pull: { prescription: { createdAt: { $lt: cutoffDate } } } }
        );

        console.log(`[Cron Job/API] Deleted old prescriptions. Modified documents: ${result.modifiedCount}`);

        if (res) {
            return res.status(200).json({
                message: "Old prescriptions deleted successfully",
                modifiedCount: result.modifiedCount
            });
        }
    }
    catch (error) {
        console.error("Error deleting old prescriptions:", error);
        if (res) {
            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
}

//delete patient
export async function deletePatient(req, res) {
    try {
        const { id } = req.params;
        const patient = await patientModel.findById(id);
        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }
        const drId = req.user.id;
        if (drId !== patient.drId) {
            return res.status(403).json({
                message: "You are not authorized to delete this patient"
            });
        }

        const checkDate = new Date();
        const diffInMilliseconds = checkDate - patient.createdAt;
        const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

        // Restore medicine quantities in stock if patient is deleted within 12 hours
        if (diffInHours < 12) {
            // Restore medicine quantities in stock
            if (patient.prescription && Array.isArray(patient.prescription)) {
                for (const pres of patient.prescription) {
                    if (pres.medicine && Array.isArray(pres.medicine)) {
                        for (const med of pres.medicine) {
                            const { medicineId, quantity } = med;
                            if (medicineId && quantity !== undefined) {
                                const medicineDoc = await medicineModel.findOne({
                                    _id: medicineId,
                                    drId: req.user.id
                                });
                                if (medicineDoc) {
                                    medicineDoc.quantity += Number(quantity);
                                    medicineDoc.totalPrice = medicineDoc.unitPrice * medicineDoc.quantity;
                                    await medicineDoc.save();
                                }
                            }
                        }
                    }
                }
            }
        }


        await patientModel.findByIdAndDelete(id);
        return res.status(200).json({
            message: "Patient deleted successfully",
            patient
        });
    }
    catch (error) {
        console.log(error);
    }
}