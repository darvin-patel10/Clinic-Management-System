import React from "react";
import { X, User, Phone, Calendar, MapPin } from "lucide-react";
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">Edit Patient Profile</h3>
                        <p className="text-[10px] text-slate-500 font-semibold">Unique ID: #{editProfilePatient.uniqueno}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <form onSubmit={handleSaveProfile} className="p-5 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 tracking-wider">Patient Name *</label>
                        <InputField
                            type="text"
                            required
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="e.g. Aarav Sharma"
                            icon={User}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 tracking-wider">Phone Number *</label>
                        <InputField
                            type="text"
                            required
                            maxLength={10}
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, ""))}
                            placeholder="e.g. 9876543210"
                            icon={Phone}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 tracking-wider">Age *</label>
                            <InputField
                                type="number"
                                required
                                min="1"
                                max="120"
                                value={profileAge}
                                onChange={(e) => setProfileAge(e.target.value)}
                                placeholder="35"
                                icon={Calendar}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 tracking-wider">Gender *</label>
                            <Dropdown
                                value={profileGender}
                                onChange={(e) => setProfileGender(e.target.value)}
                                options={[
                                    { value: "", label: "Select" },
                                    { value: "Male", label: "Male" },
                                    { value: "Female", label: "Female" },
                                    { value: "Other", label: "Other" },
                                ]}
                                selectClassName="h-10 w-full"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 tracking-wider">Region / Address *</label>
                        <InputField
                            type="text"
                            required
                            value={profileRegion}
                            onChange={(e) => setProfileRegion(e.target.value)}
                            placeholder="e.g. Andheri East, Mumbai"
                            icon={MapPin}
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                        <Button
                            type="button"
                            onClick={handleClose}
                            background="bg-slate-100! text-slate-500!"
                            border="border-none!"
                            className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 font-bold text-xs rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-none shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
