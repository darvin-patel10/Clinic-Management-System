import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pill, ArrowLeft, CheckCircle2 } from "lucide-react";
import PageWrapper from "../../component/PageWrapper";
import Card from "../../component/Deshbord/Card";
import Button from "../../component/Button";
import InputField from "../../component/InputField";
import { useNotification } from "../../hooks/showNotification";
import { AddMedicineService } from "../../service/api/medicineServices";

const DEFAULT_CATEGORIES = ["Antibiotic", "Analgesic", "Antihistamine", "Antidiabetic", "Antacid", "Syrup"];

export default function AddMedicine({
    categories = DEFAULT_CATEGORIES,
}) {
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [formData, setFormData] = useState({
        medicineName: "",
        quantity: "",
        unitPrice: "",
    });

    const [errors, setErrors] = useState({
        medicineName: "",
        quantity: "",
        unitPrice: "",
    });

    useEffect(() => {
        if (editingMedicine) {
            setFormData({ ...editingMedicine });
        } else {
            setFormData({
                medicineName: "",
                quantity: "",
                unitPrice: "",
            });
        }
        setErrors({
            medicineName: "",
            quantity: "",
            unitPrice: "",
        });
    }, [editingMedicine, categories]);

    const handleCancel = () => {
        navigate("/allmadicin");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {
            medicineName: "",
            quantity: "",
            unitPrice: "",
        };
        let isValid = true;

        if (formData.medicineName.length < 4) {
            newErrors.medicineName = "Medicine Name must be greater than 3 characters";
            isValid = false;
        }
        if (!formData.medicineName.trim()) {
            newErrors.medicineName = "Medicine Name is required";
            isValid = false;
        }

        if (formData.medicineName.length > 50) {
            newErrors.medicineName = "Medicine Name must be less than 50 characters";
            isValid = false;
        }

        if (formData.unitPrice === "" || isNaN(formData.unitPrice) || Number(formData.unitPrice) <= 0) {
            newErrors.unitPrice = "Enter a valid unit price";
            isValid = false;
        }

        if (formData.quantity === "" || isNaN(formData.quantity) || Number(formData.quantity) < 0) {
            newErrors.quantity = "Enter a valid quantity";
            isValid = false;
        }

        if (!isValid) {
            setErrors(newErrors);
            return;
        }

        const payload = {
            medicineName: formData.medicineName.trim(),
            quantity: Number(formData.quantity),
            unitPrice: Number(formData.unitPrice),
        };

        try {
            const respons = await AddMedicineService(payload);
            showNotification({
                title: "Success",
                message: respons.message || "Medicine created successfully",
                type: "success",
            });
            navigate("/allmadicin");
        } catch (error) {
            console.error("Failed to save medicine details:", error);
            showNotification({
                title: "Error",
                message: error.message || "Failed to save medicine details.",
                type: "error",
            });
        }
    };

    return (
        <PageWrapper
            onBack={() => navigate("/allmadicin")}

        >
            <div className="max-w-2xl mx-auto py-2">
                <Card title={editingMedicine ? "Edit Medicine" : "Add New Medicine"}>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2" noValidate>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Medicine Name *
                            </label>
                            <InputField
                                type="text"
                                required
                                border={errors.medicineName ? "border border-red-500" : "border border-slate-200"}
                                value={formData.medicineName}
                                onChange={(e) => {
                                    setFormData({ ...formData, medicineName: e.target.value });
                                    if (errors.medicineName) setErrors((prev) => ({ ...prev, medicineName: "" }));
                                }}
                                placeholder="e.g. Amoxicillin 500mg"
                            />
                            {errors.medicineName && (
                                <p className="text-red-500 text-[11px] font-medium mt-1 pl-1 animate-fade-in">{errors.medicineName}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Unit Price (₹) *
                                </label>
                                <InputField
                                    type="number"
                                    step="0.1"
                                    required
                                    border={errors.unitPrice ? "border border-red-500" : "border border-slate-200"}
                                    value={formData.unitPrice}
                                    onChange={(e) => {
                                        setFormData({ ...formData, unitPrice: e.target.value });
                                        if (errors.unitPrice) setErrors((prev) => ({ ...prev, unitPrice: "" }));
                                    }}
                                    placeholder="12.5"
                                />
                                {errors.unitPrice && (
                                    <p className="text-red-500 text-[11px] font-medium mt-1 pl-1 animate-fade-in">{errors.unitPrice}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Initial Quantity *
                                </label>
                                <InputField
                                    type="number"
                                    required
                                    border={errors.quantity ? "border border-red-500" : "border border-slate-200"}
                                    value={formData.quantity}
                                    onChange={(e) => {
                                        setFormData({ ...formData, quantity: e.target.value });
                                        if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: "" }));
                                    }}
                                    placeholder="50"
                                />
                                {errors.quantity && (
                                    <p className="text-red-500 text-[11px] font-medium mt-1 pl-1 animate-fade-in">{errors.quantity}</p>
                                )}
                            </div>
                        </div>

                        {/* Form Footer Controls */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                            <Button
                                type="button"
                                onClick={handleCancel}
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
                                <span>{editingMedicine ? "Update Medicine" : "Save Medicine"}</span>
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </PageWrapper>
    );
}
