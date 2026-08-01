import { Router } from "express";
import * as accountController from "../controllers/account.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const accountRouter = Router();

accountRouter.use(authenticate);

accountRouter.get("/details/:id", accountController.accountDetails);

// accountRouter.put("/change-password", accountController.changePassword);
accountRouter.put("/update-details", accountController.updateDetails);

export default accountRouter;