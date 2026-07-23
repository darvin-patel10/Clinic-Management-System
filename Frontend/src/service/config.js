/**
 * config.js — API Endpoint Registry
 *
 * All backend route paths for the Clinic Management System.
 * Every path is relative to the axios baseURL (http://localhost:3000/api),
 * so do NOT include a leading slash or the "/api" prefix here.
 *
 * Usage:
 *   import { authEndpoints } from "./config";
 *   apiClient.post(authEndpoints.login, payload);
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────
// Mounted at: /api/auth
export const authEndpoints = {
    /** POST — Register a new user. Sends an OTP to their email. */
    register: "auth/register",

    /** POST — Verify the OTP sent after registration → issues access + refresh tokens. */
    verifyEmail: "auth/verify-email",

    /** POST — Sign in with email & password → issues access + refresh tokens. */
    login: "auth/login",

    /** GET  — Returns the currently authenticated user (requires Bearer token). */
    getMe: "auth/get-me",

    /** GET  — Silently refresh the access token using the httpOnly refresh cookie. */
    refreshToken: "auth/refresh-token",

    /** GET  — Revoke the current session and clear the refresh cookie. */
    logout: "auth/logout",

    /** POST — Send a password-reset OTP to the given email. */
    forgotPassword: "auth/forgot-password",

    /** POST — Verify the password-reset OTP → returns a short-lived resetToken. */
    otpVerify: "auth/otp-verify",

    /** POST — Set a new password using the resetToken returned by otpVerify. */
    resetPassword: "auth/reset-password",
};

// ─── Medicines ────────────────────────────────────────────────────────────────
// Mounted at: /api/medicines  (all routes require authentication)
export const medicineEndpoints = {
    /** POST — Add a new medicine to the inventory. */
    addMedicine: "medicines/add-medicine",

    /** PUT  — Update medicine details.   Append /:id */
    updateMedicine: "medicines/update-medicine",

    /** PUT  — Add stock quantity to a medicine.  Append /:id */
    addQuantity: "medicines/add-quantity",

    /** DELETE — Remove a medicine from the inventory.  Append /:id */
    deleteMedicine: "medicines/delete-medicine",

    /** GET  — Fetch all medicines. */
    allMedicines: "medicines/all-medicine",

    /** GET  — Search medicines by name/category.  Pass ?q=<query> */
    searchMedicine: "medicines/serch-medicine",
};

// ─── Patients ─────────────────────────────────────────────────────────────────
// Mounted at: /api/patient  (all routes require authentication)
export const patientEndpoints = {
    /** GET  — Search patients by name/phone.  Pass ?q=<query> */
    searchPatient: "patient/search-patient",

    /** POST — Register a new patient with their first prescription. */
    addPatient: "patient/add-patient",

    /** GET  — Fetch the next available auto-incrementing patient unique ID. */
    nextUniqueNo: "patient/next-uniqueno",

    /** GET  — Fetch a single patient's full record.  Append /:id */
    fetchPatient: "patient/fatch-patient",

    /** PUT  — Update core patient info (name, phone, etc.).  Append /:id */
    updatePatient: "patient/update-patient",

    /** PUT  — Update patient visit / prescription data.  Append /:id */
    updatePatientData: "patient/update-patient-data",

    /** PUT  — Edit prescription details (within 24-hour window).  Append /:id */
    editPrescriptionInfo: "patient/edit-prescription-info",

    /** DELETE — Delete a prescription (within 24-hour window).  Append /:id */
    deletePrescription: "patient/delete-prescription",

    /** DELETE — Bulk-delete prescriptions older than 30 days. */
    deleteOldPrescriptions: "patient/delete-old-prescription",

    /** DELETE — Permanently delete a patient and restore their medicines to stock.  Append /:id */
    deletePatient: "patient/delete-patient",

    /** GET  — Aggregate dashboard KPIs, today's patients, monthly & yearly historical data. */
    dashboardStats: "patient/dashboard-stats",
};
