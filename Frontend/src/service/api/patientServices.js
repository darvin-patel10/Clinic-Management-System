import { patientEndpoints } from "../config";
import { apiClient } from "../httpServices";

export const AddPatientService = async (payload) => {
    const { data } = await apiClient.post(patientEndpoints.addPatient, payload);
    return data;
};

export const PatientsService = async () => {
    const { data } = await apiClient.get(patientEndpoints.patients);
    return data;
};

export const FetchNextUniqueNoService = async () => {
    const { data } = await apiClient.get(patientEndpoints.nextUniqueNo);
    return data;
};

export const SearchPatientService = async (params) => {
    const { data } = await apiClient.get(patientEndpoints.searchPatient, { params });
    return data;
};

export const FetchPatientService = async (id) => {
    const { data } = await apiClient.get(`${patientEndpoints.fetchPatient}/${id}`);
    return data;
};

export const UpdatePatientService = async (id, payload) => {
    const { data } = await apiClient.put(`${patientEndpoints.updatePatient}/${id}`, payload);
    return data;
};

export const UpdatePatientDataService = async (id, payload) => {
    const { data } = await apiClient.put(`${patientEndpoints.updatePatientData}/${id}`, payload);
    return data;
};

export const EditPrescriptionInfoService = async (id, payload) => {
    const { data } = await apiClient.put(`${patientEndpoints.editPrescriptionInfo}/${id}`, payload);
    return data;
};

export const DeletePrescriptionService = async (id, payload) => {
    const { data } = await apiClient.delete(`${patientEndpoints.deletePrescription}/${id}`, { data: payload });
    return data;
};

export const DeletePatientService = async (id) => {
    const { data } = await apiClient.delete(`${patientEndpoints.deletePatient}/${id}`);
    return data;
};

export const GetDashboardStatsService = async () => {
    const { data } = await apiClient.get(patientEndpoints.dashboardStats);
    return data;
};
