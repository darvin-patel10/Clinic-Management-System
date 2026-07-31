import React, { useState } from "react";
import {
    Lock,
    KeyRound,
    Eye,
    EyeOff,
    CheckCircle2,
    Shield,
    Globe
} from "lucide-react";
import Loader from "../../component/Loader.jsx";
import Card from "../../component/Deshbord/Card.jsx";
import InputField from "../../component/InputField.jsx";
import Button from "../../component/Button.jsx";

export default function SecurityTab({
    handlePasswordSubmit,
    passwordData: externalPasswordData,
    setPasswordData: externalSetPasswordData,
    showPass: externalShowPass,
    setShowPass: externalSetShowPass,
    passSaving: externalPassSaving
}) {
    const [localPasswordData, setLocalPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [localShowPass, setLocalShowPass] = useState({ current: false, new: false, confirm: false });
    const [localPassSaving, setLocalPassSaving] = useState(false);

    const passwordData = externalPasswordData || localPasswordData;
    const setPasswordData = externalSetPasswordData || setLocalPasswordData;
    const showPass = externalShowPass || localShowPass;
    const setShowPass = externalSetShowPass || setLocalShowPass;
    const passSaving = externalPassSaving !== undefined ? externalPassSaving : localPassSaving;

    const onSubmit = (e) => {
        if (handlePasswordSubmit) {
            handlePasswordSubmit(e);
        } else {
            e.preventDefault();
            setLocalPassSaving(true);
            setTimeout(() => {
                setLocalPassSaving(false);
                setLocalPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            }, 1000);
        }
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
                subtitle="Update your credentials to keep patient medical records secure."
                action={
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        HIPAA Encrypted
                    </span>
                }
            >
                <form onSubmit={onSubmit} className="space-y-4 max-w-lg mt-4">
                    {/* Current Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
                        <div className="relative">
                            <InputField
                                type={showPass.current ? "text" : "password"}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                placeholder="••••••••••••"
                                icon={KeyRound}
                                iconPosition="left"
                                className="w-full rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-colors pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass({ ...showPass, current: !showPass.current })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer z-10"
                            >
                                {showPass.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                        <div className="relative">
                            <InputField
                                type={showPass.new ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
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
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
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
                        disabled={passSaving}
                        background="bg-indigo-600"
                        border="border-none"
                        padding="px-5 py-2.5"
                        className="rounded-xl hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer w-auto"
                    >
                        {passSaving ? <Loader className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                        Update Password
                    </Button>
                </form>
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
