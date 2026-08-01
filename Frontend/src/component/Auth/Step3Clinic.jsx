import React from "react";
import { HeartPulse, CalendarDays } from "lucide-react";
import { ErrorIcon } from "../../assets/Icons/index.js";
import InputField from "../InputField.jsx";

/* ── Toggle row ───────────────────────────────────── */
function ToggleRow({ icon: Icon, iconColor, title, desc, registration }) {
    return (
        <label className="flex items-center justify-between
                          p-3 sm:p-3.5 rounded-xl border border-slate-200
                          bg-slate-50/50 hover:bg-slate-50 cursor-pointer
                          transition-all gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor} shrink-0`} />
                <div className="min-w-0">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-800 block leading-snug">
                        {title}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 leading-snug block">
                        {desc}
                    </span>
                </div>
            </div>
            <InputField
                type="checkbox"
                padding=""
                background=""
                border=""
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0"
                {...registration}
            />
        </label>
    );
}

export default function Step3Clinic({ register, errors }) {
    return (
        <div className="mi-fade-in space-y-3.5 sm:space-y-4">

            {/* ── Practice Service Toggles ─────────────────── */}
            <div className="space-y-2.5 sm:space-y-3 pt-1">
                <ToggleRow
                    icon={HeartPulse}
                    iconColor="text-red-500"
                    title="24/7 Emergency Care Availability"
                    desc="Display emergency service badge on clinic profile"
                    registration={register("emergencyAvailable")}
                />
                <ToggleRow
                    icon={CalendarDays}
                    iconColor="text-teal-600"
                    title="Tele-Consultation / Online Appointments"
                    desc="Allow patients to schedule digital video consultations"
                    registration={register("teleConsultation")}
                />
            </div>

            {/* ── Declaration & Certification ──────────────── */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-blue-50/70 border border-blue-100
                            flex items-start gap-2.5 sm:gap-3">
                <InputField
                    id="agreedCertify"
                    type="checkbox"
                    padding=""
                    background=""
                    border=""
                    className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0"
                    {...register("agreedCertify", {
                        required: "You must certify the accuracy of your medical information."
                    })}
                />
                <label
                    htmlFor="agreedCertify"
                    className="text-[11px] sm:text-xs text-slate-700 leading-relaxed cursor-pointer select-none"
                >
                    I hereby certify that I am a registered medical practitioner and the registration details
                    provided above are true and accurate.
                </label>
            </div>

            {errors?.agreedCertify && (
                <p className="flex items-center gap-1 text-[11px] sm:text-xs text-red-600 font-medium">
                    <ErrorIcon className="w-3.5 h-3.5 text-red-500 shrink-0" /> {errors.agreedCertify.message}
                </p>
            )}
        </div>
    );
}
