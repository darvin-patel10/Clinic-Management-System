import React from "react";
import { Award, Mail, User, BadgeCheck } from "lucide-react";
import Card from "../Deshbord/Card.jsx";
import InputField from "../InputField.jsx";
import Dropdown from "../Dropdown.jsx";

export const SPECIALIZATIONS = [
    "General Physician / Internal Medicine",
    "Cardiology",
    "Pediatrics & Child Care",
    "Orthopedics",
    "Dermatology & Cosmetology",
    "ENT (Ear, Nose, Throat)",
    "Gynecology & Obstetrics",
    "Neurology",
    "Ophthalmology (Eye Care)",
    "Psychiatry & Behavioral Health",
    "Dental Surgery (BDS/MDS)",
    "Ayurvedic Medicine (BAMS)",
    "Homeopathy (BHMS)",
    "General Surgery"
];

export const MEDICAL_COUNCILS = [
    "National Medical Commission (NMC)",
    "Medical Council of India (MCI)",
    "Maharashtra Medical Council",
    "Gujarat Medical Council",
    "Delhi Medical Council",
    "Karnataka Medical Council",
    "Tamil Nadu Medical Council",
    "Uttar Pradesh Medical Council",
    "West Bengal Medical Council",
    "Other State Medical Council"
];

export default function DoctorProfileTab({ formData, handleChange, isEditing = false }) {
    const disabled = !isEditing;

    return (
        <Card
            title={
                <span className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 shrink-0" />
                    Doctor Qualifications & Medical License
                </span>
            }
            subtitle="These credentials appear on medical prescriptions and verified doctor stamps."
            action={
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    NMC Compliant
                </span>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-4 mt-3 sm:mt-4">
                {/* Doctor Title */}
                <div className="sm:col-span-3">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">Title</label>
                    <Dropdown
                        value={formData.doctorTitle}
                        onChange={(e) => handleChange({ target: { name: "doctorTitle", value: e.target.value } })}
                        options={["Dr.", "Prof. Dr.", "Surgeon Dr."]}
                        disabled={disabled}
                    />
                </div>

                {/* Full Doctor Name */}
                <div className="sm:col-span-9">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">Full Name</label>
                    <InputField
                        type="text"
                        name="doctorName"
                        value={formData.doctorName}
                        onChange={handleChange}
                        placeholder="e.g. Rajesh Kumar"
                        disabled={disabled}
                        className="h-10 sm:h-11"
                    />
                </div>

                {/* Primary Email (Permanently disabled / Locked) */}
                <div className="sm:col-span-6">
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">Primary Email</label>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">(Locked)</span>
                    </div>
                    <InputField
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        icon={Mail}
                        iconPosition="left"
                        disabled={true}
                        readOnly={true}
                        className="h-10 sm:h-11 bg-slate-100/80 cursor-not-allowed select-none text-slate-500 font-medium"
                    />
                </div>

                {/* Medical Qualifications */}
                <div className="sm:col-span-6">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">Qualifications & Degrees</label>
                    <InputField
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        placeholder="e.g. MBBS, MD (Internal Medicine)"
                        disabled={disabled}
                        className="h-10 sm:h-11"
                    />
                </div>

                {/* Medical Council Registration No */}
                <div className="sm:col-span-6">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">Medical Council Reg. Number</label>
                    <InputField
                        type="text"
                        name="registrationNo"
                        value={formData.registrationNo}
                        onChange={handleChange}
                        placeholder="e.g. MCI/2022/88741"
                        icon={BadgeCheck}
                        iconPosition="left"
                        disabled={disabled}
                        className="w-full rounded-xl text-xs sm:text-sm font-bold text-slate-900 font-mono outline-none focus:border-teal-500 focus:bg-white transition-colors h-10 sm:h-11"
                    />
                </div>

                {/* Specialty */}
                <div className="sm:col-span-6">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">Medical Specialty</label>
                    <Dropdown
                        value={formData.specialty}
                        onChange={(e) => handleChange({ target: { name: "specialty", value: e.target.value } })}
                        options={SPECIALIZATIONS}
                        disabled={disabled}
                    />
                </div>

                {/* Medical Council Name */}
                <div className="sm:col-span-6">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">Medical Council Body</label>
                    <Dropdown
                        value={formData.medicalcouncil}
                        onChange={(e) => handleChange({ target: { name: "medicalcouncil", value: e.target.value } })}
                        options={MEDICAL_COUNCILS}
                        disabled={disabled}
                    />
                </div>

                {/* Experience Years */}
                <div className="sm:col-span-6">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">Clinical Experience</label>
                    <InputField
                        type="text"
                        name="experienceYears"
                        value={formData.experienceYears}
                        onChange={handleChange}
                        placeholder="e.g. 8 Years"
                        disabled={disabled}
                        className="h-10 sm:h-11"
                    />
                </div>
            </div>
        </Card>
    );
}
