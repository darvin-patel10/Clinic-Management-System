/**
 * api.js — Central Axios instance for the Clinic Management System
 *
 * Handles two things automatically so the rest of the app never has to:
 *
 *  REQUEST interceptor:
 *    - Reads the access token from localStorage and injects it into every
 *      request as "Authorization: Bearer <token>"
 *
 *  RESPONSE interceptor:
 *    - Reads the "X-New-Access-Token" header. When the backend silently
 *      refreshed an expired token, it sends the new one here. We save it
 *      to localStorage so the next request uses the fresh token.
 *    - If the server returns 401 (session fully expired / logged out),
 *      clears the stored token and redirects to the login page.
 */

import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api",   // change port if yours is different
    withCredentials: true,                  // sends the refreshToken cookie automatically
});

// ── REQUEST interceptor: attach access token ──────────────────────────────────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

// ── RESPONSE interceptor: pick up silently refreshed token + handle 401 ───────
api.interceptors.response.use(
    (response) => {
        // If the backend issued a new access token (expired but refresh was valid),
        // save it so the next request uses the fresh one.
        const newToken = response.headers["x-new-access-token"];
        if (newToken) {
            localStorage.setItem("accessToken", newToken);
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Session fully expired or revoked — force the user to log in again
            localStorage.removeItem("accessToken");
            window.location.href = "/login";   // adjust to your login route
        }
        return Promise.reject(error);
    }
);

export default api;
