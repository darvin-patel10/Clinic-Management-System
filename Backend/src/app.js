import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config/config.js";

import authRouter from "./routes/auth.routes.js"
import medicineRouter from "./routes/medicines.routes.js"
import patientRouter from "./routes/patient.routes.js";

const app = express();

app.use(cors({
    origin: config.CLIENT_URL,             // Configured in .env file
    credentials: true,                     // allow cookies (refreshToken)
    exposedHeaders: ["X-New-Access-Token"] // let the browser read this header
}));

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// routes
app.use("/api/auth", authRouter);
app.use("/api/medicines", medicineRouter);
app.use("/api/patient", patientRouter)

export default app;
