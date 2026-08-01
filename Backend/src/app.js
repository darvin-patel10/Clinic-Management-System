import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import config from "./config/config.js";
import connectDB from "./config/database.js";

import authRouter from "./routes/auth.routes.js"
import medicineRouter from "./routes/medicines.routes.js"
import patientRouter from "./routes/patient.routes.js";
import accountRouter from "./routes/account.routes.js";

const app = express();

// Filter out undefined/empty entries — if an env var is missing in Vercel
// it would be stored as undefined in the array, which causes .includes(origin)
// to never match any real URL and silently blocks ALL cross-origin requests.
const allowedOrigins = [
    config.CLIENT_URL,
    config.DEV_URL,
].filter(Boolean);

// ---------------------------------------------------------------------------
// CORS — must be registered BEFORE every other middleware and route so that
// OPTIONS preflight requests from the browser are answered immediately and
// never fall through to auth/route middleware (which would reject them).
// ---------------------------------------------------------------------------
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (Postman, curl, server-to-server, mobile)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS: " + origin));
        }
    },
    credentials: true,            // Required for cross-origin cookies + Authorization headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",          // Required: the browser checks this in the preflight
        "X-Requested-With",
    ],
    exposedHeaders: [
        "X-New-Access-Token",     // The auth middleware sends this on silent token refresh
    ],
};

// Apply CORS to all routes (sets the Access-Control-* headers on every response).
// cors() with preflightContinue: false (the default) also handles OPTIONS preflight
// requests automatically — no separate app.options() call is needed.
app.use(cors(corsOptions));

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// ---------------------------------------------------------------------------
// Serverless DB-connection middleware
// ---------------------------------------------------------------------------
// On Vercel every request can land on a cold container with no active DB
// connection.  This middleware awaits connectDB() (which caches the promise)
// BEFORE calling next(), so route handlers never touch Mongoose without a
// live connection.
// ---------------------------------------------------------------------------
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("[Middleware] DB connection failed:", err.message);
        res.status(503).json({ message: "Database unavailable. Please try again later." });
    }
});

// ---------------------------------------------------------------------------
// Root Route — Health / status response when visiting the API base URL
// ---------------------------------------------------------------------------
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Clinic_Management_System API is running",
        status: "online",
        timestamp: new Date().toISOString(),
    });
});

// ---------------------------------------------------------------------------
// Diagnostic route — deploy, hit GET /api/db-check, verify readyState === 1
// ---------------------------------------------------------------------------
app.get("/api/db-check", (req, res) => {
    res.json({
        readyState: mongoose.connection.readyState,
        // 0 = disconnected | 1 = connected | 2 = connecting | 3 = disconnecting
        readyStateLabel: ["disconnected", "connected", "connecting", "disconnecting"][
            mongoose.connection.readyState
        ] ?? "unknown",
        mongoUriDefined: !!process.env.MONGO_URI,
    });
});

// routes
app.use("/api/auth", authRouter);
app.use("/api/medicines", medicineRouter);
app.use("/api/patient", patientRouter);
app.use("/api/account", accountRouter)

// Fallback 404 handler
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

export default app;
