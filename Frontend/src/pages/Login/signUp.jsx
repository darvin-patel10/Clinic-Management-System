import { React, useState, useEffect, useRef } from "react";
import api from "../../api.js";
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
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        specialty: "",
        password: "",
        confirm: "",
    });
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const firstNameRef = useRef(null);
    const errorRef = useRef(null);

    useEffect(() => { firstNameRef.current?.focus(); }, []);
    useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

    const strength = getStrength(form.password);

    /* ── Field change helper ────────────────────────────────── */
    function update(field, value) {
        setForm((p) => ({ ...p, [field]: value }));
        if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: "" }));
    }

    /* ── Validation ─────────────────────────────────────────── */
    function validate() {
        const errs = {};
        if (!form.firstName.trim()) errs.firstName = "First name is required.";
        if (!form.lastName.trim()) errs.lastName = "Last name is required.";

        if (!form.email.trim()) errs.email = "Email address is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            errs.email = "Enter a valid email address.";

        if (form.phone && !/^\+?[\d\s\-()]{7,15}$/.test(form.phone))
            errs.phone = "Enter a valid phone number.";

        if (!form.password) errs.password = "Password is required.";
        else if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";

        if (!form.confirm) errs.confirm = "Please confirm your password.";
        else if (form.confirm !== form.password)
            errs.confirm = "Passwords do not match.";

        if (!agreed) errs.agreed = "You must accept the terms to continue.";

        return errs;
    }

    /* ── Submit ─────────────────────────────────────────────── */
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setFieldErrors({});
        const errs = validate();
        if (Object.keys(errs).length) { setFieldErrors(errs); return; }

        setLoading(true);
        try {
            await api.post("/auth/register", {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim() || undefined,
                specialty: form.specialty.trim() || undefined,
                password: form.password,
            });
            setSuccess(true);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Registration failed. Please try again."
            );
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
                            <div className="w-11 h-11"><ClinicLogo className="text-teal-400" /></div>
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
                <main className="flex-1 flex items-start justify-center px-6 py-10 overflow-y-auto">
                    <div className="su-card-rise w-full max-w-[480px] bg-white rounded-[1.25rem]
                          border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,.12),0_8px_24px_rgba(15,23,42,.06)]
                          p-10">

                        {success ? (
                            <SuccessScreen />
                        ) : (
                            <>
                                {/* ── Card header ──────────────────────────── */}
                                <div className="mb-7 text-center">
                                    {/* Mobile logo */}
                                    <div className="lg:hidden inline-flex items-center justify-center w-14 h-14
                                  rounded-xl bg-blue-50 border border-slate-200 mb-5 mx-auto">
                                        <div className="w-9 h-9"><ClinicLogo className="text-blue-600" /></div>
                                    </div>
                                    <h2 className="text-[1.625rem] font-extrabold text-slate-900 tracking-tight leading-tight mb-1">
                                        Create your account
                                    </h2>
                                    <p className="text-[.9rem] text-slate-500">
                                        Doctor registration — takes less than 2 minutes
                                    </p>
                                </div>

                                {/* ── Global error ─────────────────────────── */}
                                {error && (
                                    <div
                                        id="signup-error-banner"
                                        ref={errorRef}
                                        className="su-alert-in flex items-start gap-[.625rem] p-[.875rem_1rem]
                               rounded-[.625rem] mb-5 text-[.875rem] font-medium leading-snug
                               bg-red-50 border border-red-200/50 text-red-600"
                                        role="alert"
                                        tabIndex={-1}
                                    >
                                        <svg className="w-[18px] h-[18px] shrink-0 mt-px" viewBox="0 0 20 20"
                                            fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd"
                                                d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* ── Form ─────────────────────────────────── */}
                                <form id="signup-form" className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>

                                    {/* Section label */}
                                    <p className="text-[.7rem] font-bold text-slate-400 uppercase tracking-widest -mb-1">
                                        Personal information
                                    </p>

                                    {/* First + Last name row */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* First name */}
                                        <div className="flex flex-col gap-[.375rem]">
                                            <label htmlFor="signup-firstname"
                                                className="text-[.8125rem] font-semibold text-slate-900 tracking-[.01em]">
                                                First name <span className="text-red-600" aria-hidden="true">*</span>
                                            </label>
                                            <div className="relative flex items-center">
                                                <Firstname className={`absolute left-[.875rem] w-[16px] h-[16px] pointer-events-none shrink-0 transition-colors duration-150 ${fieldErrors.firstName ? "text-red-500" : "text-slate-400"}`} />
                                                <input
                                                    id="signup-firstname"
                                                    ref={firstNameRef}
                                                    type="text"
                                                    className={`w-full h-[46px] pl-[2.5rem] pr-3 rounded-[.625rem] border-[1.5px]
                                      bg-white text-[.9375rem] text-slate-900 outline-none
                                      placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150
                                      hover:border-slate-300
                                      focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,.18)]
                                      ${fieldErrors.firstName
                                                            ? "border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,.15)]"
                                                            : "border-slate-200"}`}
                                                    placeholder="John"
                                                    value={form.firstName}
                                                    onChange={(e) => update("firstName", e.target.value)}
                                                    autoComplete="given-name"
                                                    aria-required="true"
                                                    aria-describedby={fieldErrors.firstName ? "signup-firstname-error" : undefined}
                                                    aria-invalid={!!fieldErrors.firstName}
                                                />
                                            </div>
                                            {fieldErrors.firstName && (
                                                <p id="signup-firstname-error"
                                                    className="su-error-pop flex items-center gap-[.3rem] m-0 text-[.78rem] font-medium text-red-600"
                                                    role="alert">
                                                    <ErrorIcon />{fieldErrors.firstName}
                                                </p>
                                            )}
                                        </div>

                                        {/* Last name */}
                                        <div className="flex flex-col gap-[.375rem]">
                                            <label htmlFor="signup-lastname"
                                                className="text-[.8125rem] font-semibold text-slate-900 tracking-[.01em]">
                                                Last name <span className="text-red-600" aria-hidden="true">*</span>
                                            </label>
                                            <div className="relative flex items-center">
                                                <input
                                                    id="signup-lastname"
                                                    type="text"
                                                    className={`w-full h-[46px] px-4 rounded-[.625rem] border-[1.5px] bg-white text-[.9375rem] text-slate-900 outline-none placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 hover:border-slate-300 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,.18)] ${fieldErrors.lastName
                                                        ? "border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,.15)]"
                                                        : "border-slate-200"}`}
                                                    placeholder="Smith"
                                                    value={form.lastName}
                                                    onChange={(e) => update("lastName", e.target.value)}
                                                    autoComplete="family-name"
                                                    aria-required="true"
                                                    aria-describedby={fieldErrors.lastName ? "signup-lastname-error" : undefined}
                                                    aria-invalid={!!fieldErrors.lastName}
                                                />
                                            </div>
                                            {fieldErrors.lastName && (
                                                <p id="signup-lastname-error"
                                                    className="su-error-pop flex items-center gap-[.3rem] m-0 text-[.78rem] font-medium text-red-600"
                                                    role="alert">
                                                    <ErrorIcon />{fieldErrors.lastName}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex flex-col gap-[.375rem]">
                                        <label htmlFor="signup-email"
                                            className="text-[.8125rem] font-semibold text-slate-900 tracking-[.01em]">
                                            Work email <span className="text-red-600" aria-hidden="true">*</span>
                                        </label>
                                        <div className="relative flex items-center">
                                            <Email className={`absolute left-[.875rem] w-[18px] h-[18px] pointer-events-none transition-colors duration-150 ${fieldErrors.email ? "text-red-500" : "text-slate-400"}`} />
                                            <input
                                                id="signup-email"
                                                type="email"
                                                className={`w-full h-[46px] pl-[2.875rem] pr-4 rounded-[.625rem] border-[1.5px] bg-white text-[.9375rem] text-slate-900 outline-none placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 hover:border-slate-300 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,.18)] ${fieldErrors.email
                                                    ? "border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,.15)]"
                                                    : "border-slate-200"}`}
                                                placeholder="doctor@clinic.com"
                                                value={form.email}
                                                onChange={(e) => update("email", e.target.value)}
                                                autoComplete="email"
                                                aria-required="true"
                                                aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
                                                aria-invalid={!!fieldErrors.email}
                                            />
                                        </div>
                                        {fieldErrors.email && (
                                            <p id="signup-email-error"
                                                className="su-error-pop flex items-center gap-[.3rem] m-0 text-[.79rem] font-medium text-red-600"
                                                role="alert">
                                                <ErrorIcon />{fieldErrors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone + Specialty row */}
                                    {/* <div className="grid grid-cols-2 gap-3"> */}
                                    {/* Phone */}
                                    <div className="flex flex-col gap-[.375rem]">
                                        <label htmlFor="signup-phone"
                                            className="text-[.8125rem] font-semibold text-slate-900 tracking-[.01em]">
                                            Phone
                                            <span className="ml-1.5 text-[.75rem] font-normal text-slate-400">(optional)</span>
                                        </label>
                                        <div className="relative flex items-center">
                                            <Phone className={`absolute left-[.875rem] w-[18px] h-[18px] pointer-events-none transition-colors duration-150
                                                    ${fieldErrors.phone ? "text-red-500" : "text-slate-400"}`} />
                                            <input
                                                id="signup-phone"
                                                type="tel"
                                                className={`w-full h-[46px] pl-[2.875rem] pr-3 rounded-[.625rem] border-[1.5px] bg-white text-[.9375rem] text-slate-900 outline-none placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 hover:border-slate-300 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,.18)]
                                                        ${fieldErrors.phone
                                                        ? "border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,.15)]"
                                                        : "border-slate-200"}`}
                                                placeholder="+1 555 000 0000"
                                                value={form.phone}
                                                onChange={(e) => update("phone", e.target.value)}
                                                autoComplete="tel"
                                                aria-describedby={fieldErrors.phone ? "signup-phone-error" : undefined}
                                                aria-invalid={!!fieldErrors.phone}
                                            />
                                        </div>
                                        {fieldErrors.phone && (
                                            <p id="signup-phone-error"
                                                className="su-error-pop flex items-center gap-[.3rem] m-0 text-[.78rem] font-medium text-red-600"
                                                role="alert">
                                                <ErrorIcon />{fieldErrors.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <p className="text-[.7rem] font-bold text-slate-400 uppercase tracking-widest mt-1 -mb-1">
                                        Security
                                    </p>

                                    {/* Password */}
                                    <div className="flex flex-col gap-[.375rem]">
                                        <label htmlFor="signup-password"
                                            className="text-[.8125rem] font-semibold text-slate-900 tracking-[.01em]">
                                            Password <span className="text-red-600" aria-hidden="true">*</span>
                                        </label>
                                        <div className="relative flex items-center">

                                            <Password className={`absolute left-[.875rem] w-[18px] h-[18px] pointer-events-none
                                                transition-colors duration-150
                                                ${fieldErrors.password ? "text-red-500" : "text-slate-400"}`} />

                                            <input
                                                id="signup-password"
                                                type={showPw ? "text" : "password"}
                                                className={`w-full h-[46px] pl-[2.875rem] pr-12 rounded-[.625rem] border-[1.5px]
                                                bg-white text-[.9375rem] text-slate-900 outline-none
                                                placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150
                                                hover:border-slate-300
                                                focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,.18)]
                                                ${fieldErrors.password
                                                        ? "border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,.15)]"
                                                        : "border-slate-200"}`}
                                                placeholder="Min. 8 characters"
                                                value={form.password}
                                                onChange={(e) => update("password", e.target.value)}
                                                autoComplete="new-password"
                                                aria-required="true"
                                                aria-describedby={
                                                    ["signup-password-strength", fieldErrors.password ? "signup-password-error" : ""].filter(Boolean).join(" ") || undefined
                                                }
                                                aria-invalid={!!fieldErrors.password}
                                            />

                                            <button
                                                type="button"
                                                className="absolute right-3 flex items-center justify-center w-8 h-8
                                                border-none bg-transparent text-slate-400 cursor-pointer rounded-md p-0
                                                hover:text-blue-600 transition-colors duration-150
                                                focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-1"
                                                onClick={() => setShowPw((v) => !v)}
                                                aria-label={showPw ? "Hide password" : "Show password"}
                                            >
                                                {showPw ? <OpenEye /> : <CloseEye />}
                                            </button>
                                        </div>

                                        {/* Strength meter */}
                                        {form.password && (
                                            <div id="signup-password-strength" aria-live="polite">
                                                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                                    <div
                                                        className="su-bar-fill h-full rounded-full transition-all duration-300"
                                                        style={{ width: `${strength.pct}%`, background: strength.color }}
                                                    />
                                                </div>
                                                <p className="mt-1 text-[.76rem] font-medium" style={{ color: strength.color }}>
                                                    {strength.label}
                                                    {strength.score < 3 && (
                                                        <span className="text-slate-400 font-normal ml-1">
                                                            — add uppercase, numbers, or symbols
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        )}

                                        {fieldErrors.password && (
                                            <p id="signup-password-error"
                                                className="su-error-pop flex items-center gap-[.3rem] m-0 text-[.79rem] font-medium text-red-600"
                                                role="alert">
                                                <ErrorIcon />{fieldErrors.password}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm password */}
                                    <div className="flex flex-col gap-[.375rem]">
                                        <label htmlFor="signup-confirm"
                                            className="text-[.8125rem] font-semibold text-slate-900 tracking-[.01em]">
                                            Confirm password <span className="text-red-600" aria-hidden="true">*</span>
                                        </label>
                                        <div className="relative flex items-center">
                                            <Password className={`absolute left-[.875rem] w-[18px] h-[18px] pointer-events-none transition-colors duration-150 ${fieldErrors.confirm ? "text-red-500" : "text-slate-400"}`} />
                                            <input
                                                id="signup-confirm"
                                                type={showConfirm ? "text" : "password"}
                                                className={`w-full h-[46px] pl-[2.875rem] pr-12 rounded-[.625rem] border-[1.5px] bg-white text-[.9375rem] text-slate-900 outline-none placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 hover:border-slate-300 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,.18)] ${fieldErrors.confirm ? "border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,.15)]" : form.confirm && form.confirm === form.password ? "border-teal-400 focus:shadow-[0_0_0_3px_rgba(20,184,166,.15)]" : "border-slate-200"}`}
                                                placeholder="Re-enter password"
                                                value={form.confirm}
                                                onChange={(e) => update("confirm", e.target.value)}
                                                autoComplete="new-password"
                                                aria-required="true"
                                                aria-describedby={fieldErrors.confirm ? "signup-confirm-error" : undefined}
                                                aria-invalid={!!fieldErrors.confirm}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 flex items-center justify-center w-8 h-8 border-none bg-transparent text-slate-400 cursor-pointer rounded-md p-0 hover:text-blue-600 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-1"
                                                onClick={() => setShowConfirm((v) => !v)}
                                                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                                            >
                                                {showConfirm ? <OpenEye /> : <CloseEye />}
                                            </button>
                                        </div>
                                        {fieldErrors.confirm && (
                                            <p id="signup-confirm-error"
                                                className="su-error-pop flex items-center gap-[.3rem] m-0 text-[.79rem] font-medium text-red-600"
                                                role="alert">
                                                <ErrorIcon />{fieldErrors.confirm}
                                            </p>
                                        )}
                                    </div>

                                    {/* Terms checkbox */}
                                    <div className="flex flex-col gap-[.375rem] mt-1">
                                        <label className="flex items-start gap-[.625rem] cursor-pointer" htmlFor="signup-terms">
                                            <input
                                                id="signup-terms"
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={agreed}
                                                onChange={(e) => {
                                                    setAgreed(e.target.checked);
                                                    if (fieldErrors.agreed) setFieldErrors((p) => ({ ...p, agreed: "" }));
                                                }}
                                            />
                                            <span
                                                className={`shrink-0 w-[18px] h-[18px] mt-px rounded-[.3rem] border-[1.5px] bg-white flex items-center justify-center transition-colors duration-150 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-focus-visible:outline-2 peer-focus-visible:outline-blue-600 peer-focus-visible:outline-offset-2 ${fieldErrors.agreed ? "border-red-400" : "border-slate-200"}`}
                                                aria-hidden="true"
                                            >
                                                {agreed && (
                                                    <svg className="w-[10px] h-[10px] text-white" viewBox="0 0 12 12" fill="none"
                                                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="2,6 5,9 10,3" />
                                                    </svg>
                                                )}
                                            </span>
                                            <span className="text-[.875rem] text-slate-500 leading-snug">
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
                                        {fieldErrors.agreed && (
                                            <p className="su-error-pop flex items-center gap-[.3rem] m-0 text-[.79rem] font-medium text-red-600"
                                                role="alert">
                                                <ErrorIcon />{fieldErrors.agreed}
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit */}
                                    <button
                                        id="signup-submit"
                                        type="submit"
                                        disabled={loading}
                                        aria-busy={loading}
                                        className="flex items-center justify-center gap-2 h-12 w-full px-6 mt-2
                                        border-none rounded-[.625rem] cursor-pointer font-semibold text-base
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
                                <div className="flex items-center gap-3 my-5 text-slate-400 text-[.8rem]" aria-hidden="true">
                                    <span className="flex-1 h-px bg-slate-200" />
                                    <span>Already have an account?</span>
                                    <span className="flex-1 h-px bg-slate-200" />
                                </div>

                                {/* Sign in link */}
                                <a
                                    href="/login"
                                    id="signup-signin-link"
                                    className="flex items-center justify-center h-[46px] w-full px-6
                                    border-[1.5px] border-slate-200 rounded-[.625rem] bg-white
                                    text-slate-900 font-semibold text-[.9375rem] no-underline
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
