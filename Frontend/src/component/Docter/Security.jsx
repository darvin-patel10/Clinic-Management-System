import React, { useState, useEffect } from "react";
import {
    Lock,
    KeyRound,
    Eye,
    EyeOff,
    CheckCircle2,
    Shield,
    Globe,
    Mail,
    ArrowLeft,
    Send,
    RefreshCw
} from "lucide-react";
import Loader from "../../component/Loader.jsx";
import Card from "../../component/Deshbord/Card.jsx";
import InputField from "../../component/InputField.jsx";
import Button from "../../component/Button.jsx";
import { useNotification } from "../../hooks/showNotification.jsx";
import {
    ForgotPasswordService,
    OtpVerifyService,
    ResetPasswordService
} from "../../service/api/authServices.js";

export default function SecurityTab({ userEmail = "" }) {
    const { showNotification } = useNotification();

    // Step state: 'email' | 'otp' | 'newPassword' | 'success'
    const [step, setStep] = useState("email");

    // Form inputs
    const [email, setEmail] = useState(userEmail || "");
    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI state
    const [showPass, setShowPass] = useState({ new: false, confirm: false });
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    // Sync user email when prop updates
    useEffect(() => {
        if (userEmail && !email) {
            setEmail(userEmail);
        }
    }, [userEmail]);

    // ── STEP 1: Send OTP to Email ─────────────────────────────────────────────
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            showNotification({
                title: "Email Required",
                message: "Please enter a valid email address.",
                type: "warning"
            });
            return;
        }

        setLoading(true);
        try {
            const res = await ForgotPasswordService({ email: email.trim() });
            showNotification({
                title: "OTP Sent Successfully",
                message: res?.message || `A verification code was sent to ${email}`,
                type: "success"
            });
            setStep("otp");
        } catch (err) {
            console.error("Failed to send OTP:", err);
            showNotification({
                title: "Error Sending OTP",
                message: err?.response?.data?.message || err?.message || "Failed to send verification code",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    // ── STEP 2: Verify OTP ───────────────────────────────────────────────────
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp.trim()) {
            showNotification({
                title: "OTP Required",
                message: "Please enter the 6-digit OTP code sent to your email.",
                type: "warning"
            });
            return;
        }

        setLoading(true);
        try {
            const res = await OtpVerifyService({ email: email.trim(), otp: otp.trim() });
            if (res?.resetToken) {
                setResetToken(res.resetToken);
                showNotification({
                    title: "OTP Verified",
                    message: "Verification successful. Please set your new password.",
                    type: "success"
                });
                setStep("newPassword");
            } else {
                throw new Error(res?.message || "Invalid OTP response");
            }
        } catch (err) {
            console.error("OTP verification failed:", err);
            showNotification({
                title: "Verification Failed",
                message: err?.response?.data?.message || err?.message || "Invalid or expired OTP code",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    // ── Resend OTP helper ────────────────────────────────────────────────────
    const handleResendOtp = async () => {
        setResending(true);
        try {
            const res = await ForgotPasswordService({ email: email.trim() });
            showNotification({
                title: "OTP Resent",
                message: res?.message || `A new code has been sent to ${email}`,
                type: "success"
            });
        } catch (err) {
            showNotification({
                title: "Resend Failed",
                message: err?.response?.data?.message || err?.message || "Could not resend OTP",
                type: "error"
            });
        } finally {
            setResending(false);
        }
    };

    // ── STEP 3: Reset Password ───────────────────────────────────────────────
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword) {
            showNotification({
                title: "Password Required",
                message: "Please enter a new password.",
                type: "warning"
            });
            return;
        }

        if (newPassword.length < 6) {
            showNotification({
                title: "Password Too Short",
                message: "Password must be at least 6 characters long.",
                type: "warning"
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotification({
                title: "Passwords Do Not Match",
                message: "New password and confirm password fields must match.",
                type: "warning"
            });
            return;
        }

        setLoading(true);
        try {
            const res = await ResetPasswordService({
                resetToken,
                password: newPassword
            });

            showNotification({
                title: "Password Reset Successful",
                message: res?.message || "Your account password has been updated successfully.",
                type: "success"
            });

            setStep("success");
        } catch (err) {
            console.error("Reset password failed:", err);
            showNotification({
                title: "Password Reset Failed",
                message: err?.response?.data?.message || err?.message || "Failed to reset password.",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    // Reset workflow to initial state
    const handleResetWorkflow = () => {
        setStep("email");
        setOtp("");
        setResetToken("");
        setNewPassword("");
        setConfirmPassword("");
    };

    return (
        <div className="space-y-6 account-fade-in">
            <Card
                title={
                    <span className="flex items-center gap-2 text-lg font-bold text-slate-900">
                        <Lock className="w-5 h-5 text-indigo-600" />
                        Change Account Password
                    </span>
                }
                subtitle="Update your credentials securely via OTP email verification."
                action={
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        HIPAA Encrypted
                    </span>
                }
            >

                {/* ── STEP 1: EMAIL CONFIRMATION & SEND OTP ─────────────────────── */}
                {step === "email" && (
                    <form onSubmit={handleSendOtp} className="space-y-4 max-w-lg mt-4 animate-in fade-in">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Account Email Address
                            </label>
                            <InputField
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="doctor@clinic.com"
                                icon={Mail}
                                iconPosition="left"
                                className="w-full rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                            />
                            <p className="text-[11px] text-slate-500 mt-1">
                                An OTP verification code will be sent to this email address to authorize password change.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            background="bg-indigo-600"
                            border="border-none"
                            padding="px-5 py-2.5"
                            className="rounded-xl hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer w-auto"
                        >
                            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                            Change Password
                        </Button>
                    </form>
                )}

                {/* ── STEP 2: ENTER OTP CODE ────────────────────────────────────── */}
                {step === "otp" && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-lg mt-4 animate-in fade-in">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleResetWorkflow}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" /> Back to Email
                            </button>
                            <span className="text-xs text-slate-500 font-medium">Step 2 of 3</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
                            <p className="font-semibold">Verification Code Sent</p>
                            <p className="text-[11px] text-indigo-700 mt-0.5">
                                Please check your inbox for <strong>{email}</strong> and enter the 6-digit OTP below.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Enter 6-Digit OTP Code
                            </label>
                            <InputField
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                                icon={KeyRound}
                                iconPosition="left"
                                className="w-full rounded-xl text-sm font-bold tracking-widest text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                type="submit"
                                disabled={loading}
                                background="bg-indigo-600"
                                border="border-none"
                                padding="px-5 py-2.5"
                                className="rounded-xl hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer w-auto"
                            >
                                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Verify OTP
                            </Button>

                            <button
                                type="button"
                                disabled={resending}
                                onClick={handleResendOtp}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {resending ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                Resend OTP
                            </button>
                        </div>
                    </form>
                )}

                {/* ── STEP 3: ENTER NEW PASSWORD ───────────────────────────────── */}
                {step === "newPassword" && (
                    <form onSubmit={handleResetPassword} className="space-y-4 max-w-lg mt-4 animate-in fade-in">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Identity Verified
                            </span>
                            <span className="text-xs text-slate-500 font-medium">Step 3 of 3</span>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                            <div className="relative">
                                <InputField
                                    type={showPass.new ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    icon={Lock}
                                    iconPosition="left"
                                    className="w-full rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-colors pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer z-10"
                                >
                                    {showPass.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                            <div className="relative">
                                <InputField
                                    type={showPass.confirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                    icon={CheckCircle2}
                                    iconPosition="left"
                                    className="w-full rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-colors pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer z-10"
                                >
                                    {showPass.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            background="bg-indigo-600"
                            border="border-none"
                            padding="px-5 py-2.5"
                            className="rounded-xl hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer w-auto"
                        >
                            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            Reset Password
                        </Button>
                    </form>
                )}

                {/* ── STEP 4: SUCCESS CONFIRMATION ────────────────────────────── */}
                {step === "success" && (
                    <div className="space-y-4 max-w-lg mt-4 animate-in fade-in p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-extrabold text-slate-900">Password Reset Complete</h4>
                                <p className="text-xs text-slate-600 mt-0.5">Your account password has been updated successfully.</p>
                            </div>
                        </div>

                        <Button
                            type="button"
                            onClick={handleResetWorkflow}
                            background="bg-slate-900"
                            border="border-none"
                            padding="px-4 py-2"
                            className="rounded-xl hover:bg-slate-800 text-white text-xs font-bold cursor-pointer w-auto mt-2"
                        >
                            Done
                        </Button>
                    </div>
                )}
            </Card>

            {/* Active Sessions List */}
            <Card
                title={
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <Shield className="w-4 h-4 text-emerald-600" /> Active Security Sessions
                    </span>
                }
            >
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900">Current Web Session (Windows Chrome)</p>
                            <p className="text-[11px] text-slate-500">IP: 192.168.1.45 • Active Now</p>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Current Device
                    </span>
                </div>
            </Card>
        </div>
    );
}
