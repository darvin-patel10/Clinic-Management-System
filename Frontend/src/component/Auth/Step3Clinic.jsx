import React from "react";
import { HeartPulse, CalendarDays } from "lucide-react";
import { ErrorIcon } from "../../assets/Icons/index.js";
import InputField from "../InputField.jsx";

export default function Step3Clinic({ register, errors }) {
    return (
        <div className="mi-fade-in space-y-4">
            {/* Practice Toggles */}
            <div className="space-y-3 pt-1">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all">
                    <div className="flex items-center gap-3">
                        <HeartPulse className="w-5 h-5 text-red-500 shrink-0" />
                        <div>
                            <span className="text-xs font-bold text-slate-800 block">
                                24/7 Emergency Care Availability
                            </span>
                            <span className="text-[11px] text-slate-500">
                                Display emergency service badge on clinic profile
                            </span>
                        </div>
                    </div>
                    <InputField
                        type="checkbox"
                        padding=""
                        background=""
                        border=""
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        {...register("emergencyAvailable")}
                    />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all">
                    <div className="flex items-center gap-3">
                        <CalendarDays className="w-5 h-5 text-teal-600 shrink-0" />
                        <div>
                            <span className="text-xs font-bold text-slate-800 block">
                                Tele-Consultation / Online Appointments
                            </span>
                            <span className="text-[11px] text-slate-500">
                                Allow patients to schedule digital video consultations
                            </span>
                        </div>
                    </div>
                    <InputField
                        type="checkbox"
                        padding=""
                        background=""
                        border=""
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        {...register("teleConsultation")}
                    />
                </label>
            </div>

            {/* Declaration & Certification Checkbox */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
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
                <label htmlFor="agreedCertify" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
                    I hereby certify that I am a registered medical practitioner and the registration details provided above are true and accurate.
                </label>
            </div>
            {errors?.agreedCertify && (
                <p className="flex items-center gap-1 text-xs text-red-600 font-medium">
                    <ErrorIcon className="w-3.5 h-3.5 text-red-500" /> {errors.agreedCertify.message}
                </p>
            )}
        </div>
    );
}
