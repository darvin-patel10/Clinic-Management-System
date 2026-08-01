import React from "react";
import { X, User, Phone, Calendar, MapPin, Edit3 } from "lucide-react";
import InputField from "../InputField";
import Dropdown from "../Dropdown";
import Button from "../Button";

export default function EditProfile({
    editProfilePatient,
    setEditProfilePatient,
    onClose,
    handleSaveProfile,
    profileName,
    setProfileName,
    profilePhone,
    setProfilePhone,
    profileAge,
    setProfileAge,
    profileGender,
    setProfileGender,
    profileRegion,
    setProfileRegion,
    isSubmitting,
}) {
    if (!editProfilePatient) return null;

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else if (setEditProfilePatient) {
            setEditProfilePatient(null);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 z-50 animate-in fade-in duration-200 overflow-y-auto"
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col border border-slate-100 transition-all transform duration-200 my-auto">
                {/* Modal Header */}
                <div className="p-3.5 sm:p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0 gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-2xs">
                            <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate tracking-tight">
                                Edit Patient Profile
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] sm:text-[11px] font-bold">
                                    #{editProfilePatient.uniqueno}
                                </span>
                                <span className="text-slate-400 text-xs">•</span>
                                <span className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                                    {editProfilePatient.patientName}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 active:scale-95 cursor-pointer transition-all shrink-0"
                        aria-label="Close Modal"
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSaveProfile} className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 custom-scrollbar">
                    {/* Patient Name */}
                    <div>
                        <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1.5 tracking-wider">
                            Patient Name <span className="text-rose-500">*</span>
                        </label>
                        <InputField
                            type="text"
                            required
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="e.g. Aarav Sharma"
                            icon={User}
                            className="h-10 sm:h-11"
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1.5 tracking-wider">
                            Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <InputField
                            type="text"
                            required
                            maxLength={10}
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, ""))}
                            placeholder="e.g. 9876543210"
                            icon={Phone}
                            className="h-10 sm:h-11"
                        />
                    </div>

                    {/* Age and Gender (Responsive Grid) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                        <div>
                            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1.5 tracking-wider">
                                Age <span className="text-rose-500">*</span>
                            </label>
                            <InputField
                                type="number"
                                required
                                min="1"
                                max="120"
                                value={profileAge}
                                onChange={(e) => setProfileAge(e.target.value)}
                                placeholder="35"
                                icon={Calendar}
                                className="h-10 sm:h-11"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1.5 tracking-wider">
                                Gender <span className="text-rose-500">*</span>
                            </label>
                            <Dropdown
                                value={profileGender}
                                onChange={(e) => setProfileGender(e.target.value)}
                                options={[
                                    { value: "", label: "Select Gender" },
                                    { value: "Male", label: "Male" },
                                    { value: "Female", label: "Female" },
                                    { value: "Other", label: "Other" },
                                ]}
                                selectClassName="h-10 sm:h-11 w-full"
                            />
                        </div>
                    </div>

                    {/* Region / Address */}
                    <div>
                        <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1.5 tracking-wider">
                            Region / Locality <span className="text-rose-500">*</span>
                        </label>
                        <InputField
                            type="text"
                            required
                            value={profileRegion}
                            onChange={(e) => setProfileRegion(e.target.value)}
                            placeholder="e.g. Andheri East, Mumbai"
                            icon={MapPin}
                            className="h-10 sm:h-11"
                        />
                    </div>

                    {/* Form Footer Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                        <Button
                            type="button"
                            onClick={handleClose}
                            background="bg-slate-100 hover:bg-slate-200 text-slate-700"
                            border="border-none"
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 text-center"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-5 py-2.5 font-bold text-xs rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-none shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
