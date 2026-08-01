import { React, useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { RegisterService, EmailVerify } from "../../service/api/authServices.js";
import { saveToken } from "../../service/httpServices.js";
import { ClinicLogo, CloseEye, Email, ErrorIcon, Firstname, Loader, OpenEye, Password, Phone } from "../../assets/Icons/index.js";
import SuccessScreen from "../../component/SuccessScreen.jsx";

/* ── Inject keyframes once into <head> ──────────────────────── */
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  @keyframes su-orb-float {
    0%, 100% { transform: translateY(0) scale(1); }
    33%       { transform: translateY(-18px) scale(1.04); }
    66%       { transform: translateY(12px) scale(.97); }
  }
  @keyframes su-pulse-draw {
    from { stroke-dashoffset: 700; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes su-pulse-glow {
    from { opacity: .4; }
    to   { opacity: .9; }
  }
  @keyframes su-card-rise {
    from { opacity: 0; transform: translateY(20px) scale(.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes su-stat-slide {
    from { opacity: 0; transform: translateX(-14px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes su-alert-in {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes su-error-pop {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes su-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes su-root-in {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes su-success-pop {
    0%   { opacity: 0; transform: scale(.8) translateY(10px); }
    60%  { transform: scale(1.04) translateY(-2px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes su-bar-fill {
    from { width: 0; }
  }
  @keyframes su-check-draw {
    from { stroke-dashoffset: 60; }
    to   { stroke-dashoffset: 0; }
  }

  .su-root-in   { animation: su-root-in   .4s cubic-bezier(.4,0,.2,1) both; }
  .su-card-rise { animation: su-card-rise .6s cubic-bezier(.22,1,.36,1) .15s both; }
  .su-alert-in  { animation: su-alert-in  .25s ease-out both; }
  .su-error-pop { animation: su-error-pop .2s ease-out both; }
  .su-spin      { animation: su-spin .7s linear infinite; }
  .su-success-pop { animation: su-success-pop .55s cubic-bezier(.22,1,.36,1) both; }
  .su-pulse-line {
    stroke-dasharray: 700;
    stroke-dashoffset: 700;
    animation: su-pulse-draw 3s ease-out .8s both, su-pulse-glow 2s ease-in-out 3.8s infinite alternate;
  }
  .su-orb-1 { animation: su-orb-float 8s ease-in-out infinite; }
  .su-orb-2 { animation: su-orb-float 8s ease-in-out -3s infinite; }
  .su-orb-3 { animation: su-orb-float 8s ease-in-out -5s infinite; }
  .su-stat-1 { animation: su-stat-slide .5s ease-out .5s both; }
  .su-stat-2 { animation: su-stat-slide .5s ease-out .65s both; }
  .su-stat-3 { animation: su-stat-slide .5s ease-out .8s both; }
  .su-bar-fill { animation: su-bar-fill .35s ease-out both; }
  .su-check-draw {
    stroke-dasharray: 60;
    stroke-dashoffset: 60;
    animation: su-check-draw .4s ease-out .1s both;
  }

  @media (prefers-reduced-motion: reduce) {
    .su-root-in, .su-card-rise, .su-alert-in, .su-error-pop, .su-spin,
    .su-success-pop, .su-pulse-line, .su-orb-1, .su-orb-2, .su-orb-3,
    .su-stat-1, .su-stat-2, .su-stat-3, .su-bar-fill, .su-check-draw {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
      stroke-dashoffset: 0 !important;
      width: auto !important;
    }
  }
`;

function InjectStyles() {
    useEffect(() => {
        if (document.getElementById("signup-keyframes")) return;
        const s = document.createElement("style");
        s.id = "signup-keyframes";
        s.textContent = KEYFRAMES;
        document.head.appendChild(s);
        return () => s.remove();
    }, []);
    return null;
}


/* ── Password strength calculator ───────────────────────────── */
function getStrength(pw) {
    if (!pw) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "#ef4444", pct: 20 };
    if (score === 2) return { score: 2, label: "Fair", color: "#f97316", pct: 40 };
    if (score === 3) return { score: 3, label: "Good", color: "#eab308", pct: 60 };
    if (score === 4) return { score: 4, label: "Strong", color: "#22c55e", pct: 80 };
    return { score: 5, label: "Very strong", color: "#14b8a6", pct: 100 };
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function SignUp() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        watch,
        setFocus,
        formState: { errors }
    } = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            specialty: "",
            password: "",
            confirm: "",
            agreed: false
        }
    });

    const [step, setStep] = useState("register"); // "register" | "otp"
    const [userEmail, setUserEmail] = useState("");
    const [formData, setFormData] = useState(null);
    const [otp, setOtp] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const errorRef = useRef(null);

    useEffect(() => {
        if (step === "register") {
            setFocus("firstName");
        }
    }, [step, setFocus]);

    useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

    const passwordVal = watch("password", "");
    const confirmVal = watch("confirm", "");
    const agreedVal = watch("agreed", false);
    const strength = getStrength(passwordVal);

    /* ── Step 1: Submit Registration ─────────────────────────── */
    async function onSubmit(data) {
        setError("");
        setLoading(true);
        const username = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();
        const email = data.email.trim();
        const password = data.password;

        try {
            await RegisterService({
                username,
                email,
                password
            });
            setUserEmail(email);
            setFormData({ username, email, password });
            setStep("otp");
        } catch (err) {
            const apiMessage =
                err?.response?.data?.massage ||
                err?.response?.data?.message ||
                err?.message ||
                "Registration failed. Please try again.";
            setError(apiMessage);
        } finally {
            setLoading(false);
        }
    }

    /* ── Step 2: Submit OTP Verification ──────────────────────── */
    async function handleOtpSubmit(e) {
        e.preventDefault();
        if (!otp.trim()) {
            setError("Please enter the OTP sent to your email.");
            return;
        }
        setError("");
        setLoading(true);

        try {
            const resData = await EmailVerify({
                email: userEmail,
                otp: otp.trim()
            });

            if (resData?.accessToken) {
                saveToken(resData.accessToken);
            }
            navigate("/medical-info", { replace: true });
        } catch (err) {
            const apiMessage =
                err?.response?.data?.message ||
                err?.response?.data?.massage ||
                err?.message ||
                "Invalid or expired OTP. Please try again.";
            setError(apiMessage);
        } finally {
            setLoading(false);
        }
    }

    async function handleResendOtp() {
        if (!formData) return;
        setError("");
        setLoading(true);
        try {
            await RegisterService(formData);
            setError("");
        } catch (err) {
            const apiMessage =
                err?.response?.data?.massage ||
                err?.response?.data?.message ||
                err?.message ||
                "Failed to resend OTP.";
            setError(apiMessage);
        } finally {
            setLoading(false);
        }
    }

    const stats = [
        { value: "10k+", label: "Doctors registered" },
        { value: "99.9%", label: "System uptime" },
        { value: "HIPAA", label: "Compliant & secure" },
    ];
    const statAnims = ["su-stat-1", "su-stat-2", "su-stat-3"];

    return (
        <>
            <InjectStyles />

            <div className="su-root-in flex min-h-dvh font-[Inter,system-ui,sans-serif] bg-slate-50">

                {/* ════════════════════════════════════════════════════
            LEFT PANEL — Branding (desktop only)
        ════════════════════════════════════════════════════ */}
                <aside
                    className="hidden lg:flex relative flex-col justify-center items-center
                     w-[42%] shrink-0 px-12 py-12 overflow-hidden text-center
                     bg-gradient-to-br from-[#0b1437] via-[#0f2060] to-[#071428]"
                    aria-hidden="true"
                >
                    {/* Radial overlay */}
                    <div className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(ellipse at 20% 15%, rgba(37,99,235,.28) 0%, transparent 55%)," +
                                "radial-gradient(ellipse at 80% 85%, rgba(20,184,166,.2) 0%, transparent 50%)",
                        }}
                    />

                    {/* Orbs */}
                    <div className="su-orb-1 absolute -top-20 -left-16 w-80 h-80 rounded-full bg-blue-600 blur-[60px] opacity-20 pointer-events-none" />
                    <div className="su-orb-2 absolute -bottom-10 -right-20 w-64 h-64 rounded-full bg-teal-500 blur-[60px] opacity-20 pointer-events-none" />
                    <div className="su-orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-indigo-400 blur-[60px] opacity-10 pointer-events-none" />

                    {/* Heartbeat SVG */}
                    <svg className="absolute bottom-28 left-0 right-0 w-full opacity-50 pointer-events-none"
                        viewBox="0 0 400 80" fill="none">
                        <polyline
                            className="su-pulse-line"
                            points="0,40 60,40 80,10 100,70 120,40 160,40 180,20 200,60 220,40 400,40"
                            stroke="rgba(20,184,166,0.6)" strokeWidth="2.5"
                            fill="none" strokeLinecap="round" strokeLinejoin="round"
                        />
                    </svg>

                    {/* Brand */}
                    <div className="relative z-10 max-w-sm">
                        {/* Logo */}
                        <div className="inline-flex items-center justify-center rounded-2xl mb-6
                            bg-white/7 border border-white/12 backdrop-blur-sm"
                            style={{ width: 72, height: 72 }}
                            aria-label="ClinicCMS logo">
                            <ClinicLogo className="w-11 h-11 drop-shadow-sm" />
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-3"
                            style={{
                                background: "linear-gradient(135deg, #fff 40%, rgba(20,184,166,.9) 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}>
                            Join ClinicCMS
                        </h1>
                        <p className="text-[rgba(255,255,255,.6)] text-[.975rem] leading-relaxed mb-10">
                            Trusted by thousands of doctors.<br />
                            Set up your clinic in minutes.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-col gap-4">
                            {stats.map((s, i) => (
                                <div key={i}
                                    className={`${statAnims[i]} flex items-center gap-4 px-4 py-3
                    rounded-[.75rem] bg-white/5 border border-white/8 backdrop-blur-sm text-left`}>
                                    <span className="text-2xl font-extrabold text-teal-400 leading-none tracking-tight">
                                        {s.value}
                                    </span>
                                    <span className="text-[.875rem] text-[rgba(255,255,255,.65)] font-medium">
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Trust badge */}
                        <div className="mt-8 flex items-center justify-center gap-2
                            px-4 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm
                            text-[.8rem] text-[rgba(255,255,255,.5)]">
                            <svg className="w-4 h-4 text-teal-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd"
                                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd" />
                            </svg>
                            256-bit encrypted · SOC 2 certified
                        </div>
                    </div>

                    <p className="absolute bottom-6 text-[.75rem] text-[rgba(255,255,255,.3)] z-10">
                        © {new Date().getFullYear()} ClinicCMS · Licensed medical software
                    </p>
                </aside>

                {/* ════════════════════════════════════════════════════
            RIGHT PANEL — Registration Form
        ════════════════════════════════════════════════════ */}
                <main className="flex-1 flex items-start justify-center px-3.5 sm:px-6 py-6 sm:py-10 overflow-y-auto">
                    <div className="su-card-rise w-full max-w-[480px] bg-white rounded-2xl sm:rounded-[1.25rem]
                          border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,.12),0_8px_24px_rgba(15,23,42,.06)]
                          p-4 sm:p-7 md:p-10">

                        {step === "otp" ? (
                            <div>
                                {/* ── OTP Header ──────────────────────────── */}
                                <div className="mb-5 sm:mb-7 text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14
                                                  rounded-xl bg-blue-50 border border-slate-200 mb-4 sm:mb-5 mx-auto text-blue-600">
                                        <Email className="w-6 h-6 sm:w-7 sm:h-7" />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl md:text-[1.625rem] font-extrabold text-slate-900 tracking-tight leading-tight mb-1">
                                        Verify your email
                                    </h2>
                                    <p className="text-xs sm:text-[.9rem] text-slate-500">
                                        We sent a verification code to<br />
                                        <span className="font-semibold text-slate-800">{userEmail}</span>
                                    </p>
                                </div>

                                {/* ── Global error ─────────────────────────── */}
                                {error && (
                                    <div
                                        id="otp-error-banner"
                                        ref={errorRef}
                                        className="su-alert-in flex items-start gap-2.5 p-3 sm:p-3.5
                                               rounded-xl mb-4 sm:mb-5 text-xs sm:text-[.875rem] font-medium leading-snug
                                               bg-red-50 border border-red-200/50 text-red-600"
                                        role="alert"
                                        tabIndex={-1}
                                    >
                                        <ErrorIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0 mt-px" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* ── OTP Form ─────────────────────────────── */}
                                <form id="otp-form" className="flex flex-col gap-4" onSubmit={handleOtpSubmit}>
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="signup-otp"
                                            className="text-xs sm:text-[.8125rem] font-semibold text-slate-900 tracking-[.01em]">
                                            One-Time Password (OTP) <span className="text-red-600" aria-hidden="true">*</span>
                                        </label>
                                        <input
                                            id="signup-otp"
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            maxLength={6}
                                            placeholder="Enter OTP code"
                                            autoFocus
                                            className="w-full h-11 sm:h-[50px] px-4 text-center text-lg sm:text-xl tracking-[0.35em] font-bold rounded-xl border-[1.5px] border-slate-200 bg-white text-slate-900 outline-none placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 placeholder:text-sm sm:placeholder:text-base transition-[border-color,box-shadow] duration-150 hover:border-slate-300 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,.18)]"
                                        />
                                    </div>

                                    <button
                                        id="otp-submit"
                                        type="submit"
                                        disabled={loading}
                                        aria-busy={loading}
                                        className="flex items-center justify-center gap-2 h-11 sm:h-12 w-full px-6 mt-1
                                                 border-none rounded-xl cursor-pointer font-semibold text-sm sm:text-base
                                                 text-white tracking-[.01em]
                                                 bg-gradient-to-br from-blue-600 to-blue-800
                                                 shadow-[0_4px_14px_rgba(37,99,235,.35)]
                                                 transition-all duration-150
                                                 hover:not-disabled:from-blue-700 hover:not-disabled:to-blue-900
                                                 hover:not-disabled:shadow-[0_6px_20px_rgba(37,99,235,.45)]
                                                 hover:not-disabled:-translate-y-px
                                                 active:not-disabled:translate-y-0
                                                 active:not-disabled:shadow-[0_2px_8px_rgba(37,99,235,.3)]
                                                 disabled:opacity-75 disabled:cursor-not-allowed
                                                 focus-visible:outline-[3px] focus-visible:outline-blue-600 focus-visible:outline-offset-[3px]"
                                    >
                                        {loading ? <><Loader />Verifying…</> : "Verify & Continue to Dashboard"}
                                    </button>
                                </form>

                                {/* ── Actions ──────────────────────────────── */}
                                <div className="flex flex-col gap-2 mt-5 sm:mt-6 text-center text-xs sm:text-sm">
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={loading}
                                        className="text-blue-600 font-semibold hover:underline bg-transparent border-none cursor-pointer disabled:opacity-50"
                                    >
                                        Didn't receive the code? Resend OTP
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setError("");
                                            setStep("register");
                                        }}
                                        disabled={loading}
                                        className="text-slate-500 font-medium hover:underline bg-transparent border-none cursor-pointer disabled:opacity-50"
                                    >
                                        ← Change email / Edit details
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* ── Card header ──────────────────────────── */}
                                <div className="mb-5 sm:mb-7 text-center">
                                    {/* Mobile logo */}
                                    <div className="lg:hidden inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14
                                  rounded-2xl bg-white border border-slate-200/90 shadow-sm mb-4 sm:mb-5 mx-auto p-2 sm:p-2.5">
                                        <ClinicLogo className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-sm" />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl md:text-[1.625rem] font-extrabold text-slate-900 tracking-tight leading-tight mb-1">
                                        Create your account
                                    </h2>
                                    <p className="text-xs sm:text-[.9rem] text-slate-500">
                                        Doctor registration — takes less than 2 minutes
                                    </p>
                                </div>

                                {/* ── Global error ─────────────────────────── */}
                                {error && (
                                    <div
                                        id="signup-error-banner"
                                        ref={errorRef}
                                        className="su-alert-in flex items-start gap-2.5 p-3 sm:p-3.5
                                rounded-xl mb-4 sm:mb-5 text-xs sm:text-[.875rem] font-medium leading-snug
                                bg-red-50 border border-red-200/50 text-red-600"
                                        role="alert"
                                        tabIndex={-1}
                                    >
                                        <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0 mt-px" viewBox="0 0 20 20"
                                            fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd"
                                                d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* ── Form ─────────────────────────────────── */}
                                <form id="signup-form" className="flex flex-col gap-3.5 sm:gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>

                                    {/* Section label */}
                                    <p className="text-[10px] sm:text-[.7rem] font-bold text-slate-400 uppercase tracking-widest -mb-1">
                                        Personal information
                                    </p>

                                    {/* First + Last name row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* First name */}
                                        <div className="flex flex-col gap-1.5">
                                            <label htmlFor="signup-firstname"
                                                className="text-xs sm:text-[.8125rem] font-semibold text-slate-900 tracking-[.01em]">
                                                First name <span className="text-red-600" aria-hidden="true">*</span>
                                            </label>
                                            <div className="relative flex items-center">
                                                <Firstname className={`absolute left-3.5 w-4 h-4 pointer-events-none shrink-0 transition-colors duration-150 ${errors.firstName ? "text-red-500" : "text-slate-400"}`} />
                                                <input
                                                    id="signup-firstname"
                                                    type="text"
                                                    className={`w-full h-10 sm:h-[46px] pl-[2.5rem] pr-3 rounded-xl border-[1.5px]
                                       bg-white text-xs sm:text-[.9375rem] text-slate-900 outline-none
                                       placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150
                                       hover:border-slate-300
                                       focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,.18)]
                                       ${errors.firstName
                                                            ? "border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,.15)]"
                                                            : "border-slate-200"}`}
                                                    placeholder="John"
                                                    autoComplete="given-name"
                                                    aria-required="true"
                                                    aria-describedby={errors.firstName ? "signup-firstname-error" : undefined}
                                                    aria-invalid={!!errors.firstName}
                                                    {...register("firstName", {
                                                        required: "First name is required.",
                                                        validate: (val) => val.trim().length > 0 || "First name is required."
                                                    })}
                                                />
                                            </div>
                                            {errors.firstName && (
                                                <p id="signup-firstname-error"
                                                    className="su-error-pop flex items-center gap-1.5 m-0 text-[11px] sm:text-[.78rem] font-medium text-red-600"
                                                    role="alert">
                                                    <ErrorIcon />{errors.firstName.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Last name */}
                                        <div className="flex flex-col gap-1.5">
                                            <label htmlFor="signup-lastname"
                                                className="text-xs sm:text-[.8125rem] font-semibold text-slate-900 tracking-[.01em]">
                                                Last name <span className="text-red-600" aria-hidden="true">*</span>
                                            </label>
                                            <div className="relative flex items-center">
                                                <input
                                                    id="signup-lastname"
                                                    type="text"
                                                    className={`w-full h-10 sm:h-[46px] px-3.5 rounded-xl border-[1.5px] bg-white text-xs sm:text-[.9375rem] text-slate-900 outline-none placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 hover:border-slate-300 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,.18)] ${errors.lastName
                                                        ? "border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,.15)]"
                                                        : "border-slate-200"}`}
                                                    placeholder="Smith"
                                                    autoComplete="family-name"
                                                    aria-required="true"
                                                    aria-describedby={errors.lastName ? "signup-lastname-error" : undefined}
                                                    aria-invalid={!!errors.lastName}
                                                    {...register("lastName", {
                                                        required: "Last name is required.",
                                                        validate: (val) => val.trim().length > 0 || "Last name is required."
                                                    })}
                                                />
                                            </div>
                                            {errors.lastName && (
                                                <p id="signup-lastname-error"
                                                    className="su-error-pop flex items-center gap-1.5 m-0 text-[11px] sm:text-[.78rem] font-medium text-red-600"
                                                    role="alert">
                                                    <ErrorIcon />{errors.lastName.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="signup-email"
                                            className="text-xs sm:text-[.8125rem] font-semibold text-slate-900 tracking-[.01em]">
                                            Work email <span className="text-red-600" aria-hidden="true">*</span>
                                        </label>
                                        <div className="relative flex items-center">
                                            <Email className={`absolute left-3.5 w-4 h-4 pointer-events-none transition-colors duration-150 ${errors.email ? "text-red-500" : "text-slate-400"}`} />
                                            <input
                                                id="signup-email"
                                                type="email"
                                                className={`w-full h-10 sm:h-[46px] pl-[2.875rem] pr-4 rounded-xl border-[1.5px] bg-white text-xs sm:text-[.9375rem] text-slate-900 outline-none placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 hover:border-slate-300 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,.18)] ${errors.email
                                                    ? "border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,.15)]"
                                                    : "border-slate-200"}`}
                                                placeholder="doctor@clinic.com"
                                                autoComplete="email"
                                                aria-required="true"
                                                aria-describedby={errors.email ? "signup-email-error" : undefined}
                                                aria-invalid={!!errors.email}
                                                {...register("email", {
                                                    required: "Email address is required.",
                                                    pattern: {
                                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                        message: "Enter a valid email address."
                                                    }
                                                })}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p id="signup-email-error"
                                                className="su-error-pop flex items-center gap-1.5 m-0 text-[11px] sm:text-[.79rem] font-medium text-red-600"
                                                role="alert">
                                                <ErrorIcon />{errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="signup-phone"
                                            className="text-xs sm:text-[.8125rem] font-semibold text-slate-900 tracking-[.01em]">
                                            Phone
                                            <span className="ml-1.5 text-[10px] sm:text-[.75rem] font-normal text-slate-400">(optional)</span>
                                        </label>
                                        <div className="relative flex items-center">
                                            <Phone className={`absolute left-3.5 w-4 h-4 pointer-events-none transition-colors duration-150
                                                    ${errors.phone ? "text-red-500" : "text-slate-400"}`} />
                                            <input
                                                id="signup-phone"
                                                type="tel"
                                                className={`w-full h-10 sm:h-[46px] pl-[2.875rem] pr-3 rounded-xl border-[1.5px] bg-white text-xs sm:text-[.9375rem] text-slate-900 outline-none placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 hover:border-slate-300 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,.18)]
                                                        ${errors.phone
                                                        ? "border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,.15)]"
                                                        : "border-slate-200"}`}
                                                placeholder="+1 555 000 0000"
                                                autoComplete="tel"
                                                aria-describedby={errors.phone ? "signup-phone-error" : undefined}
                                                aria-invalid={!!errors.phone}
                                                {...register("phone", {
                                                    pattern: {
                                                        value: /^\+?[\d\s\-()]{7,15}$/,
                                                        message: "Enter a valid phone number."
                                                    }
                                                })}
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p id="signup-phone-error"
                                                className="su-error-pop flex items-center gap-1.5 m-0 text-[11px] sm:text-[.78rem] font-medium text-red-600"
                                                role="alert">
                                                <ErrorIcon />{errors.phone.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <p className="text-[10px] sm:text-[.7rem] font-bold text-slate-400 uppercase tracking-widest mt-1 -mb-1">
                                        Security
                                    </p>

                                    {/* Password */}
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="signup-password"
                                            className="text-xs sm:text-[.8125rem] font-semibold text-slate-900 tracking-[.01em]">
                                            Password <span className="text-red-600" aria-hidden="true">*</span>
                                        </label>
                                        <div className="relative flex items-center">

                                            <Password className={`absolute left-3.5 w-4 h-4 pointer-events-none
                                                transition-colors duration-150
                                                ${errors.password ? "text-red-500" : "text-slate-400"}`} />

                                            <input
                                                id="signup-password"
                                                type={showPw ? "text" : "password"}
                                                className={`w-full h-10 sm:h-[46px] pl-[2.875rem] pr-12 rounded-xl border-[1.5px]
                                                bg-white text-xs sm:text-[.9375rem] text-slate-900 outline-none
                                                placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150
                                                hover:border-slate-300
                                                focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,.18)]
                                                ${errors.password
                                                        ? "border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,.15)]"
                                                        : "border-slate-200"}`}
                                                placeholder="Min. 8 characters"
                                                autoComplete="new-password"
                                                aria-required="true"
                                                aria-describedby={
                                                    ["signup-password-strength", errors.password ? "signup-password-error" : ""].filter(Boolean).join(" ") || undefined
                                                }
                                                aria-invalid={!!errors.password}
                                                {...register("password", {
                                                    required: "Password is required.",
                                                    minLength: {
                                                        value: 8,
                                                        message: "Password must be at least 8 characters."
                                                    }
                                                })}
                                            />

                                            <button
                                                type="button"
                                                className="absolute right-3 flex items-center justify-center w-8 h-8
                                                border-none bg-transparent text-slate-400 cursor-pointer rounded-lg p-0
                                                hover:text-blue-600 transition-colors duration-150
                                                focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-1"
                                                onClick={() => setShowPw((v) => !v)}
                                                aria-label={showPw ? "Hide password" : "Show password"}
                                            >
                                                {showPw ? <OpenEye /> : <CloseEye />}
                                            </button>
                                        </div>

                                        {/* Strength meter */}
                                        {passwordVal && (
                                            <div id="signup-password-strength" aria-live="polite">
                                                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                                    <div
                                                        className="su-bar-fill h-full rounded-full transition-all duration-300"
                                                        style={{ width: `${strength.pct}%`, background: strength.color }}
                                                    />
                                                </div>
                                                <p className="mt-1 text-[11px] sm:text-[.76rem] font-medium" style={{ color: strength.color }}>
                                                    {strength.label}
                                                    {strength.score < 3 && (
                                                        <span className="text-slate-400 font-normal ml-1">
                                                            — add uppercase, numbers, or symbols
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        )}

                                        {errors.password && (
                                            <p id="signup-password-error"
                                                className="su-error-pop flex items-center gap-1.5 m-0 text-[11px] sm:text-[.79rem] font-medium text-red-600"
                                                role="alert">
                                                <ErrorIcon />{errors.password.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm password */}
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="signup-confirm"
                                            className="text-xs sm:text-[.8125rem] font-semibold text-slate-900 tracking-[.01em]">
                                            Confirm password <span className="text-red-600" aria-hidden="true">*</span>
                                        </label>
                                        <div className="relative flex items-center">
                                            <Password className={`absolute left-3.5 w-4 h-4 pointer-events-none transition-colors duration-150 ${errors.confirm ? "text-red-500" : "text-slate-400"}`} />
                                            <input
                                                id="signup-confirm"
                                                type={showConfirm ? "text" : "password"}
                                                className={`w-full h-10 sm:h-[46px] pl-[2.875rem] pr-12 rounded-xl border-[1.5px] bg-white text-xs sm:text-[.9375rem] text-slate-900 outline-none placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 hover:border-slate-300 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,.18)] ${errors.confirm ? "border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,.15)]" : confirmVal && confirmVal === passwordVal ? "border-teal-400 focus:shadow-[0_0_0_3px_rgba(20,184,166,.15)]" : "border-slate-200"}`}
                                                placeholder="Re-enter password"
                                                autoComplete="new-password"
                                                aria-required="true"
                                                aria-describedby={errors.confirm ? "signup-confirm-error" : undefined}
                                                aria-invalid={!!errors.confirm}
                                                {...register("confirm", {
                                                    required: "Please confirm your password.",
                                                    validate: (val) => val === watch("password") || "Passwords do not match."
                                                })}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 flex items-center justify-center w-8 h-8 border-none bg-transparent text-slate-400 cursor-pointer rounded-lg p-0 hover:text-blue-600 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-1"
                                                onClick={() => setShowConfirm((v) => !v)}
                                                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                                            >
                                                {showConfirm ? <OpenEye /> : <CloseEye />}
                                            </button>
                                        </div>
                                        {errors.confirm && (
                                            <p id="signup-confirm-error"
                                                className="su-error-pop flex items-center gap-1.5 m-0 text-[11px] sm:text-[.79rem] font-medium text-red-600"
                                                role="alert">
                                                <ErrorIcon />{errors.confirm.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Terms checkbox */}
                                    <div className="flex flex-col gap-1.5 mt-1">
                                        <label className="flex items-start gap-2.5 cursor-pointer" htmlFor="signup-terms">
                                            <input
                                                id="signup-terms"
                                                type="checkbox"
                                                className="sr-only peer"
                                                {...register("agreed", {
                                                    validate: (val) => val === true || "You must accept the terms to continue."
                                                })}
                                            />
                                            <span
                                                className={`shrink-0 w-4 h-4 sm:w-[18px] sm:h-[18px] mt-px rounded-md border-[1.5px] bg-white flex items-center justify-center transition-colors duration-150 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-focus-visible:outline-2 peer-focus-visible:outline-blue-600 peer-focus-visible:outline-offset-2 ${errors.agreed ? "border-red-400" : "border-slate-200"}`}
                                                aria-hidden="true"
                                            >
                                                {agreedVal && (
                                                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none"
                                                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="2,6 5,9 10,3" />
                                                    </svg>
                                                )}
                                            </span>
                                            <span className="text-xs sm:text-[.875rem] text-slate-500 leading-snug">
                                                I agree to the{" "}
                                                <a href="/terms" className="text-blue-600 font-medium no-underline hover:underline focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:rounded-sm">
                                                    Terms of Service
                                                </a>
                                                {" "}and{" "}
                                                <a href="/privacy" className="text-blue-600 font-medium no-underline hover:underline focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:rounded-sm">
                                                    Privacy Policy
                                                </a>
                                                <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>
                                            </span>
                                        </label>
                                        {errors.agreed && (
                                            <p className="su-error-pop flex items-center gap-1.5 m-0 text-[11px] sm:text-[.79rem] font-medium text-red-600"
                                                role="alert">
                                                <ErrorIcon />{errors.agreed.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit */}
                                    <button
                                        id="signup-submit"
                                        type="submit"
                                        disabled={loading}
                                        aria-busy={loading}
                                        className="flex items-center justify-center gap-2 h-11 sm:h-12 w-full px-6 mt-1
                                        border-none rounded-xl cursor-pointer font-semibold text-sm sm:text-base
                                        text-white tracking-[.01em]
                                        bg-gradient-to-br from-blue-600 to-blue-800
                                        shadow-[0_4px_14px_rgba(37,99,235,.35)]
                                        transition-all duration-150
                                        hover:not-disabled:from-blue-700 hover:not-disabled:to-blue-900
                                        hover:not-disabled:shadow-[0_6px_20px_rgba(37,99,235,.45)]
                                        hover:not-disabled:-translate-y-px
                                        active:not-disabled:translate-y-0
                                        active:not-disabled:shadow-[0_2px_8px_rgba(37,99,235,.3)]
                                        disabled:opacity-75 disabled:cursor-not-allowed
                                        focus-visible:outline-[3px] focus-visible:outline-blue-600 focus-visible:outline-offset-[3px]"
                                    >
                                        {loading ? <><Loader />Creating account…</> : "Create doctor account"}
                                    </button>
                                </form>

                                {/* ── Divider ──────────────────────────────── */}
                                <div className="flex items-center gap-3 my-4 sm:my-5 text-slate-400 text-xs sm:text-[.8rem]" aria-hidden="true">
                                    <span className="flex-1 h-px bg-slate-200" />
                                    <span>Already have an account?</span>
                                    <span className="flex-1 h-px bg-slate-200" />
                                </div>

                                {/* Sign in link */}
                                <a
                                    href="/login"
                                    id="signup-signin-link"
                                    className="flex items-center justify-center h-10 sm:h-[46px] w-full px-6
                                    border-[1.5px] border-slate-200 rounded-xl bg-white
                                    text-slate-900 font-semibold text-xs sm:text-[.9375rem] no-underline
                                    transition-all duration-150
                                    hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600
                                    hover:shadow-sm hover:-translate-y-px
                                    focus-visible:outline-[3px] focus-visible:outline-blue-600 focus-visible:outline-offset-[3px]"
                                >
                                    Sign in instead
                                </a>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
