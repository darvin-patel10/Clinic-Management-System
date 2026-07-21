import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pill, ArrowLeft, CheckCircle2 } from "lucide-react";
import PageWrapper from "../../component/PageWrapper";
import Card from "../../component/Deshbord/Card";
import Button from "../../component/Button";

const DEFAULT_CATEGORIES = ["Antibiotic", "Analgesic", "Antihistamine", "Antidiabetic", "Antacid", "Syrup"];

export default function AddMedicine({
    onSuccess,
    editingMedicine = null,
    categories = DEFAULT_CATEGORIES,
}) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        category: "Antibiotic",
        dosageForm: "Tablet",
        manufacturer: "",
        quantity: "",
        lowStockThreshold: 15,
        unitPrice: "",
        expiryDate: "",
    });

    useEffect(() => {
        if (editingMedicine) {
            setFormData({ ...editingMedicine });
        } else {
            setFormData({
                name: "",
                category: categories[0] || "Antibiotic",
                dosageForm: "Tablet",
                manufacturer: "",
                quantity: "",
                lowStockThreshold: 15,
                unitPrice: "",
                expiryDate: "",
            });
        }
    }, [editingMedicine, categories]);

    const handleCancel = () => {
        navigate("/allmadicin");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSuccess) {
            onSuccess(formData);
        } else {
            // Default behavior for route /addmadicin
            alert(`Medicine "${formData.name}" added successfully!`);
            navigate("/allmadicin");
        }
    };

    return (
        <PageWrapper>
            <div className="max-w-2xl mx-auto py-2">
                <Card title={editingMedicine ? "Edit Medicine" : "Add New Medicine"}>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Medicine Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Amoxicillin 500mg"
                                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Dosage Form
                                </label>
                                <input
                                    type="text"
                                    value={formData.dosageForm}
                                    onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                                    placeholder="Tablet / Syrup"
                                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Manufacturer *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.manufacturer}
                                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                                    placeholder="Company name"
                                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Unit Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={formData.unitPrice}
                                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                    placeholder="12.5"
                                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Initial Quantity *
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    placeholder="50"
                                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Expiry Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.expiryDate}
                                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        {/* Form Footer Controls */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
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
