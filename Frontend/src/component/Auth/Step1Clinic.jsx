import React from "react";
import { Controller } from "react-hook-form";
import { UserCheck, Stethoscope, Award, FileText } from "lucide-react";
import { ErrorIcon } from "../../assets/Icons/index.js";
import InputField from "../InputField.jsx";
import Dropdown from "../Dropdown.jsx";

const TITLE_OPTIONS = [
    { label: "Select Title", value: "" },
    { label: "Dr.", value: "Dr." },
    { label: "Prof. Dr.", value: "Prof. Dr." },
    { label: "Vd. (Ayush)", value: "Vd." }
];

const SPECIALIZATIONS = [
    { label: "Select Specialization", value: "" },
    { label: "General Physician / Internal Medicine", value: "General Physician / Internal Medicine" },
    { label: "Cardiology", value: "Cardiology" },
    { label: "Pediatrics & Child Care", value: "Pediatrics & Child Care" },
    { label: "Orthopedics", value: "Orthopedics" },
    { label: "Dermatology & Cosmetology", value: "Dermatology & Cosmetology" },
    { label: "ENT (Ear, Nose, Throat)", value: "ENT (Ear, Nose, Throat)" },
    { label: "Gynecology & Obstetrics", value: "Gynecology & Obstetrics" },
    { label: "Neurology", value: "Neurology" },
    { label: "Ophthalmology (Eye Care)", value: "Ophthalmology (Eye Care)" },
    { label: "Psychiatry & Behavioral Health", value: "Psychiatry & Behavioral Health" },
    { label: "Dental Surgery (BDS/MDS)", value: "Dental Surgery (BDS/MDS)" },
    { label: "Ayurvedic Medicine (BAMS)", value: "Ayurvedic Medicine (BAMS)" },
    { label: "Homeopathy (BHMS)", value: "Homeopathy (BHMS)" },
    { label: "General Surgery", value: "General Surgery" }
];

const MEDICAL_COUNCILS = [
    { label: "Select Medical Council", value: "" },
    { label: "National Medical Commission (NMC)", value: "National Medical Commission (NMC)" },
    { label: "Medical Council of India (MCI)", value: "Medical Council of India (MCI)" },
    { label: "Maharashtra Medical Council", value: "Maharashtra Medical Council" },
    { label: "Gujarat Medical Council", value: "Gujarat Medical Council" },
    { label: "Delhi Medical Council", value: "Delhi Medical Council" },
    { label: "Karnataka Medical Council", value: "Karnataka Medical Council" },
    { label: "Tamil Nadu Medical Council", value: "Tamil Nadu Medical Council" },
    { label: "Uttar Pradesh Medical Council", value: "Uttar Pradesh Medical Council" },
    { label: "West Bengal Medical Council", value: "West Bengal Medical Council" },
    { label: "Other State Medical Council", value: "Other State Medical Council" }
];

const notEmptyOrSpaces = (msg) => (v) =>
    (v !== null && v !== undefined && String(v).trim().length > 0) || msg;

/* ── Shared label style ───────────────────────────── */
const labelCls = "text-[11px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1 sm:mb-1.5";

/* ── Shared error row ─────────────────────────────── */
function FieldError({ error }) {
    if (!error) return null;
    return (
        <p className="flex items-center gap-1 mt-1 text-[11px] sm:text-xs text-red-600 font-medium">
            <ErrorIcon className="w-3.5 h-3.5 text-red-500 shrink-0" /> {error.message}
        </p>
    );
}

export default function Step1Clinic({ register, errors, control, setValue }) {
    React.useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername && setValue) {
            setValue("doctorName", storedUsername);
        }
    }, [setValue]);

    return (
        <div className="mi-fade-in space-y-3.5 sm:space-y-4">

            {/* ── Doctor Title & Full Name ─────────────────── */}
            <div className="grid grid-cols-[5rem_1fr] sm:grid-cols-4 gap-2 sm:gap-3">
                {/* Title */}
                <div className="sm:col-span-1">
                    <label className={labelCls}>
                        Title <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="doctorTitle"
                        control={control}
                        rules={{
                            required: "Title is required.",
                            validate: notEmptyOrSpaces("Title is required.")
                        }}
                        render={({ field }) => (
                            <Dropdown
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                options={TITLE_OPTIONS}
                                selectClassName={`h-10 sm:h-11 px-2 sm:px-3 w-full text-xs sm:text-sm font-semibold
                                    focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15
                                    ${errors?.doctorTitle ? "border-red-500" : ""}`}
                            />
                        )}
                    />
                    <FieldError error={errors?.doctorTitle} />
                </div>

                {/* Full Name */}
                <div className="sm:col-span-3">
                    <label className={labelCls}>
                        Full Doctor Name <span className="text-red-500">*</span>
                    </label>
                    <InputField
                        type="text"
                        placeholder="e.g. Arvin joshi"
                        icon={UserCheck}
                        padding="px-4 h-10 sm:h-11"
                        background="bg-slate-100/80"
                        border="border border-slate-200"
                        readOnly
                        disabled
                        className="w-full rounded-xl text-xs sm:text-sm font-semibold text-slate-700
                                   outline-none cursor-not-allowed select-none bg-slate-100/80"
                        {...register("doctorName", {
                            required: "Doctor name is required.",
                            validate: notEmptyOrSpaces("Doctor name cannot be empty or spaces only.")
                        })}
                    />
                    <FieldError error={errors?.doctorName} />
                </div>
            </div>

            {/* ── Primary Specialization ───────────────────── */}
            <div>
                <label className={labelCls}>
                    Primary Specialization <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="specialty"
                    control={control}
                    rules={{
                        required: "Specialization is required.",
                        validate: notEmptyOrSpaces("Specialization is required.")
                    }}
                    render={({ field }) => (
                        <Dropdown
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            options={SPECIALIZATIONS}
                            icon={Stethoscope}
                            selectClassName={`h-10 sm:h-11 px-3 sm:px-4 w-full text-xs sm:text-sm font-medium
                                focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15
                                ${errors?.specialty ? "border-red-500" : ""}`}
                        />
                    )}
                />
                <FieldError error={errors?.specialty} />
            </div>

            {/* ── Medical Degrees & Qualifications ─────────── */}
            <div>
                <label className={labelCls}>
                    Medical Degrees &amp; Qualifications <span className="text-red-500">*</span>
                </label>
                <InputField
                    type="text"
                    placeholder="e.g. MBBS, MD (Internal Medicine), DNB"
                    icon={Award}
                    padding="px-4 h-10 sm:h-11"
                    background="bg-white"
                    border={errors?.qualification ? "border border-red-500" : "border border-slate-200"}
                    className="w-full rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none
                               hover:border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15"
                    {...register("qualification", {
                        required: "Medical qualification is required.",
                        validate: notEmptyOrSpaces("Medical qualification cannot be empty or spaces only.")
                    })}
                />
                <FieldError error={errors?.qualification} />
            </div>

            {/* ── Reg No. & Years of Experience ────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {/* Registration No. */}
                <div>
                    <label className={labelCls}>
                        Medical License / Reg No. <span className="text-red-500">*</span>
                    </label>
                    <InputField
                        type="text"
                        placeholder="e.g. MCI-2023-89412"
                        icon={FileText}
                        padding="px-4 h-10 sm:h-11"
                        background="bg-white"
                        border={errors?.registrationNo ? "border border-red-500" : "border border-slate-200"}
                        className="w-full rounded-xl text-xs sm:text-sm font-mono font-medium text-slate-900
                                   outline-none hover:border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15"
                        {...register("registrationNo", {
                            required: "Registration number is required.",
                            validate: notEmptyOrSpaces("Registration number cannot be empty or spaces only.")
                        })}
                    />
                    <FieldError error={errors?.registrationNo} />
                </div>

                {/* Years of Experience */}
                <div>
                    <label className={labelCls}>
                        Years of Experience <span className="text-red-500">*</span>
                    </label>
                    <InputField
                        type="number"
                        min="0"
                        max="60"
                        placeholder="e.g. 8"
                        padding="px-4 h-10 sm:h-11"
                        background="bg-white"
                        border={errors?.experienceYears ? "border border-red-500" : "border border-slate-200"}
                        className="w-full rounded-xl text-xs sm:text-sm font-medium text-slate-900
                                   outline-none hover:border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15"
                        {...register("experienceYears", {
                            required: "Years of experience is required.",
                            validate: notEmptyOrSpaces("Years of experience cannot be empty or spaces only.")
                        })}
                    />
                    <FieldError error={errors?.experienceYears} />
                </div>
            </div>

            {/* ── Registering Medical Council ───────────────── */}
            <div>
                <label className={labelCls}>
                    Registering Medical Council <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="medicalCouncil"
                    control={control}
                    rules={{
                        required: "Medical council is required.",
                        validate: notEmptyOrSpaces("Medical council is required.")
                    }}
                    render={({ field }) => (
                        <Dropdown
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            options={MEDICAL_COUNCILS}
                            selectClassName={`h-10 sm:h-11 px-3 sm:px-4 w-full text-xs sm:text-sm font-medium
                                focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15
                                ${errors?.medicalCouncil ? "border-red-500" : ""}`}
                        />
                    )}
                />
                <FieldError error={errors?.medicalCouncil} />
            </div>
        </div>
    );
}
