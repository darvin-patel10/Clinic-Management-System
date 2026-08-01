import React, { useState, useEffect } from "react";
import { ClinicLogo } from "../assets/Icons/index.js";

/**
 * InitialLoader Component
 * Shows a animated logo splash screen when the user visits the site.
 * Uses sessionStorage to display on the initial visit/mount and fades out smoothly.
 */
export default function InitialLoader({ onComplete }) {
    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Start fade out transition after 1.8 seconds
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
        }, 1800);

        // Remove component after fade animation completes (2.3 seconds total)
        const removeTimer = setTimeout(() => {
            setLoading(false);
            if (onComplete) onComplete();
        }, 2300);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(removeTimer);
        };
    }, [onComplete]);

    if (!loading) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-500 ease-in-out select-none ${
                fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
        >
            {/* Ambient Background Glow */}
            <div className="absolute w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute w-56 h-56 bg-teal-500/15 rounded-full blur-2xl animate-pulse delay-300" />

            {/* Main Content Container */}
            <div className="relative z-10 flex flex-col items-center gap-6">

                {/* Animated Logo Wrapper */}
                <div className="relative flex items-center justify-center">
                    {/* Outer Rotating Glowing Ring */}
                    <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-teal-500/40 via-blue-500/40 to-teal-500/40 blur-md animate-pulse" />

                    {/* Animated Pulsing Ring */}
                    <div className="absolute -inset-2 rounded-2xl border border-teal-400/40 animate-ping opacity-25" />

                    {/* Icon Card */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center transform transition-transform duration-700 animate-in zoom-in-75">
                        <ClinicLogo className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-xl animate-pulse" />
                    </div>
                </div>

                {/* Brand Name & Subtitle */}
                <div className="flex flex-col items-center gap-1 text-center">
                    <div className="flex items-center gap-1.5 font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                        <span>Clinic</span>
                        <span className="text-blue-400 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
                            CMS
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-400 tracking-wider uppercase">
                        Medical Practice Suite
                    </p>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-48 sm:w-56 h-1.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50 mt-2">
                    <div className="h-full bg-gradient-to-r from-teal-400 via-blue-500 to-teal-300 rounded-full animate-[loaderProgress_1.8s_ease-in-out_infinite]" />
                </div>

                {/* Loading Status Text */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Initializing application...</span>
                </div>
            </div>
        </div>
    );
}
