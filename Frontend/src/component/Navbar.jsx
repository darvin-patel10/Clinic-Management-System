import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Plus,
    Users,
    LogOut,
    ChevronDown,
    ShieldCheck,
    Stethoscope,
    Activity,
    Pill,
    Settings,
    ArrowLeft,
    Maximize,
    Minimize,
} from "lucide-react";
import { ClinicLogo } from "../assets/Icons/index.js";
import { LogoutService, GetMeService } from "../service/api/authServices.js";
import { clearToken } from "../service/httpServices.js";
import { useNotification } from "../hooks/showNotification.jsx";
import Button from "./Button.jsx";

export default function Navbar({
    doctorInfo = null,
    onBack
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const { showNotification } = useNotification();

    const [user, setUser] = useState(doctorInfo);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

    const profileRef = useRef(null);

    const isDashboard = location.pathname === "/dashboard";

    // Fetch user details if not provided via props
    useEffect(() => {
        if (!user) {
            GetMeService()
                .then((res) => {
                    if (res?.user) {
                        setUser(res.user);
                    }
                })
                .catch(() => {
                    // Fallback default if not yet loaded
                });
        }
    }, [user]);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fullscreen state listener & toggle handler
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error enabling fullscreen: ${err.message}`);
            });
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    // Handle Logout
    const handleLogout = async () => {
        try {
            const res = await LogoutService();

            if (res) {
                showNotification?.({
                    title: "Success",
                    message: res.message || "Logout successful",
                    type: "success",
                });
                clearToken();
                localStorage.clear();
                navigate("/signin", { replace: true });
            }
        } catch (err) {
            showNotification?.({
                title: "Error",
                message: err?.message || "Logout failed",
                type: "error",
            });
        }
    };

    const doctorName = user?.username || "Dr. Alex Vance";
    const doctorEmail = user?.email || "doctor@cliniccms.com";
    const initials = doctorName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const isActivePath = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 border-b border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] transition-all">
            <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">

                    {/* ── 1. Branding & Logo ────────────────────────────────────────── */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {onBack && (
                            <Button
                                type="button"
                                onClick={onBack}
                                background="bg-white/80"
                                border="border border-slate-200/80"
                                padding="p-1.5 sm:p-2"
                                className="w-auto text-black! rounded-xl transition-all duration-200 ease-out active:scale-95 animate-in fade-in slide-in-from-left-2 duration-300"
                                aria-label="Go back"
                                title="Go back"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        <a
                            href="/dashboard"
                            className="flex items-center gap-2 sm:gap-2.5 group focus:outline-none"
                        >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                                <ClinicLogo className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-sm" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-none font-sans">
                                        Clinic<span className="text-blue-600">CMS</span>
                                    </span>
                                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Live Session
                                    </span>
                                </div>
                                <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden xs:block sm:block">
                                    Medical Practice Suite
                                </span>
                            </div>
                        </a>
                    </div>

                    {/* ── 2. Right Controls & Profile ───────────────────────────────── */}
                    <div className="flex items-center gap-1.5 sm:gap-3">

                        {/* Quick Action Button */}
                        {isDashboard && (
                            <Button
                                type="button"
                                onClick={() => navigate("/add-pationt")}
                                className="inline-flex items-center justify-center gap-1.5 font-semibold text-xs rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none shadow-sm hover:shadow transition-all duration-200 ease-out active:scale-95 w-auto animate-in fade-in slide-in-from-right-2 duration-300 px-2.5 py-1.5 sm:px-3.5 sm:py-2"
                                title="Add Patient"
                            >
                                <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                <span className="hidden sm:inline">Add Patient</span>
                            </Button>
                        )}

                        {/* Full Screen Button */}
                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-all duration-150 focus:outline-none cursor-pointer"
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                            aria-label="Toggle Fullscreen"
                        >
                            {isFullscreen ? (
                                <Minimize className="w-4 h-4" />
                            ) : (
                                <Maximize className="w-4 h-4" />
                            )}
                        </button>

                        {/* Divider */}
                        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                        {/* Doctor Profile Menu */}
                        <div className="relative" ref={profileRef}>
                            <button
                                type="button"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-1.5 sm:gap-2.5 p-1 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200/80 transition-all duration-150 focus:outline-none cursor-pointer"
                                aria-label="User Profile Menu"
                            >
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white shrink-0">
                                    {initials}
                                </div>
                                <div className="hidden lg:flex flex-col text-left">
                                    <span className="text-xs font-bold text-slate-800 leading-tight">
                                        {doctorName}
                                    </span>
                                    <span className="text-[11px] text-slate-500 font-medium leading-tight flex items-center gap-1">
                                        <Stethoscope className="w-3 h-3 text-teal-600" />
                                        Doctor
                                    </span>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isProfileOpen ? "rotate-180" : ""}`} />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white border border-slate-200/90 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    {/* Profile Summary Header */}
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                                                {initials}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{doctorName}</p>
                                                <p className="text-xs text-slate-500 truncate">{doctorEmail}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium w-full">
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                            <span className="truncate">HIPAA Compliant Session</span>
                                        </div>
                                    </div>

                                    {/* Navigation Links */}
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                navigate("/dashboard");
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                                isActivePath("/dashboard")
                                                    ? "bg-blue-50/80 text-blue-700 font-bold"
                                                    : "text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            <Activity className={`w-4 h-4 ${isActivePath("/dashboard") ? "text-blue-600" : "text-slate-400"}`} />
                                            Dashboard Overview
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                navigate("/all-pationt");
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                                isActivePath("/all-pationt")
                                                    ? "bg-blue-50/80 text-blue-700 font-bold"
                                                    : "text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            <Users className={`w-4 h-4 ${isActivePath("/all-pationt") ? "text-blue-600" : "text-slate-400"}`} />
                                            Patients Directory
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                navigate("/allmadicin");
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                                isActivePath("/allmadicin")
                                                    ? "bg-blue-50/80 text-blue-700 font-bold"
                                                    : "text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            <Pill className={`w-4 h-4 ${isActivePath("/allmadicin") ? "text-blue-600" : "text-slate-400"}`} />
                                            Medicines Inventory
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                navigate("/doctor-account");
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                                isActivePath("/doctor-account")
                                                    ? "bg-blue-50/80 text-blue-700 font-bold"
                                                    : "text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            <Settings className={`w-4 h-4 ${isActivePath("/doctor-account") ? "text-blue-600" : "text-slate-400"}`} />
                                            Account & Settings
                                        </button>
                                    </div>

                                    {/* Logout */}
                                    <div className="pt-1 border-t border-slate-100">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                            <LogOut className="w-4 h-4 text-rose-500" />
                                            Sign Out of ClinicCMS
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}