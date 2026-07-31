import { accountEndpoints } from "../config.js"
import { apiClient } from "../httpServices.js"

export async function updateDetails(data) {
    try {
        const response = await apiClient.put(accountEndpoints.updateDetails, data);
        return response;
    }
    catch (err) {
        console.log(err);
        return err;
    }
}