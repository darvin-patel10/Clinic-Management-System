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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="font-extrabold text-slate-900 tracking-tight text-base">Edit Medicine Details</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Update pricing or stock inventory information.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Medicine Name *
                        </label>
                        <InputField
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Amoxicillin 500mg"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Unit Price (₹) *
                            </label>
                            <InputField
                                type="number"
                                step="0.1"
                                required
                                value={formData.unitPrice}
                                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                placeholder="12.5"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Quantity *
                            </label>
                            <InputField
                                type="number"
                                required
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="50"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 mt-2">
                        <Button
                            type="button"
                            onClick={onClose}
                            background="bg-slate-100!"
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-black/50!"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="px-5 py-2.5 font-semibold text-xs rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-none shadow-sm w-auto flex items-center gap-1.5"
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
