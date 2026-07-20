import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

// ─── Base URL ─────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

// ─── Token Helpers ────────────────────────────────────────────────────────────

/** Read the access token stored after login / email-verify / token-refresh. */
export function getAccessToken() {
    return localStorage.getItem("token");
}

/** Persist a new access token (e.g. received in X-New-Access-Token header). */
export function setAccessToken(token) {
    localStorage.setItem("token", token);
}

/** Remove the access token on logout or auth failure. */
export function clearAccessToken() {
    localStorage.removeItem("token");
}

// ─── Session Verification ─────────────────────────────────────────────────────

/**
 * Calls GET /api/auth/get-me with the current access token.
 *
 * The backend's `authenticate` middleware handles the full chain:
 *  - Verifies the JWT signature / expiry
 *  - If the access token is EXPIRED it silently refreshes it using
 *    the httpOnly refreshToken cookie and returns the new token in the
 *    "X-New-Access-Token" response header.
 *  - Checks the session still exists and hasn't been revoked.
 *
 * Returns `true` when the session is valid, `false` otherwise.
 */
async function verifySession() {
    const token = getAccessToken();

    // No token in storage → definitely not authenticated
    if (!token) return false;

    try {
        const res = await fetch(`${API_BASE}/api/auth/get-me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            // Include httpOnly refreshToken cookie for silent refresh
            credentials: "include",
        });

        if (res.ok) {
            // Pick up a silently-refreshed access token if the backend issued one
            const newToken = res.headers.get("X-New-Access-Token");
            if (newToken) {
                setAccessToken(newToken);
            }
            return true;
        }

        // 401 → token invalid / session revoked / refresh cookie also expired
        if (res.status === 401) {
            clearAccessToken();
            return false;
        }

        return false;
    } catch {
        // Network error — treat as unauthenticated to be safe
        return false;
    }
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────

function AuthLoadingSpinner() {
    return (
        <div style={styles.overlay}>
            <div style={styles.spinner} />
        </div>
    );
}

// ─── ProtectedRoute ───────────────────────────────────────────────────────────

/**
 * Wraps routes that require an active, server-verified session.
 *
 * Flow:
 *  1. Shows a loading spinner while verifying the session with the backend.
 *  2. If the session is valid  → renders {children}.
 *  3. If the session is invalid → redirects to {redirectTo} (default: "/signin").
 *
 * @param {React.ReactNode} children  - The protected page/component.
 * @param {string}          redirectTo - Where to send unauthenticated users.
 */
export function ProtectedRoute({ children, redirectTo = "/signin" }) {
    const [status, setStatus] = useState("checking"); // "checking" | "auth" | "unauth"

    useEffect(() => {
        let cancelled = false;

        verifySession().then((isValid) => {
            if (!cancelled) setStatus(isValid ? "auth" : "unauth");
        });

        return () => {
            cancelled = true;
        };
    }, []);

    if (status === "checking") return <AuthLoadingSpinner />;
    if (status === "unauth") return <Navigate to={redirectTo} replace />;
    return <>{children}</>;
}

// ─── PublicRoute ──────────────────────────────────────────────────────────────

/**
 * Wraps public-only routes (e.g. Sign In, Sign Up, Forgot Password).
 * Redirects already-authenticated users away from these pages.
 *
 * Flow:
 *  1. Shows a loading spinner while verifying the session with the backend.
 *  2. If the session is valid   → redirects to {redirectTo} (default: "/").
 *  3. If the session is invalid → renders {children}.
 *
 * @param {React.ReactNode} children  - The public page/component.
 * @param {string}          redirectTo - Where to send authenticated users.
 */
export function PublicRoute({ children, redirectTo = "/" }) {
    const [status, setStatus] = useState("checking"); // "checking" | "auth" | "unauth"

    useEffect(() => {
        let cancelled = false;

        verifySession().then((isValid) => {
            if (!cancelled) setStatus(isValid ? "auth" : "unauth");
        });

        return () => {
            cancelled = true;
        };
    }, []);

    if (status === "checking") return <AuthLoadingSpinner />;
    if (status === "auth") return <Navigate to={redirectTo} replace />;
    return <>{children}</>;
}

// ─── Inline Styles (no external CSS dependency) ───────────────────────────────

const styles = {
    overlay: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "var(--bg-color, #f9fafb)",
    },
    spinner: {
        width: "40px",
        height: "40px",
        border: "4px solid rgba(99, 102, 241, 0.2)",
        borderTopColor: "#6366f1",
        borderRadius: "50%",
        animation: "spin 0.75s linear infinite",
    },
};

// Inject the @keyframes once (safe to call multiple times)
if (typeof document !== "undefined") {
    const styleId = "__rg_spinner_keyframes__";
    if (!document.getElementById(styleId)) {
        const tag = document.createElement("style");
        tag.id = styleId;
        tag.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
        document.head.appendChild(tag);
    }
}
