
// ─── Auth ─────────────────────────────────────────────────────────────────────
// Mounted at: /api/auth
export const authEndpoints = {
    register: "auth/register",
    verifyEmail: "auth/verify-email",
    login: "auth/login",
    getMe: "auth/get-me",
    refreshToken: "auth/refresh-token",
    logout: "auth/logout",
    forgotPassword: "auth/forgot-password",
    otpVerify: "auth/otp-verify",
    resetPassword: "auth/reset-password",
    clinicInfo: "auth/clinic-info",
};

// ─── Medicines ────────────────────────────────────────────────────────────────
// Mounted at: /api/medicines
export const medicineEndpoints = {
    addMedicine: "medicines/add-medicine",
    updateMedicine: "medicines/update-medicine",
    addQuantity: "medicines/add-quantity",
    deleteMedicine: "medicines/delete-medicine",
    allMedicines: "medicines/all-medicine",
    searchMedicine: "medicines/serch-medicine",
};

// ─── Patients ─────────────────────────────────────────────────────────────────
// Mounted at: /api/patient
export const patientEndpoints = {
    searchPatient: "patient/search-patient",
    patients: "patient/patients",
    addPatient: "patient/add-patient",
    nextUniqueNo: "patient/next-uniqueno",
    fetchPatient: "patient/fatch-patient",
    updatePatient: "patient/update-patient",
    updatePatientData: "patient/update-patient-data",
    editPrescriptionInfo: "patient/edit-prescription-info",
    deletePrescription: "patient/delete-prescription",
    deleteOldPrescriptions: "patient/delete-old-prescription",
    deletePatient: "patient/delete-patient",
    dashboardStats: "patient/dashboard-stats",
};

export const accountEndpoints = {
    accountDetails: "account/details",
    updateDetails: "account/update-details",
}
