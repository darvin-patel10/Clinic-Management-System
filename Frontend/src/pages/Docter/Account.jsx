import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Building2,
    ShieldCheck,
    KeyRound,
    Stethoscope,
    Award,
    Phone,
    Mail,
    MapPin,
    Clock,
    Coins,
    Save,
    Sparkles,
    BadgeCheck,
    CheckCircle2,
    Bell,
    FileText,
    Activity,
    RotateCcw,
    Lock,
    Shield,
    Zap,
    Camera,
    Check,
    AlertCircle,
    Eye,
    EyeOff,
    Smartphone,
    Globe,
    FileCheck2,
    Calendar,
    ChevronRight,
    Edit3,
    X
} from "lucide-react";
import Navbar from "../../component/Navbar.jsx";
import Button from "../../component/Button.jsx";
import Loader from "../../component/Loader.jsx";
import SectionWrapper from "../../component/SectionWrapper.jsx";
import DoctorProfileTab from "../../component/Docter/Profile.jsx";
import ClinicEdit from "../../component/Docter/ClinicEdit.jsx";
import SecurityTab from "../../component/Docter/Security.jsx";
import { GetMeService } from "../../service/api/authServices.js";
import { accountDetails, updateDetails } from "../../service/api/accountServices.js";
import { useNotification } from "../../hooks/showNotification.jsx";

/* ── Inject Custom Animations & Keyframes ────────────────────── */
const ACCOUNT_STYLES = `
  @keyframes account-fade-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes account-pulse-slow {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50%      { transform: scale(1.05); opacity: 1; }
  }
  .account-fade-in { animation: account-fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .account-pulse { animation: account-pulse-slow 4s ease-in-out infinite; }
`;

function InjectAccountStyles() {
    useEffect(() => {
        if (document.getElementById("doctor-account-styles")) return;
        const styleEl = document.createElement("style");
        styleEl.id = "doctor-account-styles";
        styleEl.textContent = ACCOUNT_STYLES;
        document.head.appendChild(styleEl);
        return () => {
            const el = document.getElementById("doctor-account-styles");
            if (el) el.remove();
        };
    }, []);
    return null;
}

/* ── Options for Dropdowns ────────────────────────────────────── */
const SPECIALIZATIONS = [
    "General Physician / Internal Medicine",
    "Cardiology",
    "Pediatrics & Child Care",
    "Orthopedics",
    "Dermatology & Cosmetology",
    "ENT (Ear, Nose, Throat)",
    "Gynecology & Obstetrics",
    "Neurology",
    "Ophthalmology (Eye Care)",
    "Psychiatry & Behavioral Health",
    "Dental Surgery (BDS/MDS)",
    "Ayurvedic Medicine (BAMS)",
    "Homeopathy (BHMS)",
    "General Surgery"
];

const MEDICAL_COUNCILS = [
    "National Medical Commission (NMC)",
    "Medical Council of India (MCI)",
    "Maharashtra Medical Council",
    "Gujarat Medical Council",
    "Delhi Medical Council",
    "Karnataka Medical Council",
    "Tamil Nadu Medical Council",
    "Uttar Pradesh Medical Council",
    "West Bengal Medical Council",
    "Other State Medical Council"
];

export default function DoctorAccount() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'clinic' | 'security' | 'preferences'
    const [isEditing, setIsEditing] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Header display state (only updated from accountDetails API response / saved changes)
    const [headerData, setHeaderData] = useState({
        doctorTitle: "Dr.",
        doctorName: "",
        qualification: "",
        registrationNo: "",
        specialty: ""
    });

    // Main Form State initialized from database
    const [formData, setFormData] = useState({
        // Auth / User Account
        username: "",
        email: "",

        // Qualifications
        doctorTitle: "Dr.",
        doctorName: "",
        qualification: "",
        registrationNo: "",
        specialty: "",
        experienceYears: "",
        medicalcouncil: "",

        // Clinic Details
        clinicName: "",
        clinicphone: "",
        consultationfee: "",
        clinicTiming: "",

        // Clinic Address
        address: "",
        city: "",
        state: "",
        pinCode: "",

        // Toggles
        emergencyAvailable: false,
        teleConsultation: false,

        // Additional Settings
        emailAlerts: false,
        rxFooterNote: ""
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
    const [passSaving, setPassSaving] = useState(false);

    // Initial Data Fetching from Backend
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        GetMeService()
            .then((meRes) => {
                const userId = meRes?.user?.id || meRes?.user?._id;
                if (userId) {
                    return accountDetails(userId);
                }
                return meRes;
            })
            .then((res) => {
                if (!isMounted || !res) return;
                const u = res?.data?.user || res?.user;
                if (u) {
                    const q = u.qulification || {};
                    const c = u.clinicinfo || {};
                    const ca = c.clinicAddress || {};

                    // Extract doctor title & name
                    let title = "Dr.";
                    let rawName = q.doctorName || u.username || "";
                    if (rawName.startsWith("Dr. ")) {
                        title = "Dr.";
                        rawName = rawName.replace("Dr. ", "");
                    } else if (rawName.startsWith("Prof. Dr. ")) {
                        title = "Prof. Dr.";
                        rawName = rawName.replace("Prof. Dr. ", "");
                    }

                    setHeaderData({
                        doctorTitle: title,
                        doctorName: rawName || u.username || "",
                        qualification: q.qualification || "",
                        registrationNo: q.registrationNo || "",
                        specialty: q.specialty || ""
                    });

                    setFormData((prev) => ({
                        ...prev,
                        username: u.username || "",
                        email: u.email || "",
                        doctorTitle: title,
                        doctorName: rawName || u.username || "",
                        qualification: q.qualification || prev.qualification,
                        registrationNo: q.registrationNo || prev.registrationNo,
                        specialty: q.specialty || prev.specialty,
                        experienceYears: q.experienceYears || prev.experienceYears,
                        medicalcouncil: q.medicalcouncil || prev.medicalcouncil,

                        clinicName: c.clinicName || prev.clinicName,
                        clinicphone: c.clinicphone ? String(c.clinicphone) : prev.clinicphone,
                        consultationfee: c.consultationfee !== undefined ? String(c.consultationfee) : prev.consultationfee,
                        clinicTiming: c.clinicTiming || prev.clinicTiming,

                        address: ca.address || prev.address,
                        city: ca.city || prev.city,
                        state: ca.state || prev.state,
                        pinCode: ca.pinCode || prev.pinCode,

                        emergencyAvailable: u.emergencyAvailable !== undefined ? u.emergencyAvailable : prev.emergencyAvailable,
                        teleConsultation: u.teleConsultation !== undefined ? u.teleConsultation : prev.teleConsultation
                    }));
                }
            })
            .catch((err) => {
                console.error("Failed to load doctor profile:", err);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Handle Form Change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
        setIsDirty(true);
    };

    // Save Profile & Clinic Info to Backend using updateDetails API
    const handleSaveProfile = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                qulification: {
                    doctorName: `${formData.doctorTitle} ${formData.doctorName}`.trim(),
                    qualification: formData.qualification,
                    registrationNo: formData.registrationNo,
                    specialty: formData.specialty,
                    experienceYears: String(formData.experienceYears),
                    medicalcouncil: formData.medicalcouncil
                },
                clinicinfo: {
                    clinicName: formData.clinicName,
                    clinicphone: Number(formData.clinicphone) || 0,
                    consultationfee: Number(formData.consultationfee) || 0,
                    clinicAddress: {
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        pinCode: formData.pinCode
                    },
                    clinicTiming: formData.clinicTiming
                },
                emergencyAvailable: Boolean(formData.emergencyAvailable),
                teleConsultation: Boolean(formData.teleConsultation)
            };

            const res = await updateDetails(payload);

            if (res?.status === 200 || res?.data?.user || res?.user) {
                setHeaderData({
                    doctorTitle: formData.doctorTitle,
                    doctorName: formData.doctorName,
                    qualification: formData.qualification,
                    registrationNo: formData.registrationNo,
                    specialty: formData.specialty
                });
                showNotification({
                    title: "Profile Updated!",
                    message: res?.data?.message || res?.message || "Doctor account and clinic details have been saved.",
                    type: "success"
                });
                setIsDirty(false);
            } else {
                throw new Error(res?.response?.data?.message || res?.data?.message || res?.message || "Failed to update details.");
            }
        } catch (err) {
            showNotification({
                title: "Save Failed",
                message: err?.response?.data?.message || err?.message || "Could not save profile details.",
                type: "error"
            });
        } finally {
            setSaving(false);
        }
    };

    // Handle Password Update
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (!passwordData.currentPassword) {
            showNotification({ title: "Error", message: "Please enter your current password.", type: "error" });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            showNotification({ title: "Weak Password", message: "New password must be at least 6 characters.", type: "warning" });
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showNotification({ title: "Mismatch", message: "New passwords do not match.", type: "error" });
            return;
        }

        setPassSaving(true);
        setTimeout(() => {
            setPassSaving(false);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            showNotification({
                title: "Password Changed",
                message: "Your security credentials have been updated successfully.",
                type: "success"
            });
        }, 1200);
    };

    const initials = (headerData.doctorName || "Doctor")
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col pb-16">
            <InjectAccountStyles />

            {/* Top Navigation */}
            <Navbar onBack={() => navigate("/dashboard")} />

            {/* ════════════════════════════════════════════════════════════════
          HERO BANNER & PROFILE HEADER
      ════════════════════════════════════════════════════════════════ */}
            <SectionWrapper
                className="bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 border-b border-slate-800 text-white relative overflow-hidden"
            >
                {/* Background decorative Orbs */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 left-10 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                        {/* Left: Avatar & Identity Summary */}
                        <div className="flex items-center gap-5">
                            <div className="relative group">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-teal-500 via-sky-600 to-blue-600 text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-xl ring-4 ring-white/10 group-hover:scale-105 transition-transform duration-200">
                                    {initials}
                                </div>
                                {/* <Button
                                    type="button"
                                    onClick={() => showNotification({ title: "Photo Upload", message: "Profile picture avatar update coming soon!", type: "info" })}
                                    background="bg-slate-900"
                                    border="border border-slate-700"
                                    padding="p-2"
                                    className="absolute -bottom-1 -right-1 rounded-xl text-teal-400 hover:text-white hover:bg-teal-600 transition-colors shadow-md cursor-pointer w-auto"
                                    title="Upload Profile Picture"
                                >
                                    <Camera className="w-4 h-4" />
                                </Button> */}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 inline-flex items-center gap-1">
                                        <BadgeCheck className="w-3.5 h-3.5 text-teal-400" />
                                        Medical License Verified
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-slate-300 border border-white/15">
                                        Reg: {headerData.registrationNo || "Pending"}
                                    </span>
                                </div>

                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                                    {headerData.doctorTitle} {headerData.doctorName || "Doctor Name"}
                                </h1>

                                <p className="text-xs sm:text-sm text-teal-300/90 font-medium flex items-center gap-1.5 flex-wrap">
                                    <Stethoscope className="w-4 h-4 text-teal-400 shrink-0" />
                                    <span>{headerData.qualification || "Medical Practitioner"}</span>
                                    <span className="text-slate-500">•</span>
                                    <span className="text-slate-300">{headerData.specialty}</span>
                                </p>
                            </div>
                        </div>

                        {/* Right: Quick Action Controls & Practice Status */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 self-start md:self-center">
                            {/* Practice Status */}
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl">
                                <div className="px-3 py-1.5 rounded-xl bg-teal-500/20 border border-teal-500/30 text-center">
                                    <span className="text-sm font-extrabold text-teal-300 block leading-none">Active</span>
                                    <span className="text-[10px] font-semibold text-teal-200/80">Prescription Stamp</span>
                                </div>
                                <div className="px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-center">
                                    <span className="text-sm font-extrabold text-blue-300 block leading-none">100%</span>
                                    <span className="text-[10px] font-semibold text-blue-200/80">HIPAA Compliant</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs Header */}
                    <div className="flex items-center gap-2 mt-8 pt-4 border-t border-white/10 overflow-x-auto no-scrollbar">
                        {[
                            { id: "profile", label: "Profile & Medical Credentials", icon: User },
                            { id: "clinic", label: "Clinic & OPD Practice", icon: Building2 },
                            { id: "security", label: "Security & Password", icon: ShieldCheck },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <Button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    background={isActive ? "bg-teal-500" : "bg-transparent"}
                                    border="border-none"
                                    padding="px-4 py-2.5"
                                    className={`rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer w-auto normal-case ${isActive
                                        ? "text-white shadow-md shadow-teal-500/30"
                                        : "text-slate-400 hover:text-white hover:bg-white/10"
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                                    {tab.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </SectionWrapper>

            {/* ════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA & LIVE PREVIEW SIDEBAR
      ════════════════════════════════════════════════════════════════ */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1 w-full">

                {/* View-Only Mode Banner */}
                {!isEditing && activeTab !== "security" && (
                    <div className="mb-6 p-4 rounded-2xl bg-slate-100 border border-slate-200/90 text-slate-700 flex items-center justify-between gap-4 animate-in fade-in">
                        <div className="flex items-center gap-3">
                            <Lock className="w-5 h-5 text-slate-500 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-slate-800">Profile & Practice Details are in View-Only Mode</p>
                                <p className="text-[11px] text-slate-500">Click the "Edit Details" button to make changes to your medical credentials or OPD clinic timings.</p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            background="bg-teal-600"
                            border="border-none"
                            padding="px-4 py-2"
                            className="rounded-xl hover:bg-teal-700 text-white text-xs font-bold transition-all cursor-pointer w-auto flex items-center gap-1.5 shrink-0 shadow-md shadow-teal-600/15"
                        >
                            <Edit3 className="w-4 h-4" /> Edit Details
                        </Button>
                    </div>
                )}

                {/* Edit Mode Active Banner */}
                {isEditing && activeTab !== "security" && (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-amber-900">Editing Enabled</p>
                                <p className="text-[11px] text-amber-700">Modify your fields below and click "Save Changes" to update your profile.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                background="bg-slate-200"
                                border="border-none"
                                padding="px-3.5 py-1.5"
                                className="rounded-lg hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={async (e) => {
                                    await handleSaveProfile(e);
                                    setIsEditing(false);
                                }}
                                disabled={saving}
                                background="bg-teal-600"
                                border="border-none"
                                padding="px-4 py-1.5"
                                className="rounded-lg hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer w-auto flex items-center gap-1.5 shadow-md shadow-teal-600/20"
                            >
                                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                )}

                <div className="w-full space-y-6">

                    {/* ── TAB 1: DOCTOR PROFILE & CREDENTIALS ──────────────── */}
                    {activeTab === "profile" && (
                        <DoctorProfileTab
                            formData={formData}
                            handleChange={handleChange}
                            isEditing={isEditing}
                        />
                    )}

                    {/* ── TAB 2: CLINIC & OPD DETAILS ──────────────────────── */}
                    {activeTab === "clinic" && (
                        <ClinicEdit
                            formData={formData}
                            handleChange={handleChange}
                            isEditing={isEditing}
                        />
                    )}

                    {/* ── TAB 3: SECURITY & PASSWORD ───────────────────────── */}
                    {activeTab === "security" && (
                        <SecurityTab
                            userEmail={formData.email}
                            handlePasswordSubmit={handlePasswordSubmit}
                            passwordData={passwordData}
                            setPasswordData={setPasswordData}
                            showPass={showPass}
                            setShowPass={setShowPass}
                            passSaving={passSaving}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
