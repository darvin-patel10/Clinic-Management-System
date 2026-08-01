import React, { useState, useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";
import InputField from "../InputField";
import Button from "../Button";
import { useNotification } from "../../hooks/showNotification";

export default function EditMadition({
    isOpen,
    onClose,
    medicine,
    onSubmit
}) {
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        name: "",
        unitPrice: "",
        quantity: "",
    });

    useEffect(() => {
        if (medicine) {
            setFormData({
                name: medicine.name || "",
                unitPrice: medicine.unitPrice || "",
                quantity: medicine.quantity || "",
            });
        }
    }, [medicine]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...medicine,
            name: formData.name,
            unitPrice: parseFloat(formData.unitPrice),
            quantity: parseInt(formData.quantity, 10),
        });
        showNotification({
            title: "Success",
            message: "Medicine details updated successfully!",
            type: "success",
        });
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-2xl max-w-sm sm:max-w-md md:max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
                {/* Header */}
                <div className="p-3.5 sm:p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0 gap-3">
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">Edit Medicine Details</h3>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">Update pricing or stock inventory information.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 active:scale-95 cursor-pointer transition-all shrink-0"
                        aria-label="Close Modal"
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-5 md:p-6 space-y-4">
                    <div>
                        <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1.5 tracking-wider">
                            Medicine Name <span className="text-rose-500">*</span>
                        </label>
                        <InputField
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Amoxicillin 500mg"
                            className="h-10 sm:h-11"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                        <div>
                            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1.5 tracking-wider">
                                Unit Price (₹) <span className="text-rose-500">*</span>
                            </label>
                            <InputField
                                type="number"
                                step="0.1"
                                required
                                value={formData.unitPrice}
                                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                placeholder="12.5"
                                className="h-10 sm:h-11"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1.5 tracking-wider">
                                Quantity <span className="text-rose-500">*</span>
                            </label>
                            <InputField
                                type="number"
                                required
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="50"
                                className="h-10 sm:h-11"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 mt-2">
                        <Button
                            type="button"
                            onClick={onClose}
                            background="bg-slate-100 hover:bg-slate-200 text-slate-700"
                            border="border-none"
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 text-center cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="w-full sm:w-auto px-5 py-2.5 font-bold text-xs rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-none shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Save Changes</span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
