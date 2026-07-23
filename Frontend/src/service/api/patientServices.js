import { patientEndpoints } from "../config";
import { apiClient } from "../httpServices";

/**
 * Register/add a new patient with their initial prescription.
 * @param {Object} payload Patient and prescription details.
 * @returns {Promise<Object>} Response from the server.
 */
export const AddPatientService = async (payload) => {
    const { data } = await apiClient.post(patientEndpoints.addPatient, payload);
    return data;
};

/**
 * Fetch the next available unique patient ID.
 * @returns {Promise<Object>} Response containing the nextUniqueNo.
 */
export const FetchNextUniqueNoService = async () => {
    const { data } = await apiClient.get(patientEndpoints.nextUniqueNo);
    return data;
};

/**
 * Search patients by name, phone number, or unique number.
 * @param {Object} params Search parameters.
 * @returns {Promise<Object>} Response from the server.
 */
export const SearchPatientService = async (params) => {
    const { data } = await apiClient.get(patientEndpoints.searchPatient, { params });
    return data;
};

/**
 * Fetch a single patient's details by ID.
 * @param {string} id Patient ID.
 * @returns {Promise<Object>} Response from the server.
 */
export const FetchPatientService = async (id) => {
    const { data } = await apiClient.get(`${patientEndpoints.fetchPatient}/${id}`);
    return data;
};

/**
 * Add a new visit / prescription to a patient.
 * @param {string} id Patient ID.
 * @param {Object} payload Prescription payload.
 * @returns {Promise<Object>} Response from the server.
 */
export const UpdatePatientService = async (id, payload) => {
    const { data } = await apiClient.put(`${patientEndpoints.updatePatient}/${id}`, payload);
    return data;
};

/**
 * Update basic patient profile information.
 * @param {string} id Patient ID.
 * @param {Object} payload Patient fields (name, age, gender, phone, region).
 * @returns {Promise<Object>} Response from the server.
 */
export const UpdatePatientDataService = async (id, payload) => {
    const { data } = await apiClient.put(`${patientEndpoints.updatePatientData}/${id}`, payload);
    return data;
};

/**
 * Edit prescription details (only permitted within a 24-hour window).
 * @param {string} id Patient ID.
 * @param {Object} payload Edited prescription object.
 * @returns {Promise<Object>} Response from the server.
 */
export const EditPrescriptionInfoService = async (id, payload) => {
    const { data } = await apiClient.put(`${patientEndpoints.editPrescriptionInfo}/${id}`, payload);
    return data;
};

/**
 * Delete a specific prescription from a patient (only permitted within a 24-hour window).
 * @param {string} id Patient ID.
 * @param {Object} payload Payload containing { prescriptionId }.
 * @returns {Promise<Object>} Response from the server.
 */
export const DeletePrescriptionService = async (id, payload) => {
    const { data } = await apiClient.delete(`${patientEndpoints.deletePrescription}/${id}`, { data: payload });
    return data;
};

/**
 * Delete a patient and optionally restore stock of their prescriptions (if created < 12h ago).
 * @param {string} id Patient ID.
 * @returns {Promise<Object>} Response from the server.
 */
export const DeletePatientService = async (id) => {
    const { data } = await apiClient.delete(`${patientEndpoints.deletePatient}/${id}`);
    return data;
};

/**
 * Fetch aggregated dashboard statistics (KPIs, today's patients, monthly & yearly data).
 * @returns {Promise<Object>} Dashboard stats response from the server.
 */
export const GetDashboardStatsService = async () => {
    const { data } = await apiClient.get(patientEndpoints.dashboardStats);
    return data;
};
