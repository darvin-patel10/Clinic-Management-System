import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { apiClient } from "../service/httpServices";

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
 * Calls GET /api/auth/get-me via the shared apiClient.
 * Returns { isValid: boolean, user: object | null }.
 */
async function verifySession() {
    const token = getAccessToken();

    // No token in storage → definitely not authenticated
    if (!token) return { isValid: false, user: null };

    try {
        const { data } = await apiClient.get("auth/get-me");
        return { isValid: true, user: data?.user || null };
    } catch {
        return { isValid: false, user: null };
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
 * Enforces that users must fill clinic details before accessing other protected routes.
 */
export function ProtectedRoute({ children, redirectTo = "/signin" }) {
    const location = useLocation();
    const [status, setStatus] = useState("checking"); // "checking" | "auth" | "unauth"
    const [hasClinicInfo, setHasClinicInfo] = useState(false);

    useEffect(() => {
        let cancelled = false;

        verifySession().then(({ isValid, user }) => {
            if (!cancelled) {
                if (!isValid) {
                    setStatus("unauth");
                } else {
                    const clinicName = user?.clinicinfo?.clinicName;
                    const isClinicFilled = Boolean(clinicName && clinicName.trim() !== "");
                    setHasClinicInfo(isClinicFilled);
                    setStatus("auth");
                }
            }
        });

        return () => {
            cancelled = true;
        };
    }, []);

    if (status === "checking") return <AuthLoadingSpinner />;
    if (status === "unauth") return <Navigate to={redirectTo} replace />;

    const isMedicalInfoPage = location.pathname === "/medical-info";

    // If user has NOT filled clinic details, force redirect to /medical-info
    if (!hasClinicInfo && !isMedicalInfoPage) {
        return <Navigate to="/medical-info" replace />;
    }

    return <>{children}</>;
}

// ─── PublicRoute ──────────────────────────────────────────────────────────────

/**
 * Wraps public-only routes (e.g. Sign In, Sign Up, Forgot Password).
 * Redirects already-authenticated users away from these pages.
 */
export function PublicRoute({ children, redirectTo = "/dashboard" }) {
    const [status, setStatus] = useState("checking"); // "checking" | "auth" | "unauth"
    const [hasClinicInfo, setHasClinicInfo] = useState(false);

    useEffect(() => {
        let cancelled = false;

        verifySession().then(({ isValid, user }) => {
            if (!cancelled) {
                if (!isValid) {
                    setStatus("unauth");
                } else {
                    const clinicName = user?.clinicinfo?.clinicName;
                    const isClinicFilled = Boolean(clinicName && clinicName.trim() !== "");
                    setHasClinicInfo(isClinicFilled);
                    setStatus("auth");
                }
            }
        });

        return () => {
            cancelled = true;
        };
    }, []);

    if (status === "checking") return <AuthLoadingSpinner />;
    if (status === "auth") {
        if (!hasClinicInfo) return <Navigate to="/medical-info" replace />;
        return <Navigate to={redirectTo} replace />;
    }
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
