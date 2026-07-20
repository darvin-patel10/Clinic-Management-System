/**
 * httpServices.js — Central Axios instance for the Clinic Management System
 *
 * Aligned with the backend's auth architecture:
 *  - Access token  : short-lived JWT (15 min), stored in localStorage as "token"
 *  - Refresh token : long-lived JWT (7 days), stored as an httpOnly cookie
 *
 * REQUEST interceptor
 *  → Reads "token" from localStorage and injects it as "Authorization: Bearer <token>"
 *
 * RESPONSE interceptor (success path)
 *  → Reads "X-New-Access-Token" header. When the backend's authenticate middleware
 *    silently refreshes an expired access token (using the httpOnly cookie) it sends
 *    the new token in this header — we save it so the next request uses it.
 *
 * RESPONSE interceptor (error path)
 *  → 401 → the session is fully expired or revoked (refresh cookie also invalid).
 *           Clears localStorage and redirects to /signin.
 *  → Any other error → extracts the most useful error message from the response
 *    and rejects with it so call-sites can display it directly.
 */

import axios from "axios";

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

/** localStorage key used by routeGuards.jsx and this module — keep in sync. */
const TOKEN_KEY = "token";

// ─── Token Helpers ────────────────────────────────────────────────────────────

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

// ─── Auth Failure Handler ─────────────────────────────────────────────────────

/**
 * Called when the backend returns 401.
 * Clears all local auth state and redirects to the sign-in page.
 */
function handleAuthFailure() {
    clearToken();

    // Avoid redirect loops if we're already on the sign-in page
    if (!window.location.pathname.startsWith("/signin")) {
        window.location.replace("/signin");
    }
}

// ─── Error Message Extractor ──────────────────────────────────────────────────

/**
 * Extracts the most useful human-readable message from an Axios error.
 *
 * Handles the backend's mixed "message" / "massage" typo gracefully.
 *
 * @param {import("axios").AxiosError} error
 * @param {string} fallback
 * @returns {string}
 */
function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
    const data = error?.response?.data;

    if (!data) {
        // Network / timeout error — no response at all
        if (error?.code === "ERR_NETWORK") return "Network error. Please check your connection.";
        if (error?.code === "ECONNABORTED") return "Request timed out. Please try again.";
        return fallback;
    }

    // Backend sometimes sends "message", sometimes "massage" (typo in login/register)
    return data.message ?? data.massage ?? fallback;
}

// ─── Axios Instance ───────────────────────────────────────────────────────────

const apiClient = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // send the httpOnly refreshToken cookie on every request
    timeout: 15_000,       // 15 s — avoid hanging requests
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.request.use(
    (config) => {
        const token = getToken();

        if (token) {
            // Strip any accidental "Bearer " prefix that might have been stored
            const raw = token.replace(/^Bearer\s+/i, "");
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${raw}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.response.use(
    (response) => {
        // Backend silently refreshed the access token — persist the new one
        const newToken = response.headers["x-new-access-token"];
        if (newToken) {
            saveToken(newToken);
        }

        return response;
    },
    (error) => {
        const status = error?.response?.status;

        if (status === 401) {
            // Session fully expired or revoked — force re-login
            handleAuthFailure();
            return Promise.reject(error);
        }

        // For all other errors, enrich the rejection with a readable message
        // so call-sites can do: catch(err) { setError(err.message) }
        const message = getApiErrorMessage(error);
        const enriched = new Error(message);
        enriched.status = status;
        enriched.originalError = error;

        return Promise.reject(enriched);
    },
);

// ─── Exports ──────────────────────────────────────────────────────────────────

export { apiClient, getToken, saveToken, clearToken };
