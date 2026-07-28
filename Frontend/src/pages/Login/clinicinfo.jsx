import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
    Stethoscope,
    Award,
    Building2,
    Clock,
    ShieldCheck,
    FileText,
    PhoneCall,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    UserCheck,
    Coins,
    MapPin,
    HeartPulse,
    BadgeCheck,
    CalendarDays
} from "lucide-react";
import { ClinicLogo, Loader, ErrorIcon } from "../../assets/Icons/index.js";
import { ClinicInfoService } from "../../service/api/authServices.js";
import Step1Clinic from "../../component/Auth/Step1Clinic.jsx";
import Step2Clinic from "../../component/Auth/Step2Clinic.jsx";
import Step3Clinic from "../../component/Auth/Step3Clinic.jsx";
import StepBar from "../../component/Auth/StepBar.jsx";
import Button from "../../component/Button.jsx";
import { useNotification } from "../../hooks/showNotification";

/* ── Inject Keyframe Animations ───────────────────────────────── */
const KEYFRAMES = `
  @keyframes mi-orb-float {
    0%, 100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-16px) scale(1.03); }
  }
  @keyframes mi-card-rise {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes mi-pulse-draw {
    from { stroke-dashoffset: 700; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes mi-pulse-glow {
    from { opacity: 0.4; }
    to   { opacity: 0.9; }
  }
  @keyframes mi-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .mi-orb-1 { animation: mi-orb-float 7s ease-in-out infinite; }
  .mi-orb-2 { animation: mi-orb-float 9s ease-in-out -3s infinite; }
  .mi-card-rise { animation: mi-card-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .mi-fade-in { animation: mi-fade-in 0.3s ease-out both; }
  .mi-pulse-line {
    stroke-dasharray: 700;
    stroke-dashoffset: 700;
    animation: mi-pulse-draw 3s ease-out 0.5s both, mi-pulse-glow 2s ease-in-out 3.5s infinite alternate;
  }
`;

function InjectStyles() {
    useEffect(() => {
        if (document.getElementById("medicalinfo-keyframes")) return;
        const styleEl = document.createElement("style");
        styleEl.id = "medicalinfo-keyframes";
        styleEl.textContent = KEYFRAMES;
        document.head.appendChild(styleEl);
        return () => styleEl.remove();
    }, []);
    return null;
}

/* ── Medical Specialization Options ───────────────────────────── */
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

/* ── State Medical Councils ───────────────────────────────────── */
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

export default function MedicalInfo() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        trigger,
        control,
        setValue,
        formState: { errors }
    } = useForm({
        defaultValues: {
            doctorTitle: "",
            doctorName: localStorage.getItem("username") || "",
            qualification: "",
            specialty: "",
            registrationNo: "",
            medicalCouncil: "",
            experienceYears: "",
            clinicName: "",
            clinicPhone: "",
            clinicAddress: "",
            city: "",
            state: "",
            pinCode: "",
            consultationFee: "",
            opdTiming: "",
            emergencyAvailable: false,
            teleConsultation: false,
            prescriptionNotes: "",
            agreedCertify: false
        }
    });

    // Watch form fields for live medical badge preview
    const watchedValues = watch();

    const handleFormSubmit = async (data, e) => {
        if (e) e.preventDefault();
        if (currentStep !== 3) return;

        setLoading(true);
        try {
            const res = await ClinicInfoService({
                qulification: {
                    doctorName: `${data.doctorTitle || "Dr."} ${data.doctorName || ""}`.trim(),
                    qualification: data.qualification || "",
                    registrationNo: data.registrationNo || "",
                    specialty: data.specialty || "",
                    experienceYears: String(data.experienceYears || ""),
                    medicalcouncil: data.medicalCouncil || ""
                },
                clinicinfo: {
                    clinicName: data.clinicName || "",
                    clinicphone: Number(data.clinicPhone) || 0,
                    consultationfee: Number(data.consultationFee) || 0,
                    clinicAddress: {
                        address: data.clinicAddress || "",
                        city: data.city || "",
                        state: data.state || "",
                        pinCode: data.pinCode || ""
                    },
                    clinicTiming: data.opdTiming || "",
                },
                emergencyAvailable: Boolean(data.emergencyAvailable),
                teleConsultation: Boolean(data.teleConsultation)
            });


            if (res) {
                localStorage.setItem("cms_doctor_medical_info", JSON.stringify(data));
                showNotification({
                    title: "Success",
                    message: res.message || "Medical & Clinic Information saved successfully!",
                    type: "success",
                });
                navigate("/dashboard");
            }
        } catch (err) {
            toast.error(err?.message || "Failed to save medical details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleNextStep = async (e) => {
        if (e) e.preventDefault();
        let isValid = false;
        if (currentStep === 1) {
            isValid = await trigger([
                "doctorTitle",
                "doctorName",
                "specialty",
                "qualification",
                "registrationNo",
                "experienceYears",
                "medicalCouncil"
            ]);
        } else if (currentStep === 2) {
            isValid = await trigger([
                "clinicName",
                "clinicPhone",
                "consultationFee",
                "clinicAddress",
                "city",
                "state",
                "pinCode",
                "opdTiming"
            ]);
        }
        if (isValid) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const steps = [
        { id: 1, name: "Qualifications", icon: Award, desc: "License & Specialization" },
        { id: 2, name: "Clinic Details", icon: Building2, desc: "Address & Practice Hours" },
        { id: 3, name: "Prescription & Seal", icon: FileText, desc: "Consultation & Badges" }
    ];

    return (
        <>
            <InjectStyles />

            <div className="mi-card-rise flex min-h-dvh font-sans bg-slate-50/90 text-slate-800 antialiased">
                {/* ════════════════════════════════════════════════════
            LEFT PANEL — Branding & Live Medical Badge Preview
        ════════════════════════════════════════════════════ */}
                <aside
                    className="hidden lg:flex relative flex-col justify-between
                     w-[46%] shrink-0 px-10 py-9 overflow-hidden select-none
                     bg-gradient-to-br from-[#06101E] via-[#0C1F38] to-[#071324]"
                    aria-hidden="true"
                >
                    {/* Subtle grid overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                    {/* Ambient Glowing Orbs */}
                    <div className="mi-orb-1 absolute top-1/4 -left-20 w-[400px] h-[400px] rounded-full bg-teal-500/20 blur-[110px] pointer-events-none" />
                    <div className="mi-orb-2 absolute bottom-10 right-0 w-[360px] h-[360px] rounded-full bg-blue-600/25 blur-[110px] pointer-events-none" />

                    {/* Top Bar Header */}
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                            <span className="text-xs font-semibold text-teal-300 tracking-wide uppercase">
                                Doctor Profile Setup
                            </span>
                        </div>
                        <span className="text-xs font-medium text-slate-400">Step {currentStep} of 3</span>
                    </div>

                    {/* Heartbeat pulse animation graphic */}
                    <div className="absolute top-[38%] left-0 w-full opacity-30 pointer-events-none">
                        <svg className="w-full h-20" viewBox="0 0 500 100" fill="none">
                            <polyline
                                className="mi-pulse-line"
                                points="0,50 120,50 135,15 155,85 175,30 195,70 210,50 500,50"
                                stroke="url(#med-heartbeat-gradient)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <defs>
                                <linearGradient id="med-heartbeat-gradient" x1="0" y1="0" x2="500" y2="0" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#14B8A6" stopOpacity="0.2" />
                                    <stop offset="0.5" stopColor="#38BDF8" />
                                    <stop offset="1" stopColor="#3B82F6" stopOpacity="0.2" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {/* Live Medical Badge & Prescription Preview */}
                    <div className="relative z-10 my-auto py-6 max-w-md mx-auto w-full">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 shadow-md">
                                <Stethoscope className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">
                                    Medical Information Setup
                                </h3>
                                <p className="text-xs text-teal-300/90 font-medium">
                                    Configure your medical license, clinic header & prescription badge
                                </p>
                            </div>
                        </div>

                        {/* LIVE PREVIEW CARD */}
                        <div className="relative p-5 rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300 hover:border-teal-400/40">
                            {/* Header Badge */}
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <ClinicLogo className="w-6 h-6 text-teal-300" />
                                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                                        Official Doctor ID Card
                                    </span>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    <BadgeCheck className="w-3 h-3" /> Verified License
                                </span>
                            </div>

                            {/* Doctor Details Summary */}
                            <div className="mt-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold text-white tracking-tight leading-snug">
                                            {watchedValues.doctorTitle || "Dr."} {watchedValues.doctorName || "Doctor Name"}
                                        </h4>
                                        <p className="text-xs text-teal-300 font-medium mt-0.5">
                                            {watchedValues.qualification || "Medical Qualification"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[11px] font-semibold text-slate-400 block">Reg. No.</span>
                                        <span className="text-xs font-mono font-bold text-sky-300">
                                            {watchedValues.registrationNo || "MCI-XXXXXX"}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 space-y-1.5 text-xs text-slate-300">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-400">Specialty:</span>
                                        <span className="font-semibold text-white truncate max-w-[200px]">
                                            {watchedValues.specialty}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-400">Clinic:</span>
                                        <span className="font-medium text-slate-200 truncate max-w-[200px]">
                                            {watchedValues.clinicName || "Clinic / Hospital Name"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-400">Consultation Fee:</span>
                                        <span className="font-semibold text-emerald-400">
                                            ₹{watchedValues.consultationFee || "0"}
                                        </span>
                                    </div>
                                </div>

                                {/* Footer preview stats */}
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 text-[11px]">
                                        <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                                        <span className="text-slate-300 truncate">{watchedValues.opdTiming || "OPD Timings"}</span>
                                    </div>
                                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 text-[11px]">
                                        <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                        <span className="text-slate-300 truncate">
                                            {watchedValues.emergencyAvailable ? "24/7 Emergency" : "Standard Care"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Footer Info */}
                    <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-4">
                        <p>© {new Date().getFullYear()} Madhuram Clinic System</p>
                        <span className="flex items-center gap-1.5 text-teal-400">
                            <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Compliant Practice
                        </span>
                    </div>
                </aside>

                {/* ════════════════════════════════════════════════════
            RIGHT PANEL — Interactive Medical Details Form
        ════════════════════════════════════════════════════ */}
                <main className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-10 bg-slate-50/70 overflow-y-auto">
                    <div className="w-full max-w-[620px] bg-white rounded-3xl border border-slate-200/80 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.08)] p-6 sm:p-9 transition-all duration-300">

                        {/* Form Header */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold">
                                    <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Mandatory Medical & Practice Profile
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                Complete Your Medical Profile
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                Provide your medical qualifications and clinic details to customize your prescription header and patient portal.
                            </p>
                        </div>

                        {/* Stepper Tabs */}
                        <StepBar
                            steps={steps}
                            currentStep={currentStep}
                        />

                        {/* MAIN FORM */}
                        <form onSubmit={currentStep === 3 ? handleSubmit(handleFormSubmit) : (e) => e.preventDefault()} className="space-y-6" noValidate>

                            {/* ────────────────────────────────────────────────
                  STEP 1: QUALIFICATIONS & MEDICAL LICENSE
              ──────────────────────────────────────────────── */}
                            {currentStep === 1 && (
                                <Step1Clinic
                                    register={register}
                                    errors={errors}
                                    control={control}
                                    setValue={setValue}
                                />
                            )}

                            {/* ────────────────────────────────────────────────
                  STEP 2: CLINIC DETAILS & OPD TIMINGS
              ──────────────────────────────────────────────── */}
                            {currentStep === 2 && (
                                <Step2Clinic
                                    register={register}
                                    errors={errors}
                                />
                            )}

                            {/* ────────────────────────────────────────────────
                  STEP 3: PRESCRIPTION & BADGES
              ──────────────────────────────────────────────── */}
                            {currentStep === 3 && (
                                <Step3Clinic
                                    register={register}
                                    errors={errors}
                                />
                            )}

                            {/* ────────────────────────────────────────────────
                  STEP NAVIGATION ACTIONS
              ──────────────────────────────────────────────── */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
                                {currentStep > 1 ? (
                                    <Button
                                        type="button"
                                        onClick={() => setCurrentStep((prev) => prev - 1)}
                                        background="bg-slate-100"
                                        border="border-none"
                                        className="flex items-center gap-1.5 px-4 h-11 rounded-xl text-xs font-semibold text-black! w-auto"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Previous
                                    </Button>
                                ) : (
                                    <div />
                                )}

                                {currentStep < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={handleNextStep}
                                        background="bg-teal-600 hover:bg-teal-700"
                                        border="border-none"
                                        className="flex items-center gap-2 px-6 h-11 rounded-xl text-white text-xs font-semibold shadow-lg shadow-teal-600/25 transition-all hover:-translate-y-0.5 ml-auto w-auto"
                                    >
                                        Next Step <ArrowRight className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        background="bg-gradient-to-r from-teal-600 via-sky-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                                        border="border-none"
                                        className="flex items-center gap-2 px-7 h-11 rounded-xl text-white text-sm font-bold shadow-xl shadow-teal-600/25 transition-all hover:-translate-y-0.5 disabled:opacity-70 ml-auto w-auto"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin text-white" />
                                                Saving Medical Profile…
                                            </>
                                        ) : (
                                            <>
                                                Complete Setup & Launch Dashboard <CheckCircle2 className="w-4 h-4" />
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}
