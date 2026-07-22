import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Pill,
    Plus,
    Search,
    Filter,
    AlertTriangle,
    IndianRupee,
    Edit3,
    Trash2,
    X,
    CheckCircle2,
    PackageX,
    RefreshCw,
} from "lucide-react";
import PageWrapper from "../../component/PageWrapper";
import SectionWrapper from "../../component/SectionWrapper";
import Card from "../../component/Deshbord/Card";
import Button from "../../component/Button";
import KpiCard from "../../component/Deshbord/KpiCard";
import { formatCurrency, formatDate } from "../../utils/formatters";
import EditMadition from "../../component/Madition/EditMadition";
import DeleteAlart from "../../component/DeleteAlart";
import { useNotification } from "../../hooks/showNotification";
import Dropdown from "../../component/Dropdown";
import InputField from "../../component/InputField";
import AddQty from "../../component/Madition/AddQty";
import {
    AllMedicinesService,
    DeleteMedicineService,
    AddQuantityService,
    UpdateMedicineService,
    SearchMedicineService,
} from "../../service/api/medicineServices";

export default function AllMedicines() {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [stockFilter, setStockFilter] = useState("All");

    const { showNotification } = useNotification();

    const fetchMedicines = async () => {
        try {
            const data = await AllMedicinesService();
            if (data && data.medicine) {
                const mapped = data.medicine.map((med) => ({
                    id: med._id,
                    name: med.medicineName,
                    quantity: med.quantity,
                    unitPrice: med.unitPrice,
                    totalPrice: med.totalPrice,
                    category: med.category || "All",
                    dosageForm: med.dosageForm || "Tablet",
                    manufacturer: med.manufacturer || "Generic",
                    lowStockThreshold: med.lowStockThreshold || 10,
                    expiryDate: med.expiryDate || "N/A",
                }));
                setMedicines(mapped);
            }
        } catch (error) {
            console.error("Failed to fetch medicines:", error);
            showNotification({
                title: "Error",
                message: error.message || "Failed to load medicines inventory.",
                type: "error",
            });
        }
    };

    const searchMedicinesFromAPI = async (query) => {
        try {
            const data = await SearchMedicineService(query);
            if (data && data.medicines) {
                const mapped = data.medicines.map((med) => ({
                    id: med._id,
                    name: med.medicineName,
                    quantity: med.quantity,
                    unitPrice: med.unitPrice,
                    totalPrice: med.totalPrice,
                    category: med.category || "All",
                    dosageForm: med.dosageForm || "Tablet",
                    manufacturer: med.manufacturer || "Generic",
                    lowStockThreshold: med.lowStockThreshold || 10,
                    expiryDate: med.expiryDate || "N/A",
                }));
                setMedicines(mapped);
            }
        } catch (error) {
            console.error("Failed to search medicines:", error);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim() === "") {
                fetchMedicines();
            } else {
                searchMedicinesFromAPI(searchQuery);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Modal state for edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);

    // Modal state for delete
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingMedicineId, setDeletingMedicineId] = useState(null);

    // Modal state for add quantity
    const [isAddQtyOpen, setIsAddQtyOpen] = useState(false);
    const [selectedMedicineForQty, setSelectedMedicineForQty] = useState(null);

    // Compute metrics
    const metrics = useMemo(() => {
        const totalItems = medicines.length;
        const lowStockCount = medicines.filter((m) => m.quantity > 0 && m.quantity <= m.lowStockThreshold).length;
        const outOfStockCount = medicines.filter((m) => m.quantity === 0).length;
        const totalValuation = medicines.reduce((sum, m) => sum + m.quantity * m.unitPrice, 0);

        return { totalItems, lowStockCount, outOfStockCount, totalValuation };
    }, [medicines]);

    // Filtered medicines list
    const filteredMedicines = useMemo(() => {
        return medicines.filter((med) => {
            const matchesSearch =
                med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                med.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                med.id.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategory === "All" || med.category === selectedCategory;

            let matchesStock = true;
            if (stockFilter === "low") {
                matchesStock = med.quantity > 0 && med.quantity <= med.lowStockThreshold;
            } else if (stockFilter === "out") {
                matchesStock = med.quantity === 0;
            } else if (stockFilter === "instock") {
                matchesStock = med.quantity > med.lowStockThreshold;
            }

            return matchesSearch && matchesCategory && matchesStock;
        });
    }, [medicines, searchQuery, selectedCategory, stockFilter]);

    // Navigate to Add Medicine page
    const handleOpenAddModal = () => {
        navigate("/addmadicin");
    };

    // Open Modal for Edit
    const handleOpenEditModal = (medicine) => {
        setEditingMedicine(medicine);
        setIsModalOpen(true);
    };

    // Delete medicine
    const handleDelete = (id) => {
        setDeletingMedicineId(id);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingMedicineId) {
            try {
                await DeleteMedicineService(deletingMedicineId);
                showNotification({
                    title: "Deleted",
                    message: "Medicine removed from inventory successfully.",
                    type: "warning"
                });
                fetchMedicines();
            } catch (error) {
                console.error("Failed to delete medicine:", error);
                showNotification({
                    title: "Error",
                    message: error.message || "Failed to delete medicine.",
                    type: "error"
                });
            } finally {
                setDeletingMedicineId(null);
            }
        }
    };

    // Form Submit (Edit)
    const handleModalSubmit = async (submittedData) => {
        if (editingMedicine) {
            try {
                const payload = {
                    medicineName: submittedData.name,
                    quantity: Number(submittedData.quantity),
                    unitPrice: Number(submittedData.unitPrice),
                };
                await UpdateMedicineService(editingMedicine.id, payload);
                fetchMedicines();
            } catch (error) {
                console.error("Failed to update medicine details:", error);
                showNotification({
                    title: "Error",
                    message: error.message || "Failed to update medicine details.",
                    type: "error",
                });
            } finally {
                setIsModalOpen(false);
                setEditingMedicine(null);
            }
        }
    };

    const handleAddQuantitySubmit = async (qty) => {
        if (!selectedMedicineForQty) return;
        try {
            await AddQuantityService(selectedMedicineForQty.id, qty);
            showNotification({
                title: "Stock Added",
                message: `Successfully added ${qty} units to ${selectedMedicineForQty.name}.`,
                type: "success",
            });
            fetchMedicines();
        } catch (error) {
            console.error("Failed to add stock quantity:", error);
            showNotification({
                title: "Error",
                message: error.message || "Failed to add stock quantity.",
                type: "error",
            });
        } finally {
            setIsAddQtyOpen(false);
            setSelectedMedicineForQty(null);
        }
    };

    return (
        <PageWrapper
            title="Medicine Inventory"
            subtitle="Manage clinic drug stock, low-stock alerts, pricing and expiry dates."
            onBack={() => navigate("/dashboard")}
            actions={
                <div className="w-full sm:w-auto">
                    <Button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="w-full sm:w-auto font-semibold text-xs rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-none shadow-sm hover:shadow transition-all duration-150 active:scale-95 flex justify-center"
                        padding="py-2.5 px-3"
                    >
                        <Plus className="w-4 h-4 mr-1.5 shrink-0" />
                        Add New Medicine
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-6">
                {/* ── 1. Key Metrics ────────────────────────────────────────────── */}
                <SectionWrapper className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                        label="Total Medicines Listed"
                        value={metrics.totalItems.toString()}
                        icon={Pill}
                        tone="blue"
                    />
                    <KpiCard
                        label="Low Stock Medicines"
                        value={metrics.lowStockCount.toString()}
                        icon={AlertTriangle}
                        tone="yellow"
                    />
                    <KpiCard
                        label="Out of Stock Items"
                        value={metrics.outOfStockCount.toString()}
                        icon={PackageX}
                        tone="red"
                    />
                    <KpiCard
                        label="Total Inventory Value"
                        value={formatCurrency(metrics.totalValuation)}
                        icon={IndianRupee}
                        tone="green"
                    />
                </SectionWrapper>

                {/* ── 2. Filters & Toolbar ────────────────────────────────────── */}
                <Card>
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
                        {/* Search Input */}
                        <div className="relative flex-1 w-full lg:max-w-md">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <InputField
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by medicine name, manufacturer, ID..."
                                className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Dropdown Filters */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                            <Dropdown
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                options={[
                                    { value: "All", label: "Stock Status: All" },
                                    { value: "instock", label: "In Stock" },
                                    { value: "low", label: "Low Stock" },
                                    { value: "out", label: "Out of Stock" },
                                ]}
                            />
                        </div>
                    </div>
                </Card>

                {/* ── 3. Medicine Data Table / Mobile Cards ────────────────────── */}
                <Card title={`Medicine Inventory (${filteredMedicines.length})`}>
                    {filteredMedicines.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                            <PackageX className="w-10 h-10 text-slate-300 mb-2" />
                            <p className="text-sm font-semibold text-slate-700">No medicines match your filter criteria.</p>
                            <p className="text-xs text-slate-500 mt-1">Try resetting search or filter options.</p>
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory("All");
                                    setStockFilter("All");
                                }}
                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* ── Desktop & Tablet Table View (md+) ────────────────────── */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                                                Medicine Details
                                            </th>
                                            <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                                                Stock Level
                                            </th>
                                            <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                                                Price / Unit
                                            </th>
                                            <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                                                Total Price
                                            </th>
                                            <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                                                Add Qty
                                            </th>
                                            <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right whitespace-nowrap">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredMedicines.map((med) => {
                                            const isOut = med.quantity === 0;
                                            const isLow = med.quantity > 0 && med.quantity <= med.lowStockThreshold;
                                            const totalPrice = med.quantity * med.unitPrice;

                                            return (
                                                <tr key={med.id} className="hover:bg-slate-50/70 transition-colors">
                                                    {/* Name & Dosage */}
                                                    <td className="py-3.5 pr-4 text-sm font-semibold text-slate-900">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-900 font-bold">{med.name}</span>
                                                            <span className="text-[11px] text-slate-400 font-medium">
                                                                ID: {med.id} • {med.dosageForm}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Stock Level Badge */}
                                                    <td className="py-3.5 pr-4 text-xs">
                                                        {isOut ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                                <PackageX className="w-3.5 h-3.5 text-rose-600" />
                                                                Out of stock (0)
                                                            </span>
                                                        ) : isLow ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                                                Low stock ({med.quantity})
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                                {med.quantity} in stock
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Unit Price */}
                                                    <td className="py-3.5 pr-4 text-xs font-bold text-slate-800">
                                                        {formatCurrency(med.unitPrice)}
                                                    </td>

                                                    {/* Total Price */}
                                                    <td className="py-3.5 pr-4 text-xs font-bold text-emerald-700">
                                                        {formatCurrency(totalPrice)}
                                                    </td>

                                                    <td className="py-3.5 pr-4">
                                                        <Button
                                                            onClick={() => {
                                                                setSelectedMedicineForQty(med);
                                                                setIsAddQtyOpen(true);
                                                            }}
                                                            background="bg-emerald-50! text-emerald-700! border-none!"
                                                            className="w-auto font-bold flex items-center justify-center gap-1 active:scale-95 transition-all duration-150 rounded-xl"
                                                            padding="py-2 px-2"
                                                            title="Add Quantity"
                                                        >
                                                            <Plus className="w-4 h-4 shrink-0" />
                                                            <span className="hidden lg:inline">Add Qty</span>
                                                        </Button>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-3.5 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">

                                                            <button
                                                                onClick={() => handleOpenEditModal(med)}
                                                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                                title="Edit Medicine"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(med.id)}
                                                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                                title="Delete Medicine"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Mobile Card View (< md) ──────────────────────────────── */}
                            <div className="block md:hidden divide-y divide-slate-100 -mx-2">
                                {filteredMedicines.map((med) => {
                                    const isOut = med.quantity === 0;
                                    const isLow = med.quantity > 0 && med.quantity <= med.lowStockThreshold;
                                    const totalPrice = med.quantity * med.unitPrice;

                                    return (
                                        <div key={med.id} className="p-3 space-y-2.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{med.name}</h4>
                                                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                        ID: {med.id} • {med.dosageForm}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedMedicineForQty(med);
                                                            setIsAddQtyOpen(true);
                                                        }}
                                                        className="p-2 rounded-lg text-slate-600 bg-slate-100 active:bg-emerald-50 active:text-emerald-600"
                                                        aria-label="Add Quantity"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEditModal(med)}
                                                        className="p-2 rounded-lg text-slate-600 bg-slate-100 active:bg-blue-50 active:text-blue-600"
                                                        aria-label="Edit Medicine"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(med.id)}
                                                        className="p-2 rounded-lg text-slate-600 bg-slate-100 active:bg-rose-50 active:text-rose-600"
                                                        aria-label="Delete Medicine"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-2 pt-1">
                                                <div>
                                                    {isOut ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                            <PackageX className="w-3.5 h-3.5 text-rose-600" />
                                                            Out of stock (0)
                                                        </span>
                                                    ) : isLow ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                                            Low stock ({med.quantity})
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                            {med.quantity} in stock
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-[11px] text-slate-400">Total Valuation</p>
                                                    <p className="text-xs font-extrabold text-emerald-700 leading-tight">
                                                        {formatCurrency(totalPrice)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <span>Price / Unit: <strong className="text-slate-800">{formatCurrency(med.unitPrice)}</strong></span>
                                                <span>Category: <strong className="text-slate-800">{med.category}</strong></span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </Card>
            </div>

            <EditMadition
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                medicine={editingMedicine}
                onSubmit={handleModalSubmit}
            />

            <DeleteAlart
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setDeletingMedicineId(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Remove Medicine"
                message="Are you sure you want to remove this medicine from the inventory list? This action cannot be undone."
            />

            <AddQty
                isOpen={isAddQtyOpen}
                onClose={() => {
                    setIsAddQtyOpen(false);
                    setSelectedMedicineForQty(null);
                }}
                medicine={selectedMedicineForQty}
                onSubmit={handleAddQuantitySubmit}
            />
        </PageWrapper>
    );
}
