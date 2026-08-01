import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { LoginService } from "../../service/api/authServices.js";
import { saveToken } from "../../service/httpServices.js";
import { ClinicLogo, CloseEye, Email, ErrorIcon, IconAlert, Loader, OpenEye, Password } from "../../assets/Icons/index.js";

/* ── Shared class strings ───────────────────────────────────── */
const inputBase =
  "w-full h-10 sm:h-[46px] rounded-xl border-[1.5px] bg-white text-xs sm:text-[15px] text-slate-900 " +
  "outline-none placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 " +
  "hover:border-slate-300 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,.18)]";
const inputErr =
  "border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,.15)]";
const inputOk = "border-slate-200";

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function SignIn() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setFocus,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const errorRef = useRef(null);

  const rememberMe = watch("rememberMe");

  /* Initial focus */
  useEffect(() => { setFocus("email"); }, [setFocus]);

  /* Pre-fill remembered email */
  useEffect(() => {
    const saved = localStorage.getItem("cms_remembered_email");
    if (saved) {
      setValue("email", saved);
      setValue("rememberMe", true);
    }
  }, [setValue]);

  /* Focus error banner for screen-readers */
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  /* ── Submit ─────────────────────────────────────────────── */
  async function onSubmit(data) {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const resData = await LoginService({
        email: data.email,
        password: data.password,
      });

      // Persist the access token using the shared helper (key: "token")
      saveToken(resData.accessToken ?? "");

      // Store username in localStorage
      if (resData?.user?.username) {
        localStorage.setItem("username", resData.user.username);
      }

      // Honour "Remember me" for email pre-fill on next visit
      if (data.rememberMe) localStorage.setItem("cms_remembered_email", data.email);
      else localStorage.removeItem("cms_remembered_email");

      const hasClinic = Boolean(resData?.user?.clinicinfo?.clinicName && resData.user.clinicinfo.clinicName.trim() !== "");
      if (hasClinic) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/medical-info", { replace: true });
      }

    } catch (err) {
      // For 401 errors, httpServices.js returns the raw Axios error (no enrichment).
      // We therefore read the backend's own message first (they use "massage" typo).
      const apiMessage =
        err?.response?.data?.massage ||
        err?.response?.data?.message ||
        err.message ||
        "Invalid email or password. Please try again.";
      setError(apiMessage);
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
                          rounded-2xl mb-6 bg-white shadow-xl shadow-slate-950/30 border border-white/30 p-3.5"
            aria-label="ClinicCMS">
            <ClinicLogo className="w-11 h-11 drop-shadow-sm" />
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
      <main className="flex-1 flex items-center justify-center px-3.5 sm:px-6 py-6 sm:py-8 overflow-y-auto">
        <div className="w-full max-w-[440px] bg-white rounded-2xl sm:rounded-[20px]
                        border border-slate-200
                        shadow-[0_20px_60px_rgba(15,23,42,.12),0_8px_24px_rgba(15,23,42,.06)]
                        p-4 sm:p-7 md:p-10">

          {/* ── Card header ──────────────────────────────── */}
          <div className="mb-5 sm:mb-7 text-center">
            {/* Mobile-only logo */}
            <div className="lg:hidden inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14
                            rounded-2xl border border-slate-200/90 shadow-sm mb-4 sm:mb-5 mx-auto p-1 sm:p-2.5">
              <ClinicLogo className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-sm" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-[1.625rem] font-extrabold text-slate-900 tracking-tight leading-tight mb-1">
              Welcome back, Doctor
            </h2>
            <p className="text-xs sm:text-[0.9rem] text-slate-500">
              Sign in to your clinic dashboard
            </p>
          </div>

          {/* ── Global error banner ───────────────────────── */}
          {error && (
            <div
              id="signin-error-banner"
              ref={errorRef}
              className="flex items-start gap-2.5 p-3 sm:p-3.5 rounded-xl mb-4 sm:mb-5
                         text-xs sm:text-[0.875rem] font-medium leading-snug
                         bg-red-50 border border-red-200/60 text-red-600"
              role="alert"
              tabIndex={-1}
            >
              <IconAlert />
              <span>{error}</span>
            </div>
          )}

          {/* ── Form ─────────────────────────────────────── */}
          <form id="signin-form" className="flex flex-col gap-4 sm:gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="signin-email"
                className="text-xs sm:text-[0.8125rem] font-semibold text-slate-900 tracking-[0.01em]">
                Email address{" "}
                <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <div className="relative flex items-center">
                <span className={`absolute left-3.5 pointer-events-none transition-colors duration-150
                                  ${errors.email ? "text-red-500" : "text-slate-400"}`}>
                  <Email />
                </span>
                <input
                  id="signin-email"
                  type="email"
                  className={`${inputBase} pl-[46px] pr-4 ${errors.email ? inputErr : inputOk}`}
                  placeholder="doctor@clinic.com"
                  autoComplete="email"
                  aria-required="true"
                  aria-describedby={errors.email ? "signin-email-error" : undefined}
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
                <p id="signin-email-error"
                  className="flex items-center gap-1.5 m-0 text-[11px] sm:text-[0.79rem] font-medium text-red-600"
                  role="alert">
                  <ErrorIcon />{errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="signin-password"
                  className="text-xs sm:text-[0.8125rem] font-semibold text-slate-900 tracking-[0.01em]">
                  Password{" "}
                  <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <a href="/forgot-password"
                  className="text-[11px] sm:text-[0.8rem] font-medium text-blue-600 no-underline
                             hover:text-blue-700 hover:underline transition-colors duration-150
                             focus-visible:outline-2 focus-visible:outline-blue-600
                             focus-visible:outline-offset-2 focus-visible:rounded-sm">
                  Forgot password?
                </a>
              </div>
              <div className="relative flex items-center">
                <span className={`absolute left-3.5 pointer-events-none transition-colors duration-150
                                  ${errors.password ? "text-red-500" : "text-slate-400"}`}>
                  <Password />
                </span>
                <input
                  id="signin-password"
                  type={showPw ? "text" : "password"}
                  className={`${inputBase} pl-[46px] pr-12 ${errors.password ? inputErr : inputOk}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-required="true"
                  aria-describedby={errors.password ? "signin-password-error" : undefined}
                  aria-invalid={!!errors.password}
                  {...register("password", {
                    required: "Password is required.",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters."
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 flex items-center justify-center w-8 h-8
                             border-none bg-transparent text-slate-400 cursor-pointer
                             rounded-lg p-0 hover:text-blue-600 transition-colors duration-150
                             focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-1"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <OpenEye /> : <CloseEye />}
                </button>
              </div>
              {errors.password && (
                <p id="signin-password-error"
                  className="flex items-center gap-1.5 m-0 text-[11px] sm:text-[0.79rem] font-medium text-red-600"
                  role="alert">
                  <ErrorIcon />{errors.password.message}
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
                {...register("rememberMe")}
              />
              <span
                className="shrink-0 w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-md border-[1.5px] border-slate-200
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
              <span className="text-xs sm:text-[0.875rem] text-slate-500">Remember me for 30 days</span>
            </label>

            {/* Submit button */}
            <button
              id="signin-submit"
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="flex items-center justify-center gap-2 h-11 sm:h-12 w-full px-6 mt-1
                         border-none rounded-xl font-semibold text-sm sm:text-base text-white
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
              {loading ? <><Loader />Signing in…</> : "Sign in to Dashboard"}
            </button>
          </form>

          {/* ── Divider ──────────────────────────────────── */}
          <div className="flex items-center gap-3 my-4 sm:my-6 text-slate-400 text-xs sm:text-[0.8rem]"
            aria-hidden="true">
            <span className="flex-1 h-px bg-slate-200" />
            <span>New to ClinicCMS?</span>
            <span className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Sign-up link */}
          <a
            href="/signup"
            id="signin-signup-link"
            className="flex items-center justify-center h-10 sm:h-[46px] w-full px-6
                       border-[1.5px] border-slate-200 rounded-xl bg-white
                       text-slate-900 font-semibold text-xs sm:text-[0.9375rem] no-underline
                       transition-all duration-150
                       hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600
                       hover:shadow-sm hover:-translate-y-px
                       focus-visible:outline-[3px] focus-visible:outline-blue-600
                       focus-visible:outline-offset-[3px]"
          >
            Create a doctor account
          </a>

          {/* Footer note */}
          <p className="mt-4 sm:mt-5 text-center text-[10px] sm:text-[0.775rem] text-slate-400 leading-relaxed">
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
