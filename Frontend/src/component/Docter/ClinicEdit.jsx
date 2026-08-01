import React from "react";
import {
    Building2,
    Coins,
    Phone,
    Clock,
    MapPin,
    Zap,
    Smartphone
} from "lucide-react";
import Card from "../../component/Deshbord/Card.jsx";
import InputField from "../../component/InputField.jsx";

export default function ClinicEdit({ formData = {}, handleChange, isEditing = false }) {
    const disabled = !isEditing;

    return (
        <Card
            title={
                <span className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
                    Clinic Address & OPD Timings
                </span>
            }
            subtitle="Clinic profile, emergency support, consultation fees & practice location."
            action={
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    Prescription Print Header
                </span>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-4 mt-3 sm:mt-4">
                {/* Clinic Name */}
                <div className="sm:col-span-7">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">Clinic / Hospital Name</label>
                    <InputField
                        type="text"
                        name="clinicName"
                        value={formData?.clinicName || ""}
                        onChange={handleChange}
                        placeholder="e.g. Apex Wellness Clinic"
                        disabled={disabled}
                        className="h-10 sm:h-11"
                    />
                </div>

                {/* Consultation Fee */}
                <div className="sm:col-span-5">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">Consultation Fee (₹)</label>
                    <InputField
                        type="number"
                        name="consultationfee"
                        value={formData?.consultationfee || ""}
                        onChange={handleChange}
                        placeholder="500"
                        icon={Coins}
                        iconPosition="left"
                        disabled={disabled}
                        className="w-full rounded-xl text-xs sm:text-sm font-bold text-emerald-700 outline-none focus:border-emerald-500 focus:bg-white transition-colors h-10 sm:h-11"
                    />
                </div>

                {/* Clinic Phone */}
                <div className="sm:col-span-6">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">Clinic Contact Number</label>
                    <InputField
                        type="tel"
                        name="clinicphone"
                        value={formData?.clinicphone || ""}
                        onChange={handleChange}
                        placeholder="9876543210"
                        icon={Phone}
                        iconPosition="left"
                        disabled={disabled}
                        className="h-10 sm:h-11"
                    />
                </div>

                {/* OPD Timings */}
                <div className="sm:col-span-6">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">OPD Practice Timings</label>
                    <InputField
                        type="text"
                        name="clinicTiming"
                        value={formData?.clinicTiming || ""}
                        onChange={handleChange}
                        placeholder="Mon - Sat (09:00 AM - 01:00 PM)"
                        icon={Clock}
                        iconPosition="left"
                        disabled={disabled}
                        className="h-10 sm:h-11"
                    />
                </div>

                {/* Street Address */}
                <div className="sm:col-span-12">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">Street Address & Landmark</label>
                    <InputField
                        type="text"
                        name="address"
                        value={formData?.address || ""}
                        onChange={handleChange}
                        placeholder="Suite 402, Healthcare Plaza, MG Road"
                        icon={MapPin}
                        iconPosition="left"
                        disabled={disabled}
                        className="h-10 sm:h-11"
                    />
                </div>

                {/* City */}
                <div className="sm:col-span-4">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">City</label>
                    <InputField
                        type="text"
                        name="city"
                        value={formData?.city || ""}
                        onChange={handleChange}
                        placeholder="Ahmedabad"
                        disabled={disabled}
                        className="h-10 sm:h-11"
                    />
                </div>

                {/* State */}
                <div className="sm:col-span-4">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">State</label>
                    <InputField
                        type="text"
                        name="state"
                        value={formData?.state || ""}
                        onChange={handleChange}
                        placeholder="Gujarat"
                        disabled={disabled}
                        className="h-10 sm:h-11"
                    />
                </div>

                {/* Pincode */}
                <div className="sm:col-span-4">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">Pincode</label>
                    <InputField
                        type="text"
                        name="pinCode"
                        value={formData?.pinCode || ""}
                        onChange={handleChange}
                        placeholder="380009"
                        disabled={disabled}
                        className="h-10 sm:h-11"
                    />
                </div>

                {/* Practice Feature Toggles */}
                <div className="sm:col-span-12 pt-3.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <label className={`p-3 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer"} ${formData?.emergencyAvailable ? "bg-rose-50/70 border-rose-200" : "bg-slate-50 border-slate-200"}`}>
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${formData?.emergencyAvailable ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">24/7 Emergency Service</p>
                                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight truncate">Highlight emergency availability</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            name="emergencyAvailable"
                            checked={!!formData?.emergencyAvailable}
                            onChange={handleChange}
                            disabled={disabled}
                            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer disabled:cursor-not-allowed shrink-0"
                        />
                    </label>

                    <label className={`p-3 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer"} ${formData?.teleConsultation ? "bg-teal-50/70 border-teal-200" : "bg-slate-50 border-slate-200"}`}>
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${formData?.teleConsultation ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">Tele-Consultation Active</p>
                                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight truncate">Allow remote online follow-ups</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            name="teleConsultation"
                            checked={!!formData?.teleConsultation}
                            onChange={handleChange}
                            disabled={disabled}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer disabled:cursor-not-allowed shrink-0"
                        />
                    </label>
                </div>
            </div>
        </Card>
    );
}
