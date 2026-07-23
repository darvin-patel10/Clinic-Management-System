import { Router } from "express";
import * as patientController from "../controllers/patient.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const patientRouter = Router();

patientRouter.use(authenticate);

patientRouter.get("/search-patient", patientController.searchPatient);
patientRouter.get("/next-uniqueno", patientController.getNextUniqueNoRoute);
patientRouter.get("/dashboard-stats", patientController.getDashboardStats);
patientRouter.post("/add-patient", patientController.addPatient);
patientRouter.get("/fatch-patient/:id", patientController.fatchPatient);
patientRouter.put("/update-patient/:id", patientController.updatePatient);
patientRouter.put("/update-patient-data/:id", patientController.updatePatientData);

//only for 24 hours edit the prescription info
patientRouter.put("/edit-prescription-info/:id", patientController.editPrescriptionInfo);

//only for 24 hours delete the prescription
patientRouter.delete("/delete-prescription/:id", patientController.deletePrescription);

//Only for 24 hours delete the patient
// patientRouter.delete("/delete-patient-24/:id", patientController.deletePatientToday);

//delete the prescription which have difference of more then 30 days
patientRouter.delete("/delete-old-prescription", patientController.deleteOldPrescription);

// delete patient data and medicines from stock
patientRouter.delete("/delete-patient/:id", patientController.deletePatient);

export default patientRouter;