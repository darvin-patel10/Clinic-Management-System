import { medicineEndpoints } from "../config";
import { apiClient } from "../httpServices";

export const AddMedicineService = async (payload) => {
    const { data } = await apiClient.post(
        medicineEndpoints.addMedicine,
        payload
    );
    return data;
};

export const UpdateMedicineService = async (id, payload) => {
    const { data } = await apiClient.put(
        `${medicineEndpoints.updateMedicine}/${id}`,
        payload
    );
    return data;
};

/**
 * Fetch all medicines from the inventory.
 * @returns {Promise<Object>} Response from the server containing the list of medicines.
 */
export const AllMedicinesService = async () => {
    const { data } = await apiClient.get(medicineEndpoints.allMedicines);
    return data;
};

/**
 * Search medicines by name.
 * @param {string} name Query name.
 * @returns {Promise<Object>} Response from the server.
 */
export const SearchMedicineService = async (name) => {
    const { data } = await apiClient.get(medicineEndpoints.searchMedicine, {
        params: { name }
    });
    return data;
};

export const AddQuantityService = async (id, quantity) => {
    const { data } = await apiClient.put(
        `${medicineEndpoints.addQuantity}/${id}`,
        { quantity }
    );
    return data;
};

export const DeleteMedicineService = async (id) => {
    const { data } = await apiClient.delete(
        `${medicineEndpoints.deleteMedicine}/${id}`
    );
    return data;
};

