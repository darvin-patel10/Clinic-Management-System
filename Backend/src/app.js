import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth.routes.js"
import medicineRouter from "./routes/medicines.routes.js"

const app = express();

app.use(cors({
    origin: "http://localhost:5173",       // Vite dev server — update if different
    credentials: true,                     // allow cookies (refreshToken)
    exposedHeaders: ["X-New-Access-Token"] // let the browser read this header
}));

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// routes
app.use("/api/auth", authRouter);
app.use("/api/medicines", medicineRouter);

export default app;
