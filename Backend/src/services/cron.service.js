import cron from "node-cron";
import { deleteOldPrescription } from "../controllers/patient.controller.js";

// Initializes and starts all scheduled background tasks.

export function initCronJobs() {
    // Schedule deleteOldPrescription to run once every 24 hours (at midnight: 00:00)
    // Cron syntax: minute hour day-of-month month day-of-week
    cron.schedule("0 0 * * *", async () => {
        console.log("[Cron Service] Running scheduled task: deleteOldPrescription...");
        try {
            await deleteOldPrescription();
        } catch (error) {
            console.error("[Cron Service] Failed to execute scheduled task:", error);
        }
    });

    console.log("[Cron Service] Scheduled job 'deleteOldPrescription' initialized to run every 24 hours.");
}
