import React from "react";
import { Building2, PhoneCall, Coins, MapPin, Clock } from "lucide-react";
import { ErrorIcon } from "../../assets/Icons/index.js";
import InputField from "../InputField.jsx";

const notEmptyOrSpaces = (msg) => (v) =>
    (v !== null && v !== undefined && String(v).trim().length > 0) || msg;

export default function Step2Clinic({ register, errors }) {
    return (
        <div className="mi-fade-in space-y-4">
            {/* Clinic / Practice Name */}
            <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Clinic / Hospital Name <span className="text-red-500">*</span>
                </label>
                <InputField
                    type="text"
                    placeholder="e.g. Clinic & Healthcare Center Name"
                    icon={Building2}
                    padding="px-4 h-11"
                    background="bg-white"
                    border={errors?.clinicName ? "border border-red-500" : "border border-slate-200"}
                    className="w-full rounded-xl text-sm font-medium text-slate-900 outline-none hover:border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15"
                    {...register("clinicName", {
                        required: "Clinic name is required.",
                        validate: notEmptyOrSpaces("Clinic name cannot be empty or spaces only.")
                    })}
                />
                {errors?.clinicName && (
                    <p className="flex items-center gap-1 mt-1 text-xs text-red-600 font-medium">
                        <ErrorIcon className="w-3.5 h-3.5 text-red-500" /> {errors.clinicName.message}
                    </p>
                )}
            </div>

            {/* Phone & Consultation Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Clinic Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <InputField
                        type="text"
                        placeholder="e.g. 9876543210"
                        maxLength={10}
                        icon={PhoneCall}
                        padding="px-4 h-11"
                        background="bg-white"
                        border={errors?.clinicPhone ? "border border-red-500" : "border border-slate-200"}
                        className="w-full rounded-xl text-sm font-medium text-slate-900 outline-none hover:border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15"
                        {...register("clinicPhone", {
                            required: "Clinic phone is required.",
                            pattern: {
                                value: /^[0-9]{10}$/,
                                message: "Clinic phone number must be exactly 10 digits."
                            },
                            validate: notEmptyOrSpaces("Clinic phone cannot be empty or spaces only.")
                        })}
                    />
                    {errors?.clinicPhone && (
                        <p className="flex items-center gap-1 mt-1 text-xs text-red-600 font-medium">
                            <ErrorIcon className="w-3.5 h-3.5 text-red-500" /> {errors.clinicPhone.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Consultation Fee (₹) <span className="text-red-500">*</span>
                    </label>
                    <InputField
                        type="number"
                        placeholder="e.g. 500"
                        icon={Coins}
                        padding="px-4 h-11"
                        background="bg-white"
                        border={errors?.consultationFee ? "border border-red-500" : "border border-slate-200"}
                        className="w-full rounded-xl text-sm font-semibold text-slate-900 outline-none hover:border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15"
                        {...register("consultationFee", {
                            required: "Consultation fee is required.",
                            validate: notEmptyOrSpaces("Consultation fee cannot be empty or spaces only.")
                        })}
                    />
                    {errors?.consultationFee && (
                        <p className="flex items-center gap-1 mt-1 text-xs text-red-600 font-medium">
                            <ErrorIcon className="w-3.5 h-3.5 text-red-500" /> {errors.consultationFee.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Clinic Address */}
            <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Clinic Address <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-start">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <textarea
                        rows={2}
                        placeholder="e.g. 102 Healthcare Hub, Station Road"
                        className={`w-full p-2.5 pl-10 rounded-xl border text-sm font-medium text-slate-900 outline-none hover:border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15 ${errors?.clinicAddress ? "border-red-500" : "border-slate-200"}`}
                        {...register("clinicAddress", {
                            required: "Clinic address is required.",
                            validate: notEmptyOrSpaces("Clinic address cannot be empty or spaces only.")
                        })}
                    />
                </div>
                {errors?.clinicAddress && (
                    <p className="flex items-center gap-1 mt-1 text-xs text-red-600 font-medium">
                        <ErrorIcon className="w-3.5 h-3.5 text-red-500" /> {errors.clinicAddress.message}
                    </p>
                )}
            </div>

            {/* City, State & PIN Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                        City <span className="text-red-500">*</span>
                    </label>
                    <InputField
                        type="text"
                        placeholder="e.g. Ahmedabad"
                        padding="px-3.5 h-11"
                        background="bg-white"
                        border={errors?.city ? "border border-red-500" : "border border-slate-200"}
                        className="w-full rounded-xl text-sm font-medium text-slate-900 outline-none hover:border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15"
                        {...register("city", {
                            required: "City is required.",
                            validate: notEmptyOrSpaces("City cannot be empty or spaces only.")
                        })}
                    />
                    {errors?.city && (
                        <p className="flex items-center gap-1 mt-1 text-xs text-red-600 font-medium">
                            <ErrorIcon className="w-3.5 h-3.5 text-red-500" /> {errors.city.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                        State <span className="text-red-500">*</span>
                    </label>
                    <InputField
                        type="text"
                        placeholder="e.g. Gujarat"
                        padding="px-3.5 h-11"
                        background="bg-white"
                        border={errors?.state ? "border border-red-500" : "border border-slate-200"}
                        className="w-full rounded-xl text-sm font-medium text-slate-900 outline-none hover:border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15"
                        {...register("state", {
                            required: "State is required.",
                            validate: notEmptyOrSpaces("State cannot be empty or spaces only.")
                        })}
                    />
                    {errors?.state && (
                        <p className="flex items-center gap-1 mt-1 text-xs text-red-600 font-medium">
                            <ErrorIcon className="w-3.5 h-3.5 text-red-500" /> {errors.state.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                        PIN Code <span className="text-red-500">*</span>
                    </label>
                    <InputField
                        type="text"
                        placeholder="e.g. 380001"
                        padding="px-3.5 h-11"
                        background="bg-white"
                        border={errors?.pinCode ? "border border-red-500" : "border border-slate-200"}
                        className="w-full rounded-xl text-sm font-medium text-slate-900 outline-none hover:border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15"
                        {...register("pinCode", {
                            required: "PIN code is required.",
                            validate: notEmptyOrSpaces("PIN code cannot be empty or spaces only.")
                        })}
                    />
                    {errors?.pinCode && (
                        <p className="flex items-center gap-1 mt-1 text-xs text-red-600 font-medium">
                            <ErrorIcon className="w-3.5 h-3.5 text-red-500" /> {errors.pinCode.message}
                        </p>
                    )}
                </div>
            </div>

            {/* OPD Timings */}
            <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    OPD & Consultation Hours <span className="text-red-500">*</span>
                </label>
                <InputField
                    type="text"
                    placeholder="e.g. Mon-Sat: 09:00 AM - 01:00 PM | 05:00 PM - 09:00 PM"
                    icon={Clock}
                    padding="px-4 h-11"
                    background="bg-white"
                    border={errors?.opdTiming ? "border border-red-500" : "border border-slate-200"}
                    className="w-full rounded-xl text-sm font-medium text-slate-900 outline-none hover:border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15"
                    {...register("opdTiming", {
                        required: "OPD hours are required.",
                        validate: notEmptyOrSpaces("OPD hours cannot be empty or spaces only.")
                    })}
                />
                {errors?.opdTiming && (
                    <p className="flex items-center gap-1 mt-1 text-xs text-red-600 font-medium">
                        <ErrorIcon className="w-3.5 h-3.5 text-red-500" /> {errors.opdTiming.message}
                    </p>
                )}
            </div>
        </div>
    );
}
