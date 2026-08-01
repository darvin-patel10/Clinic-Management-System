import axios from "axios";

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

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

function handleAuthFailure() {
    clearToken();

    // Avoid redirect loops if we're already on the sign-in page
    if (!window.location.pathname.startsWith("/signin")) {
        window.location.replace("/signin");
    }
}

// ─── Error Message Extractor ──────────────────────────────────────────────────

function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
    const data = error?.response?.data;

    if (!data) {
        if (error?.code === "ERR_NETWORK") return "Network error. Please check your connection.";
        if (error?.code === "ECONNABORTED") return "Request timed out. Please try again.";
        return fallback;
    }

    return data.message ?? data.massage ?? fallback;
}

// ─── Axios Instance ───────────────────────────────────────────────────────────

const apiClient = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
    timeout: 15_000,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.request.use(
    (config) => {
        const token = getToken();

        if (token) {
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
        const newToken = response.headers["x-new-access-token"];
        if (newToken) {
            saveToken(newToken);
        }

        return response;
    },
    (error) => {
        const status = error?.response?.status;

        if (status === 401) {
            handleAuthFailure();
            return Promise.reject(error);
        }

        const message = getApiErrorMessage(error);
        const enriched = new Error(message);
        enriched.status = status;
        enriched.originalError = error;

        return Promise.reject(enriched);
    },
);

// ─── Exports ──────────────────────────────────────────────────────────────────

export { apiClient, getToken, saveToken, clearToken };
