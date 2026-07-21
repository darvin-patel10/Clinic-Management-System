import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Search,
    Bell,
    Plus,
    User,
    LogOut,
    ChevronDown,
    ShieldCheck,
    Menu,
    X,
    Stethoscope,
    Activity,
    CheckCircle2,
    Clock,
    Pill,
    Settings,
    ArrowLeft,
} from "lucide-react";
import { ClinicLogo } from "../assets/Icons/index.js";
import { LogoutService, GetMeService } from "../service/api/authServices.js";
import { clearToken } from "../service/httpServices.js";
import Button from "./Button.jsx";

export default function Navbar({
    doctorInfo = null,
    onSearch = () => { },
    onQuickAction = () => { },
}) {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(doctorInfo);
    const [searchQuery, setSearchQuery] = useState("");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadNotifs, setUnreadNotifs] = useState(2);

    const profileRef = useRef(null);
    const notifRef = useRef(null);

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
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle Logout
    const handleLogout = async () => {
        try {
            await LogoutService();
        } finally {
            clearToken();
            navigate("/signin", { replace: true });
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    const notifications = [
        {
            id: 1,
            title: "Low Stock Alert",
            message: "Amoxicillin 500mg has reached low threshold (8 left).",
            time: "10m ago",
            icon: Pill,
            type: "warning",
            unread: true,
        },
        {
            id: 2,
            title: "New Patient Registered",
            message: "Aarav Shah was added to your clinic queue.",
            time: "1h ago",
            icon: CheckCircle2,
            type: "success",
            unread: true,
        },
        {
            id: 3,
            title: "Daily Summary Ready",
            message: "Yesterday's clinic visit summary report is ready.",
            time: "5h ago",
            icon: Activity,
            type: "info",
            unread: false,
        },
    ];

    const doctorName = user?.username || "Dr. Alex Vance";
    const doctorEmail = user?.email || "doctor@cliniccms.com";
    const initials = doctorName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 border-b border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-4">



                    {/* ── 1. Branding & Logo ────────────────────────────────────────── */}
                    <div className="flex items-center gap-3">
                        {!isDashboard && (
                            <Button
                                type="button"
                                onClick={() => navigate(-1)}
                                background="bg-white/80 "
                                border="border border-slate-200/80"
                                padding="p-2"
                                className="w-auto text-black! rounded-xl transition-all duration-200 ease-out active:scale-95 animate-in fade-in slide-in-from-left-2 duration-300"
                                aria-label="Go back"
                                title="Go back"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        <a
                            href="/dashboard"
                            className="flex items-center gap-2.5 group focus:outline-none"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-2 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-[1.03] transition-transform">
                                <ClinicLogo className="w-6 h-6 text-teal-300" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none font-sans">
                                        Clinic<span className="text-blue-600">CMS</span>
                                    </span>
                                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Live Session
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                                    Medical Practice Suite
                                </span>
                            </div>
                        </a>
                    </div>

                    {/* ── 3. Right Controls & Profile ───────────────────────────────── */}
                    <div className="flex items-center gap-2 sm:gap-3">

                        {/* Quick Action Button */}
                        {isDashboard && (
                            <Button
                                type="button"
                                onClick={() => onQuickAction("add-patient")}
                                className="hidden sm:inline-flex items-center gap-1.5 font-semibold text-xs rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none shadow-sm hover:shadow transition-all duration-200 ease-out active:scale-95 w-auto animate-in fade-in slide-in-from-right-2 duration-300"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Patient</span>
                            </Button>
                        )}

                        {/* Notifications Dropdown */}
                        <div className="relative" ref={notifRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsNotifOpen(!isNotifOpen);
                                    setIsProfileOpen(false);
                                }}
                                className="relative flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors duration-150 focus:outline-none"
                                aria-label="Notifications"
                            >
                                <Bell className="w-4 h-4" />
                                {unreadNotifs > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                                )}
                            </button>

                            {isNotifOpen && (
                                <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-white border border-slate-200/90 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-slate-900">Notifications</span>
                                            {unreadNotifs > 0 && (
                                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                                                    {unreadNotifs} new
                                                </span>
                                            )}
                                        </div>
                                        {unreadNotifs > 0 && (
                                            <button
                                                onClick={() => setUnreadNotifs(0)}
                                                className="text-xs text-blue-600 hover:underline font-medium"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                                        {notifications.map((n) => {
                                            const IconComponent = n.icon;
                                            return (
                                                <div
                                                    key={n.id}
                                                    className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer ${n.unread ? "bg-blue-50/30" : ""}`}
                                                >
                                                    <div className={`p-2 rounded-lg shrink-0 ${n.type === "warning" ? "bg-amber-100 text-amber-600" : n.type === "success" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}>
                                                        <IconComponent className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                                                            <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                        {/* Doctor Profile Menu */}
                        <div className="relative" ref={profileRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsProfileOpen(!isProfileOpen);
                                    setIsNotifOpen(false);
                                }}
                                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200/80 transition-all duration-150 focus:outline-none"
                            >
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white">
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
                                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200/90 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    {/* Profile Summary Header */}
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                {initials}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{doctorName}</p>
                                                <p className="text-xs text-slate-500 truncate">{doctorEmail}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium w-full">
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>HIPAA Compliant Session</span>
                                        </div>
                                    </div>

                                    {/* Navigation Links */}
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                navigate("/dashboard");
                                            }}
                                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                        >
                                            <Activity className="w-4 h-4 text-slate-400" />
                                            Dashboard Overview
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                navigate("/allmadicin");
                                            }}
                                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                        >
                                            <Pill className="w-4 h-4 text-slate-400" />
                                            Medicines Inventory
                                        </button>
                                        <button
                                            onClick={() => setIsProfileOpen(false)}
                                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                        >
                                            <Settings className="w-4 h-4 text-slate-400" />
                                            Account & Clinic Settings
                                        </button>
                                    </div>

                                    {/* Logout */}
                                    <div className="pt-1 border-t border-slate-100">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4 text-rose-500" />
                                            Sign Out of ClinicCMS
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
                            aria-label="Toggle Navigation"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* ── 4. Mobile Drawer ────────────────────────────────────────── */}
                {isMobileMenuOpen && (
                    <div className="md:hidden pb-4 pt-2 border-t border-slate-200/80 animate-in fade-in slide-in-from-top-1">
                        <form onSubmit={handleSearchSubmit} className="relative mb-3">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search patients or medicines..."
                                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none"
                            />
                        </form>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    onQuickAction("add-patient");
                                }}
                                className="flex items-center justify-center gap-2 h-10 w-full rounded-xl bg-blue-600 text-white font-semibold text-xs"
                            >
                                <Plus className="w-4 h-4" />
                                Add New Patient
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 h-10 w-full rounded-xl border border-rose-200 text-rose-600 font-semibold text-xs bg-rose-50"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}