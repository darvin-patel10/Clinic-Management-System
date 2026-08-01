import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ForgotPasswordService, OtpVerifyService, ResetPasswordService } from "../../service/api/authServices.js";
import { ClinicLogo, CloseEye, Email, ErrorIcon, IconAlert, Loader, OpenEye, Password } from "../../assets/Icons/index.js";
import { ArrowLeft, CheckCircle2, KeyRound, ShieldCheck, RefreshCw } from "lucide-react";

/* ── Shared input styling constants ─────────────────────────── */
const inputBase =
  "w-full h-[46px] rounded-[10px] border-[1.5px] bg-white text-[15px] text-slate-900 " +
  "outline-none placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 " +
  "hover:border-slate-300 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,.18)]";
const inputErr = "border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,.15)]";
const inputOk = "border-slate-200";

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Multi-step flow: 1 = Email, 2 = Verify OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState(1);

  // Form states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI / Action states
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // OTP countdown timer
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const errorRef = useRef(null);

  // Focus error message when set
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  // Resend OTP countdown effect
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  /* ── Step 1: Send OTP ──────────────────────────────────────── */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await ForgotPasswordService({ email });
      setSuccessMessage(res?.message || "OTP sent successfully to your email.");
      setStep(2);
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.massage || err?.message || "Failed to send OTP. Please check your email.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Verify OTP ─────────────────────────────────────── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length === 0) {
      setError("Please enter the OTP code sent to your email.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await OtpVerifyService({ email, otp: otp.trim() });
      if (res?.resetToken) {
        setResetToken(res.resetToken);
        setStep(3);
        setSuccessMessage("OTP verified successfully. Now set your new password.");
      } else {
        setError("Invalid response from server. Reset token missing.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.massage || err?.message || "Invalid or expired OTP code.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend OTP Action ──────────────────────────────────────── */
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await ForgotPasswordService({ email });
      setSuccessMessage(res?.message || "A new OTP code has been sent to your email.");
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.massage || err?.message || "Failed to resend OTP.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 3: Reset Password ─────────────────────────────────── */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await ResetPasswordService({
        resetToken,
        password: newPassword,
      });
      setStep(4);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.massage || err?.message || "Failed to reset password. Please request a new OTP.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Floating orbs */}
        <div className="animate-pulse absolute -top-20 -left-16 w-80 h-80 rounded-full
                        bg-blue-600 blur-[60px] opacity-20 pointer-events-none" />
        <div className="animate-pulse absolute -bottom-10 -right-20 w-64 h-64 rounded-full
                        bg-teal-500 blur-[60px] opacity-20 pointer-events-none [animation-delay:1.5s]" />

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
          <div className="inline-flex items-center justify-center w-[72px] h-[72px]
                          rounded-2xl mb-6 bg-white/5 border border-white/10 backdrop-blur-sm">
            <ClinicLogo className="w-11 h-11 drop-shadow-sm" />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-3
                         bg-gradient-to-br from-white via-white to-teal-400 bg-clip-text text-transparent">
            ClinicCMS
          </h1>

          <p className="text-white/60 text-[0.975rem] leading-relaxed mb-8">
            Account Security & Recovery,<br />protecting doctor access seamlessly.
          </p>

          <ul className="list-none m-0 p-0 flex flex-col gap-3 text-left">
            {features.map((f, i) => (
              <li key={i}
                className="flex items-center gap-3 px-4 py-2.5 rounded-[10px]
                           bg-white/[0.06] border border-white/[0.09] backdrop-blur-sm
                           text-white/80 text-[0.9rem] font-medium transition-colors hover:bg-white/10">
                <span className="text-lg shrink-0">{f.icon}</span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="absolute bottom-6 text-[0.75rem] text-white/30 z-10">
          © {new Date().getFullYear()} ClinicCMS · Licensed medical software
        </p>
      </aside>

      {/* ════════════════════════════════════════════════════
          RIGHT PANEL — Multi-step recovery form
      ════════════════════════════════════════════════════ */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-[440px] bg-white rounded-[20px]
                        border border-slate-200
                        shadow-[0_20px_60px_rgba(15,23,42,.12),0_8px_24px_rgba(15,23,42,.06)]
                        p-8 sm:p-10">

          {/* Back link */}
          {step < 4 && (
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          )}

          {/* Stepper Progress Bar */}
          {step < 4 && (
            <div className="flex items-center justify-between gap-2 mb-7">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex flex-col gap-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step >= s ? "bg-blue-600 shadow-sm" : "bg-slate-100"
                    }`}
                  />
                  <span className={`text-[10px] font-bold text-center uppercase tracking-wider ${
                    step === s ? "text-blue-600" : "text-slate-400"
                  }`}>
                    {s === 1 ? "Email" : s === 2 ? "Verify" : "Reset"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── Error Banner ─────────────────────────────── */}
          {error && (
            <div
              ref={errorRef}
              tabIndex={-1}
              className="flex items-start gap-2.5 p-3.5 rounded-[10px] mb-5
                         text-[0.875rem] font-medium leading-snug
                         bg-red-50 border border-red-200/60 text-red-600 outline-none"
              role="alert"
            >
              <IconAlert />
              <span>{error}</span>
            </div>
          )}

          {/* ════════════════════════════════════════════════
              STEP 1: REQUEST OTP
          ════════════════════════════════════════════════ */}
          {step === 1 && (
            <div>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <Email className="w-6 h-6" />
                </div>
                <h2 className="text-[1.5rem] font-extrabold text-slate-900 tracking-tight leading-tight mb-1">
                  Forgot Password?
                </h2>
                <p className="text-[0.875rem] text-slate-500">
                  Enter your registered doctor email address and we'll send you an OTP code.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="flex flex-col gap-5" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="forgot-email" className="text-[0.8125rem] font-semibold text-slate-900">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 pointer-events-none text-slate-400">
                      <Email />
                    </span>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="doctor@clinic.com"
                      className={`${inputBase} pl-[46px] pr-4 ${error ? inputErr : inputOk}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 h-12 w-full px-6 mt-1
                             border-none rounded-[10px] font-semibold text-base text-white
                             bg-gradient-to-br from-blue-600 to-blue-800
                             shadow-[0_4px_14px_rgba(37,99,235,.35)]
                             transition-all hover:from-blue-700 hover:to-blue-900 cursor-pointer
                             disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <><Loader />Sending OTP…</> : "Send OTP Code"}
                </button>
              </form>
            </div>
          )}

          {/* ════════════════════════════════════════════════
              STEP 2: VERIFY OTP
          ════════════════════════════════════════════════ */}
          {step === 2 && (
            <div>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-[1.5rem] font-extrabold text-slate-900 tracking-tight leading-tight mb-1">
                  Enter Verification Code
                </h2>
                <p className="text-[0.875rem] text-slate-500">
                  We sent an OTP code to <strong className="text-slate-800">{email}</strong>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="forgot-otp" className="text-[0.8125rem] font-semibold text-slate-900">
                    OTP Code <span className="text-red-600">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="forgot-otp"
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className={`${inputBase} px-4 text-center font-mono tracking-widest text-lg font-bold ${error ? inputErr : inputOk}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 h-12 w-full px-6 mt-1
                             border-none rounded-[10px] font-semibold text-base text-white
                             bg-gradient-to-br from-blue-600 to-blue-800
                             shadow-[0_4px_14px_rgba(37,99,235,.35)]
                             transition-all hover:from-blue-700 hover:to-blue-900 cursor-pointer
                             disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <><Loader />Verifying OTP…</> : "Verify & Continue"}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Change Email
                  </button>

                  <button
                    type="button"
                    disabled={!canResend || loading}
                    onClick={handleResendOtp}
                    className={`flex items-center gap-1 font-bold ${
                      canResend ? "text-blue-600 hover:underline cursor-pointer" : "text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    {canResend ? "Resend OTP" : `Resend in ${timer}s`}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ════════════════════════════════════════════════
              STEP 3: RESET PASSWORD
          ════════════════════════════════════════════════ */}
          {step === 3 && (
            <div>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-[1.5rem] font-extrabold text-slate-900 tracking-tight leading-tight mb-1">
                  Reset New Password
                </h2>
                <p className="text-[0.875rem] text-slate-500">
                  Create a new password for your ClinicCMS account.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="flex flex-col gap-4" noValidate>
                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="new-password" className="text-[0.8125rem] font-semibold text-slate-900">
                    New Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 pointer-events-none text-slate-400">
                      <Password />
                    </span>
                    <input
                      id="new-password"
                      type={showPw ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputBase} pl-[46px] pr-12 ${error ? inputErr : inputOk}`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 text-slate-400 hover:text-blue-600 p-1 cursor-pointer"
                      onClick={() => setShowPw(!showPw)}
                    >
                      {showPw ? <OpenEye /> : <CloseEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm-password" className="text-[0.8125rem] font-semibold text-slate-900">
                    Confirm Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 pointer-events-none text-slate-400">
                      <Password />
                    </span>
                    <input
                      id="confirm-password"
                      type={showConfirmPw ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputBase} pl-[46px] pr-12 ${error ? inputErr : inputOk}`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 text-slate-400 hover:text-blue-600 p-1 cursor-pointer"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                    >
                      {showConfirmPw ? <OpenEye /> : <CloseEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 h-12 w-full px-6 mt-2
                             border-none rounded-[10px] font-semibold text-base text-white
                             bg-gradient-to-br from-blue-600 to-blue-800
                             shadow-[0_4px_14px_rgba(37,99,235,.35)]
                             transition-all hover:from-blue-700 hover:to-blue-900 cursor-pointer
                             disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <><Loader />Updating Password…</> : "Reset Password"}
                </button>
              </form>
            </div>
          )}

          {/* ════════════════════════════════════════════════
              STEP 4: SUCCESS CONFIRMATION
          ════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Password Reset Successful!
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed max-w-xs mx-auto">
                  Your password has been updated successfully. You can now sign in with your new password.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/signin", { replace: true })}
                className="flex items-center justify-center gap-2 h-12 w-full px-6 mt-4
                           border-none rounded-[10px] font-semibold text-base text-white
                           bg-gradient-to-br from-blue-600 to-blue-800
                           shadow-[0_4px_14px_rgba(37,99,235,.35)]
                           transition-all hover:from-blue-700 hover:to-blue-900 cursor-pointer"
              >
                Sign In Now
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
