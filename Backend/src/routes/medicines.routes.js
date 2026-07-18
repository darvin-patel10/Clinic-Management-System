import { Router } from "express";
import * as medicineController from "../controllers/medicineRouter.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const medicineRouter = Router();

medicineRouter.use(authenticate);

medicineRouter.post("/add-medicine", medicineController.addMedicine);
medicineRouter.put("/update-medicine/:id", medicineController.updateMedicine);
medicineRouter.put("/add-quantity/:id", medicineController.addQuntity);
medicineRouter.delete("/delete-medicine/:id", medicineController.delateMedicine);
medicineRouter.get("/all-medicine", medicineController.allMedicine);
medicineRouter.get("/serch-medicine", medicineController.searchMedicine);

export default medicineRouter;

// medicineRouter.post("/add-medicine",