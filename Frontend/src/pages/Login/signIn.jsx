import { useState, useEffect, useRef } from "react";
import api from "../../api.js";

/* ─────────────────────────────────────────────────────────────
   SignIn — Clinic Management System  (doctor-only login)
   POST /api/auth/login  →  stores accessToken  →  /dashboard
   100 % Tailwind CSS v4 — no style={{}}, no <style> injection.
───────────────────────────────────────────────────────────── */

/* ── Reusable SVG icons ─────────────────────────────────────── */
function IconEye() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd"
        d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
        clipRule="evenodd" />
    </svg>
  );
}

function IconError() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 4a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0V5zm-.75 6.5a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

/* ── Clinic logo SVG ────────────────────────────────────────── */
function ClinicLogo({ variant = "light" }) {
  if (variant === "dark") {
    return (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="23" stroke="rgba(37,99,235,0.2)" strokeWidth="2" />
        <path d="M24 10v28M10 24h28" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="24" cy="24" r="8" fill="rgba(37,99,235,0.08)" stroke="#2563eb" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="23" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
      <path d="M24 10v28M10 24h28" stroke="#14b8a6" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="24" cy="24" r="8" fill="rgba(20,184,166,0.15)" stroke="#14b8a6" strokeWidth="1.5" />
    </svg>
  );
}

/* ── Shared class strings ───────────────────────────────────── */
const inputBase =
  "w-full h-[46px] rounded-[10px] border-[1.5px] bg-white text-[15px] text-slate-900 " +
  "outline-none placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 " +
  "hover:border-slate-300 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,.18)]";
const inputErr =
  "border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,.15)]";
const inputOk = "border-slate-200";

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function SignIn() {
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [rememberMe,  setRememberMe]  = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const emailRef = useRef(null);
  const errorRef = useRef(null);

  /* Initial focus */
  useEffect(() => { emailRef.current?.focus(); }, []);

  /* Pre-fill remembered email */
  useEffect(() => {
    const saved = localStorage.getItem("cms_remembered_email");
    if (saved) { setEmail(saved); setRememberMe(true); }
  }, []);

  /* Focus error banner for screen-readers */
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  /* ── Validation ─────────────────────────────────────────── */
  function validate() {
    const errs = {};
    if (!email.trim())                                    errs.email    = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))  errs.email    = "Enter a valid email address.";
    if (!password)                                        errs.password = "Password is required.";
    else if (password.length < 6)                         errs.password = "Password must be at least 6 characters.";
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
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("accessToken", data.accessToken ?? data.token ?? "");
      if (rememberMe) localStorage.setItem("cms_remembered_email", email);
      else            localStorage.removeItem("cms_remembered_email");
      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error   ||
        "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const features = [
    { icon: "🩺", text: "Patient records at a glance" },
    { icon: "💊", text: "Medicine inventory & alerts" },
    { icon: "📋", text: "Prescription history tracking" },
    { icon: "📊", text: "Revenue & visit analytics" },
  ];

  return (
    <div className="flex min-h-dvh font-sans bg-slate-50">

      {/* ════════════════════════════════════════════════════
          LEFT PANEL — Branding (desktop only)
      ════════════════════════════════════════════════════ */}
      <aside
        className="hidden lg:flex relative flex-col justify-center items-center
                   w-[45%] shrink-0 px-12 py-12 overflow-hidden text-center
                   bg-gradient-to-br from-[#0b1437] via-[#0f2060] to-[#071428]"
        aria-hidden="true"
      >
        {/* Radial overlay glows */}
        <div className="absolute inset-0 pointer-events-none
                        bg-[radial-gradient(ellipse_at_30%_20%,rgba(37,99,235,.28)_0%,transparent_60%)]" />
        <div className="absolute inset-0 pointer-events-none
                        bg-[radial-gradient(ellipse_at_75%_80%,rgba(20,184,166,.2)_0%,transparent_55%)]" />

        {/* Floating orbs — animate-pulse gives a breathing glow */}
        <div className="animate-pulse absolute -top-20 -left-16 w-80 h-80 rounded-full
                        bg-blue-600 blur-[60px] opacity-20 pointer-events-none" />
        <div className="animate-pulse absolute -bottom-10 -right-20 w-64 h-64 rounded-full
                        bg-teal-500 blur-[60px] opacity-20 pointer-events-none
                        [animation-delay:1.5s]" />
        <div className="animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-44 h-44 rounded-full bg-indigo-400 blur-[60px] opacity-10 pointer-events-none
                        [animation-delay:3s]" />

        {/* Heartbeat SVG line */}
        <svg className="absolute bottom-28 left-0 w-full opacity-50 pointer-events-none"
          viewBox="0 0 400 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline
            points="0,40 60,40 80,10 100,70 120,40 160,40 180,20 200,60 220,40 400,40"
            stroke="rgba(20,184,166,0.75)" strokeWidth="2.5"
            fill="none" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>

        {/* Brand block */}
        <div className="relative z-10 max-w-sm">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-[72px] h-[72px]
                          rounded-2xl mb-6 bg-white/5 border border-white/10 backdrop-blur-sm"
            aria-label="ClinicCMS">
            <div className="w-11 h-11"><ClinicLogo variant="light" /></div>
          </div>

          {/* Title with gradient text */}
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-3
                         bg-gradient-to-br from-white via-white to-teal-400 bg-clip-text text-transparent">
            ClinicCMS
          </h1>

          <p className="text-white/60 text-[0.975rem] leading-relaxed mb-8">
            Doctor-only clinic management,<br />built for the speed of care.
          </p>

          {/* Feature list */}
          <ul className="list-none m-0 p-0 flex flex-col gap-3 text-left" role="list">
            {features.map((f, i) => (
              <li key={i}
                className="flex items-center gap-3 px-4 py-2.5 rounded-[10px]
                           bg-white/[0.06] border border-white/[0.09] backdrop-blur-sm
                           text-white/80 text-[0.9rem] font-medium
                           transition-colors duration-150 hover:bg-white/10">
                <span className="text-lg shrink-0" aria-hidden="true">{f.icon}</span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <p className="absolute bottom-6 text-[0.75rem] text-white/30 z-10">
          © {new Date().getFullYear()} ClinicCMS · Licensed medical software
        </p>
      </aside>

      {/* ════════════════════════════════════════════════════
          RIGHT PANEL — Sign-in form
      ════════════════════════════════════════════════════ */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-[440px] bg-white rounded-[20px]
                        border border-slate-200
                        shadow-[0_20px_60px_rgba(15,23,42,.12),0_8px_24px_rgba(15,23,42,.06)]
                        p-10">

          {/* ── Card header ──────────────────────────────── */}
          <div className="mb-7 text-center">
            {/* Mobile-only logo */}
            <div className="lg:hidden inline-flex items-center justify-center w-14 h-14
                            rounded-xl bg-blue-50 border border-slate-200 mb-5 mx-auto">
              <div className="w-9 h-9"><ClinicLogo variant="dark" /></div>
            </div>
            <h2 className="text-[1.625rem] font-extrabold text-slate-900 tracking-tight leading-tight mb-1">
              Welcome back, Doctor
            </h2>
            <p className="text-[0.9rem] text-slate-500">
              Sign in to your clinic dashboard
            </p>
          </div>

          {/* ── Global error banner ───────────────────────── */}
          {error && (
            <div
              id="signin-error-banner"
              ref={errorRef}
              className="flex items-start gap-2.5 p-3.5 rounded-[10px] mb-5
                         text-[0.875rem] font-medium leading-snug
                         bg-red-50 border border-red-200/60 text-red-600"
              role="alert"
              tabIndex={-1}
            >
              <IconAlert />
              <span>{error}</span>
            </div>
          )}

          {/* ── Form ─────────────────────────────────────── */}
          <form id="signin-form" className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>

            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="signin-email"
                className="text-[0.8125rem] font-semibold text-slate-900 tracking-[0.01em]">
                Email address{" "}
                <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <div className="relative flex items-center">
                <span className={`absolute left-3.5 pointer-events-none transition-colors duration-150
                                  ${fieldErrors.email ? "text-red-500" : "text-slate-400"}`}>
                  <IconMail />
                </span>
                <input
                  id="signin-email"
                  ref={emailRef}
                  type="email"
                  className={`${inputBase} pl-[46px] pr-4 ${fieldErrors.email ? inputErr : inputOk}`}
                  placeholder="doctor@clinic.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                  }}
                  autoComplete="email"
                  aria-required="true"
                  aria-describedby={fieldErrors.email ? "signin-email-error" : undefined}
                  aria-invalid={!!fieldErrors.email}
                />
              </div>
              {fieldErrors.email && (
                <p id="signin-email-error"
                  className="flex items-center gap-1.5 m-0 text-[0.79rem] font-medium text-red-600"
                  role="alert">
                  <IconError />{fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="signin-password"
                  className="text-[0.8125rem] font-semibold text-slate-900 tracking-[0.01em]">
                  Password{" "}
                  <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <a href="/forgot-password"
                  className="text-[0.8rem] font-medium text-blue-600 no-underline
                             hover:text-blue-700 hover:underline transition-colors duration-150
                             focus-visible:outline-2 focus-visible:outline-blue-600
                             focus-visible:outline-offset-2 focus-visible:rounded-sm">
                  Forgot password?
                </a>
              </div>
              <div className="relative flex items-center">
                <span className={`absolute left-3.5 pointer-events-none transition-colors duration-150
                                  ${fieldErrors.password ? "text-red-500" : "text-slate-400"}`}>
                  <IconLock />
                </span>
                <input
                  id="signin-password"
                  type={showPw ? "text" : "password"}
                  className={`${inputBase} pl-[46px] pr-12 ${fieldErrors.password ? inputErr : inputOk}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
                  }}
                  autoComplete="current-password"
                  aria-required="true"
                  aria-describedby={fieldErrors.password ? "signin-password-error" : undefined}
                  aria-invalid={!!fieldErrors.password}
                />
                <button
                  type="button"
                  className="absolute right-3 flex items-center justify-center w-8 h-8
                             border-none bg-transparent text-slate-400 cursor-pointer
                             rounded-[6px] p-0 hover:text-blue-600 transition-colors duration-150
                             focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-1"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <IconEye /> : <IconEyeOff />}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="signin-password-error"
                  className="flex items-center gap-1.5 m-0 text-[0.79rem] font-medium text-red-600"
                  role="alert">
                  <IconError />{fieldErrors.password}
                </p>
              )}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none"
              htmlFor="signin-remember">
              <input
                id="signin-remember"
                type="checkbox"
                className="sr-only peer"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span
                className="shrink-0 w-[18px] h-[18px] rounded-[5px] border-[1.5px] border-slate-200
                           bg-white flex items-center justify-center transition-colors duration-150
                           peer-checked:bg-blue-600 peer-checked:border-blue-600
                           peer-focus-visible:outline-2 peer-focus-visible:outline-blue-600
                           peer-focus-visible:outline-offset-2"
                aria-hidden="true"
              >
                {rememberMe && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                )}
              </span>
              <span className="text-[0.875rem] text-slate-500">Remember me for 30 days</span>
            </label>

            {/* Submit button */}
            <button
              id="signin-submit"
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="flex items-center justify-center gap-2 h-12 w-full px-6 mt-1
                         border-none rounded-[10px] font-semibold text-base text-white
                         tracking-[0.01em] cursor-pointer
                         bg-gradient-to-br from-blue-600 to-blue-800
                         shadow-[0_4px_14px_rgba(37,99,235,.35)]
                         transition-all duration-150
                         hover:from-blue-700 hover:to-blue-900
                         hover:shadow-[0_6px_20px_rgba(37,99,235,.45)]
                         hover:-translate-y-px
                         active:translate-y-0
                         active:shadow-[0_2px_8px_rgba(37,99,235,.3)]
                         disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0
                         focus-visible:outline-[3px] focus-visible:outline-blue-600
                         focus-visible:outline-offset-[3px]"
            >
              {loading ? <><Spinner />Signing in…</> : "Sign in to Dashboard"}
            </button>
          </form>

          {/* ── Divider ──────────────────────────────────── */}
          <div className="flex items-center gap-3 my-6 text-slate-400 text-[0.8rem]"
            aria-hidden="true">
            <span className="flex-1 h-px bg-slate-200" />
            <span>New to ClinicCMS?</span>
            <span className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Sign-up link */}
          <a
            href="/signup"
            id="signin-signup-link"
            className="flex items-center justify-center h-[46px] w-full px-6
                       border-[1.5px] border-slate-200 rounded-[10px] bg-white
                       text-slate-900 font-semibold text-[0.9375rem] no-underline
                       transition-all duration-150
                       hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600
                       hover:shadow-sm hover:-translate-y-px
                       focus-visible:outline-[3px] focus-visible:outline-blue-600
                       focus-visible:outline-offset-[3px]"
          >
            Create a doctor account
          </a>

          {/* Footer note */}
          <p className="mt-5 text-center text-[0.775rem] text-slate-400 leading-relaxed">
            By signing in you agree to our{" "}
            <a href="/terms"
              className="text-blue-600 no-underline font-medium hover:underline
                         focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:rounded-sm">
              Terms of Service
            </a>{" "}and{" "}
            <a href="/privacy"
              className="text-blue-600 no-underline font-medium hover:underline
                         focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:rounded-sm">
              Privacy Policy
            </a>.
          </p>
        </div>
      </main>
    </div>
  );
}
