import { authEndpoints } from "../config";
import { apiClient } from "../httpServices";

export const RegisterService = async (payload) => {
    const { data } = await apiClient.post(authEndpoints.register, payload);
    return data;
};

export const EmailVerify = async (payload) => {
    const { data } = await apiClient.post(authEndpoints.verifyEmail, payload);
    return data;
};

export const LoginService = async (payload) => {
    const { data } = await apiClient.post(authEndpoints.login, payload);
    return data;
};

export const LogoutService = async () => {
    try {
        const { data } = await apiClient.get(authEndpoints.logout);
        return data;
    } catch (err) {
        return null;
    }
};

export const GetMeService = async () => {
    const { data } = await apiClient.get(authEndpoints.getMe);
    return data;
};