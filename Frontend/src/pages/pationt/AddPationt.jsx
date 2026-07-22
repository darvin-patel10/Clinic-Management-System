import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Phone,
    MapPin,
    Calendar,
    Search,
    Trash2,
    Plus,
    CheckCircle2,
    AlertTriangle,
    ClipboardList,
    Pill,
    IndianRupee,
    Hash,
    Users,
    Pencil
} from "lucide-react";

import PageWrapper from "../../component/PageWrapper";
import Card from "../../component/Deshbord/Card";
import Button from "../../component/Button";
import InputField from "../../component/InputField";
import Dropdown from "../../component/Dropdown";
import { useNotification } from "../../hooks/showNotification";
import {
    AddPatientService,
    FetchNextUniqueNoService,
    SearchPatientService,
    UpdatePatientService,
    EditPrescriptionInfoService
} from "../../service/api/patientServices";
import { AllMedicinesService } from "../../service/api/medicineServices";
import { formatCurrency } from "../../utils/formatters";

// Fallback mock medicines if backend is empty/offline
const FALLBACK_MEDICINES = [
    { _id: "m1", medicineName: "Amoxicillin 500mg", quantity: 80, unitPrice: 12.5 },
    { _id: "m2", medicineName: "Paracetamol 650mg", quantity: 140, unitPrice: 3.0 },
    { _id: "m3", medicineName: "Cetirizine 10mg", quantity: 50, unitPrice: 4.5 },
    { _id: "m4", medicineName: "Metformin 500mg", quantity: 180, unitPrice: 6.8 },
];

export default function AddPationt() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    // Form States
    const [patientName, setPatientName] = useState("");
    const [patientAge, setPatientAge] = useState("");
    const [patientGender, setPatientGender] = useState("");
    const [phonenumber, setPhonenumber] = useState("");
    const [region, setRegion] = useState("");
    const [uniqueno, setUniqueno] = useState("");

    // Prescription States
    const [note, setNote] = useState("");
    const [selectedMedicines, setSelectedMedicines] = useState([]);

    // Inventory Medicines States
    const [medicinesList, setMedicinesList] = useState([]);
    const [medSearchQuery, setMedSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingInventory, setLoadingInventory] = useState(false);

    // Existing Patients Search States
    const [selectedExistingPatient, setSelectedExistingPatient] = useState(null);
    const [isSearchingPatients, setIsSearchingPatients] = useState(false);
    const [existingPatientsList, setExistingPatientsList] = useState([]);

    // Phone search states
    const [isSearchingPhonePatients, setIsSearchingPhonePatients] = useState(false);
    const [existingPhonePatientsList, setExistingPhonePatientsList] = useState([]);
    const [editingPrescriptionId, setEditingPrescriptionId] = useState(null);

    const searchRef = useRef(null);
    const patientSearchRef = useRef(null);
    const phoneSearchRef = useRef(null);

    // Reusable fetch function for next unique number
    const fetchNextNo = async () => {
        try {
            const data = await FetchNextUniqueNoService();
            if (data && data.nextUniqueNo) {
                setUniqueno(data.nextUniqueNo);
            }
        } catch (error) {
            console.error("Failed to fetch next unique number:", error);
            // Fallback to random if backend is offline/erroring
            setUniqueno(Math.floor(100000 + Math.random() * 900000));
        }
    };

    // Fetch next unique number on mount
    useEffect(() => {
        fetchNextNo();
    }, []);

    // Fetch inventory medicines on mount
    useEffect(() => {
        const fetchMedicines = async () => {
            setLoadingInventory(true);
            try {
                const response = await AllMedicinesService();
                if (response && response.medicine && response.medicine.length > 0) {
                    setMedicinesList(response.medicine);
                } else {
                    // Fallback if backend returns empty list
                    setMedicinesList(FALLBACK_MEDICINES);
                }
            } catch (error) {
                console.warn("Failed to fetch medicines from API, using fallback data:", error);
                setMedicinesList(FALLBACK_MEDICINES);
            } finally {
                setLoadingInventory(false);
            }
        };

        fetchMedicines();
    }, []);

    // Debounced search for existing patients as user types Full Name
    useEffect(() => {
        if (patientName.trim() === "" || selectedExistingPatient) {
            setExistingPatientsList([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                const query = patientName.trim();
                const data = await SearchPatientService({ name: query });
                if (data && data.patients) {
                    setExistingPatientsList(data.patients);
                }
            } catch (error) {
                console.error("Failed to search patients:", error);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [patientName, selectedExistingPatient]);

    // Debounced search for existing patients as user types Phone Number (starts at 5 digits)
    useEffect(() => {
        const query = phonenumber.trim();
        if (query.length < 5 || selectedExistingPatient) {
            setExistingPhonePatientsList([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                const data = await SearchPatientService({ phonenumber: query });
                if (data && data.patients) {
                    setExistingPhonePatientsList(data.patients);
                }
            } catch (error) {
                console.error("Failed to search patients by phone:", error);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [phonenumber, selectedExistingPatient]);

    // Close search results dropdown on clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearching(false);
            }
            if (patientSearchRef.current && !patientSearchRef.current.contains(event.target)) {
                setIsSearchingPatients(false);
            }
            if (phoneSearchRef.current && !phoneSearchRef.current.contains(event.target)) {
                setIsSearchingPhonePatients(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectExistingPatient = (p) => {
        setSelectedExistingPatient(p);
        setPatientName(p.patientName);
        setPatientAge(p.patientAge.toString());
        setPatientGender(p.patientGender);
        setPhonenumber(p.phonenumber.toString());
        setRegion(p.region);
        setUniqueno(p.uniqueno.toString());
        setIsSearchingPatients(false);
        setIsSearchingPhonePatients(false);
    };

    const handleClearExistingSelection = () => {
        setSelectedExistingPatient(null);
        setPatientName("");
        setPatientAge("");
        setPatientGender("");
        setPhonenumber("");
        setRegion("");
        setEditingPrescriptionId(null);
        setSelectedMedicines([]);
        setNote("");
        fetchNextNo();
    };

    const handleEditPrescription = (pres) => {
        setEditingPrescriptionId(pres._id);
        setNote(pres.note === "No note" ? "" : pres.note || "");
        setSelectedMedicines(pres.medicine.map((m) => {
            const inventoryMed = medicinesList.find(im => im._id === m.medicineId);
            const availableStock = inventoryMed ? inventoryMed.quantity : 9999;
            const unitPrice = inventoryMed ? inventoryMed.unitPrice : (m.price / m.quantity);
            return {
                _id: m.medicineId,
                medicineName: m.medicineName,
                availableStock: availableStock,
                unitPrice: unitPrice,
                quantity: m.quantity,
                price: m.price
            };
        }));
    };

    const handleCancelEdit = () => {
        setEditingPrescriptionId(null);
        setSelectedMedicines([]);
        setNote("");
    };

    // Filter medicines by search query and exclude already added
    const filteredMedicines = useMemo(() => {
        if (!medSearchQuery.trim()) return [];
        return medicinesList.filter((med) => {
            const matchesSearch = med.medicineName
                .toLowerCase()
                .includes(medSearchQuery.toLowerCase());
            const alreadyAdded = selectedMedicines.some((sm) => sm._id === med._id);
            return matchesSearch && !alreadyAdded;
        });
    }, [medSearchQuery, medicinesList, selectedMedicines]);

    // Sort prescriptions in reverse order (newest first)
    const sortedPrescriptions = useMemo(() => {
        if (!selectedExistingPatient || !selectedExistingPatient.prescription) return [];
        return [...selectedExistingPatient.prescription].reverse();
    }, [selectedExistingPatient]);

    // Add medicine to prescription list
    const handleAddMedicine = (med) => {
        if (med.quantity <= 0) {
            showNotification({
                title: "Out of Stock",
                message: `${med.medicineName} is currently out of stock.`,
                type: "warning",
            });
            return;
        }

        setSelectedMedicines((prev) => [
            ...prev,
            {
                _id: med._id,
                medicineName: med.medicineName,
                availableStock: med.quantity,
                unitPrice: med.unitPrice,
                quantity: 1, // default prescribed quantity
                price: med.unitPrice, // subtotal for 1 unit
            },
        ]);
        setMedSearchQuery("");
        setIsSearching(false);
    };

    // Update quantity for a selected medicine
    const handleQuantityChange = (medId, val) => {
        const qty = parseInt(val, 10) || "";
        setSelectedMedicines((prev) =>
            prev.map((med) => {
                if (med._id === medId) {
                    const finalQty = qty === "" ? "" : Math.max(1, qty);
                    return {
                        ...med,
                        quantity: finalQty,
                        price: finalQty === "" ? 0 : Number((finalQty * med.unitPrice).toFixed(2)),
                    };
                }
                return med;
            })
        );
    };

    // Remove medicine from prescription list
    const handleRemoveMedicine = (medId) => {
        setSelectedMedicines((prev) => prev.filter((med) => med._id !== medId));
    };

    // Calculate total prescription price
    const totalPrescriptionPrice = useMemo(() => {
        return Number(selectedMedicines.reduce((sum, med) => sum + (med.price || 0), 0).toFixed(2));
    }, [selectedMedicines]);

    // Handle Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // For existing patients, we only validate the prescription. For new patients, validate profile details.
        if (!selectedExistingPatient) {
            // New Patient Validation
            if (!patientName.trim()) {
                showNotification({ title: "Validation Error", message: "Patient Name is required", type: "error" });
                return;
            }
            if (!patientAge || isNaN(patientAge) || Number(patientAge) <= 0) {
                showNotification({ title: "Validation Error", message: "Enter a valid patient age", type: "error" });
                return;
            }
            if (!phonenumber || isNaN(phonenumber) || phonenumber.length !== 10) {
                showNotification({ title: "Validation Error", message: "Phone number must be exactly 10 digits", type: "error" });
                return;
            }
            if (!patientGender) {
                showNotification({ title: "Validation Error", message: "Patient Gender is required", type: "error" });
                return;
            }
            if (!region.trim()) {
                showNotification({ title: "Validation Error", message: "Region/Address is required", type: "error" });
                return;
            }
        }

        // Prescription Validation
        if (selectedMedicines.length === 0) {
            showNotification({
                title: "Validation Error",
                message: "Please prescribe at least one medicine. Every patient registration/visit requires a prescription.",
                type: "warning",
            });
            return;
        }

        // Check if any quantity is empty or invalid
        const hasInvalidQty = selectedMedicines.some((m) => m.quantity === "" || m.quantity <= 0);
        if (hasInvalidQty) {
            showNotification({
                title: "Validation Error",
                message: "Please enter valid quantities for all prescribed medicines.",
                type: "error",
            });
            return;
        }

        // Check if any quantity exceeds stock levels
        const stockExceededMed = selectedMedicines.find((m) => m.quantity > m.availableStock);
        if (stockExceededMed) {
            showNotification({
                title: "Validation Error",
                message: `Prescribed quantity for "${stockExceededMed.medicineName}" exceeds available stock (${stockExceededMed.availableStock}).`,
                type: "error",
            });
            return;
        }

        setLoading(true);
        try {
            if (selectedExistingPatient) {
                if (editingPrescriptionId) {
                    const payload = {
                        prescription: [
                            {
                                prescriptionId: editingPrescriptionId,
                                note: note.trim() || "No note",
                                totalPrice: totalPrescriptionPrice,
                                medicine: selectedMedicines.map((m) => ({
                                    medicineId: m._id,
                                    medicineName: m.medicineName,
                                    quantity: Number(m.quantity),
                                    price: Number(m.price),
                                })),
                            },
                        ],
                    };

                    await EditPrescriptionInfoService(selectedExistingPatient._id, payload);
                    showNotification({
                        title: "Success",
                        message: `Prescription updated successfully for ${patientName}!`,
                        type: "success",
                    });
                } else {
                    const payload = {
                        prescription: {
                            medicine: selectedMedicines.map((m) => ({
                                medicineId: m._id,
                                medicineName: m.medicineName,
                                quantity: Number(m.quantity),
                                price: Number(m.price),
                            })),
                            note: note.trim() || "No note",
                            totalPrice: totalPrescriptionPrice,
                        },
                    };

                    const response = await UpdatePatientService(selectedExistingPatient._id, payload);

                    if (response) {
                        showNotification({
                            title: "Success",
                            message: `Visit and prescription added successfully for ${patientName}!`,
                            type: "success",
                        });
                        handleClearExistingSelection();
                    }
                }
            } else {
                const payload = {
                    patientName: patientName.trim(),
                    patientAge: Number(patientAge),
                    patientGender,
                    phonenumber: Number(phonenumber),
                    region: region.trim(),
                    prescription: [
                        {
                            medicine: selectedMedicines.map((m) => ({
                                medicineId: m._id,
                                medicineName: m.medicineName,
                                quantity: Number(m.quantity),
                                price: Number(m.price),
                            })),
                            note: note.trim() || "No note",
                            totalPrice: totalPrescriptionPrice,
                        },
                    ],
                };

                const response = await AddPatientService(payload);
                if (response) {
                    showNotification({
                        title: "Success",
                        message: response.message || "Patient registered and initial prescription added successfully!",
                        type: "success",
                    });
                    handleClearExistingSelection();
                }
            }
            // navigate("/add-patient");
        } catch (error) {
            console.error("Submission error:", error);
            showNotification({
                title: "Failed",
                message: error.message || "Failed to process request. Please check inventory stock levels.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper
            title={selectedExistingPatient ? "Add Patient Visit" : "Register New Patient"}
            subtitle={selectedExistingPatient ? "Record a new clinical visit and prescription for an existing patient." : "Record core patient file details and construct their initial prescription."}
            onBack={() => navigate("/dashboard")}
        >
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* ── Left Column: Patient Details ──────────────────────────────── */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card title="Patient Profile">
                            <div className="space-y-4 pt-2">
                                {/* Unique Registration No */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">
                                        {selectedExistingPatient ? "Unique Patient ID" : "Unique Patient ID (Auto-Generated)"}
                                    </label>
                                    <InputField
                                        type="text"
                                        disabled
                                        value={uniqueno}
                                        icon={Hash}
                                        className="w-full rounded-xl text-sm text-slate-500 bg-slate-50 border border-slate-200 outline-none cursor-not-allowed h-10 px-3.5"
                                    />
                                </div>

                                {/* Full Name & Autocomplete Search */}
                                <div className="relative" ref={patientSearchRef}>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Full Name *
                                        </label>
                                        {selectedExistingPatient && (
                                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150">
                                                Existing Patient
                                                <button
                                                    type="button"
                                                    onClick={handleClearExistingSelection}
                                                    className="hover:text-red-600 font-extrabold cursor-pointer ml-0.5"
                                                    title="Clear selection"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}
                                    </div>
                                    <InputField
                                        type="text"
                                        required
                                        value={patientName}
                                        onChange={(e) => {
                                            setPatientName(e.target.value);
                                            setIsSearchingPatients(true);
                                            if (selectedExistingPatient) {
                                                setSelectedExistingPatient(null);
                                                fetchNextNo();
                                            }
                                        }}
                                        onFocus={() => setIsSearchingPatients(true)}
                                        placeholder="e.g. Aarav Sharma"
                                        icon={User}
                                    />

                                    {/* Patient Search Results Dropdown */}
                                    {isSearchingPatients && patientName.trim() !== "" && !selectedExistingPatient && existingPatientsList.length > 0 && (
                                        <div className="absolute left-0 right-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto">
                                            <div className="divide-y divide-slate-100">
                                                {existingPatientsList.map((p) => (
                                                    <button
                                                        key={p._id}
                                                        type="button"
                                                        onClick={() => handleSelectExistingPatient(p)}
                                                        className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-3.5 h-3.5 text-blue-500" />
                                                            <div>
                                                                <p className="text-slate-800 font-bold">{p.patientName}</p>
                                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                                    ID: #{p.uniqueno} • Phone: {p.phonenumber}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                                                            Select
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Phone Number */}
                                <div className="relative" ref={phoneSearchRef}>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">
                                        Phone Number *
                                    </label>
                                    <InputField
                                        type="text"
                                        maxLength={10}
                                        required
                                        disabled={!!selectedExistingPatient}
                                        value={phonenumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            setPhonenumber(val);
                                            setIsSearchingPhonePatients(true);
                                        }}
                                        onFocus={() => setIsSearchingPhonePatients(true)}
                                        placeholder="e.g. 9876543210"
                                        icon={Phone}
                                    />

                                    {/* Phone Search Results Dropdown */}
                                    {isSearchingPhonePatients && phonenumber.trim().length >= 5 && !selectedExistingPatient && existingPhonePatientsList.length > 0 && (
                                        <div className="absolute left-0 right-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto">
                                            <div className="divide-y divide-slate-100">
                                                {existingPhonePatientsList.map((p) => (
                                                    <button
                                                        key={p._id}
                                                        type="button"
                                                        onClick={() => {
                                                            handleSelectExistingPatient(p);
                                                            setIsSearchingPhonePatients(false);
                                                        }}
                                                        className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-3.5 h-3.5 text-blue-500" />
                                                            <div>
                                                                <p className="text-slate-800 font-bold">{p.patientName}</p>
                                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                                    ID: #{p.uniqueno} • Phone: {p.phonenumber}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                                                            Select
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Age & Gender Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">
                                            Age *
                                        </label>
                                        <InputField
                                            type="number"
                                            required
                                            min="1"
                                            max="120"
                                            disabled={!!selectedExistingPatient}
                                            value={patientAge}
                                            onChange={(e) => setPatientAge(e.target.value)}
                                            placeholder="35"
                                            icon={Calendar}
                                        />
                                    </div>

                                    <div className="w-full">
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">
                                            Gender *
                                        </label>
                                        <Dropdown
                                            value={patientGender}
                                            onChange={(e) => setPatientGender(e.target.value)}
                                            disabled={!!selectedExistingPatient}
                                            options={[
                                                { value: "", label: "Select Gender" },
                                                { value: "Male", label: "Male" },
                                                { value: "Female", label: "Female" },
                                                { value: "Other", label: "Other" }
                                            ]}
                                            selectClassName="h-10 w-full sm:w-full"
                                        />
                                    </div>
                                </div>

                                {/* Region / Address */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">
                                        Region / Locality *
                                    </label>
                                    <InputField
                                        type="text"
                                        required
                                        disabled={!!selectedExistingPatient}
                                        value={region}
                                        onChange={(e) => setRegion(e.target.value)}
                                        placeholder="e.g. Andheri East, Mumbai"
                                        icon={MapPin}
                                    />
                                </div>
                            </div>
                        </Card>
                        {sortedPrescriptions.length > 0 && (
                            <Card title="Previous Prescriptions" subtitle="Historical visits and prescriptions recorded for this patient.">
                                <div className="space-y-4 pt-2 max-h-[340px] overflow-y-auto pr-1 divide-y divide-slate-100">
                                    {sortedPrescriptions.map((pres, idx) => {
                                        const diffMs = new Date() - new Date(pres.createdAt);
                                        const isEditable = diffMs / (1000 * 60 * 60) < 12;
                                        return (
                                            <div key={pres._id || idx} className="pt-3 first:pt-0">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="w-full flex items-center justify-between gap-1.5">
                                                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                                            Visit {sortedPrescriptions.length - idx} • {new Date(pres.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        {isEditable && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditPrescription(pres)}
                                                                className={`p-1 rounded hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer ${editingPrescriptionId === pres._id ? "bg-blue-100" : ""
                                                                    }`}
                                                                title="Edit this prescription (Available for 12 hours)"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                </div>
                                                <div className="space-y-3 pl-2.5 border-l-2 border-slate-200">
                                                    {pres.medicine.map((med, medIdx) => (
                                                        <div key={med._id || medIdx} className="flex justify-between text-[12px] text-slate-700 tracking-wider font-semibold">
                                                            <span>{med.medicineName} <span className="text-[10px] text-slate-400 font-bold ml-2">x{med.quantity}</span></span>
                                                            <span className="text-slate-500 font-medium">{formatCurrency(med.price)}</span>
                                                        </div>
                                                    ))}

                                                    <hr className="border-t border-slate-150 my-1.5" />

                                                    <div className="flex justify-between text-xs text-slate-700 font-semibold">
                                                        <span className="text-xs font-bold text-black-400">Total Price </span>
                                                        <span className="text-xs font-bold text-blue-600">{formatCurrency(pres.totalPrice)}</span>
                                                    </div>

                                                    {pres.note && pres.note !== "No note" && (
                                                        <div className="text-[12px] text-slate-500 italic mt-2 bg-slate-50 p-2 rounded-xl border border-slate-100/80">
                                                            <span className="font-bold uppercase text-[11px] text-slate-400 block not-italic mb-0.5">Note:</span>
                                                            {pres.note}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* ── Right Column: First Prescription Builder ─────────────────── */}
                    <div className="lg:col-span-7 space-y-6">
                        <Card
                            title={editingPrescriptionId ? "Edit Prescription" : (selectedExistingPatient ? "Add Visit Prescription" : "Initial Prescription")}
                            subtitle={editingPrescriptionId ? "Modify note and medicine quantities for the selected clinical visit." : "Choose medicines from inventory and specify prescribed quantities."}
                        >
                            <div className="space-y-4 pt-2">
                                {editingPrescriptionId && (
                                    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-amber-800 animate-in fade-in slide-in-from-top-1 duration-150">
                                        <span>You are currently editing an existing prescription.</span>
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold rounded-lg transition-colors cursor-pointer text-[10px]"
                                        >
                                            Cancel Edit
                                        </button>
                                    </div>
                                )}
                                {/* Medicine Search Autocomplete */}
                                <div className="relative" ref={searchRef}>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">
                                        Search & Add Medicine *
                                    </label>
                                    <div className="relative">
                                        <InputField
                                            type="text"
                                            value={medSearchQuery}
                                            onChange={(e) => {
                                                setMedSearchQuery(e.target.value);
                                                setIsSearching(true);
                                            }}
                                            onFocus={() => setIsSearching(true)}
                                            placeholder="Type medicine name to search inventory..."
                                            icon={Search}
                                        />
                                        {loadingInventory && (
                                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Search Results Dropdown List */}
                                    {isSearching && medSearchQuery.trim() !== "" && (
                                        <div className="absolute left-0 right-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto">
                                            {filteredMedicines.length === 0 ? (
                                                <div className="p-4 text-xs font-medium text-slate-500 text-center flex items-center justify-center gap-1.5">
                                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                    No in-stock medicines match "{medSearchQuery}"
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-slate-100">
                                                    {filteredMedicines.map((med) => {
                                                        const isLow = med.quantity <= 15;
                                                        return (
                                                            <button
                                                                key={med._id}
                                                                type="button"
                                                                onClick={() => handleAddMedicine(med)}
                                                                className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Pill className="w-3.5 h-3.5 text-blue-500" />
                                                                    <div>
                                                                        <p className="text-slate-800 font-bold">{med.medicineName}</p>
                                                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Price: {formatCurrency(med.unitPrice)}</p>
                                                                    </div>
                                                                </div>
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isLow ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                    }`}>
                                                                    {med.quantity} in stock
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Prescribed Medicines List */}
                                <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                                    <th className="py-2.5 px-3">Medicine</th>
                                                    <th className="py-2.5 px-3 w-28">Prescribed Qty</th>
                                                    <th className="py-2.5 px-3 text-right">Price</th>
                                                    <th className="py-2.5 px-3 text-right w-12"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {selectedMedicines.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="py-8 px-4 text-center text-slate-400 font-medium">
                                                            <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                            No medicines prescribed yet.<br />
                                                            <span className="text-[10px] text-slate-400">Search and select medicines from the input above.</span>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    selectedMedicines.map((med) => {
                                                        const isExceeded = med.quantity > med.availableStock;
                                                        return (
                                                            <tr key={med._id} className="hover:bg-slate-50 transition-colors">
                                                                {/* Medicine Name */}
                                                                <td className="py-3 px-3">
                                                                    <div className="font-bold text-slate-800">{med.medicineName}</div>
                                                                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                                        Stock: <span className="font-bold">{med.availableStock}</span> • {formatCurrency(med.unitPrice)}/unit
                                                                    </div>
                                                                </td>

                                                                {/* Quantity Input */}
                                                                <td className="py-3 px-3">
                                                                    <div className="relative">
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            required
                                                                            value={med.quantity}
                                                                            onChange={(e) => handleQuantityChange(med._id, e.target.value)}
                                                                            className={`w-20 px-2 py-1 text-xs font-semibold rounded-lg border outline-none text-slate-800 transition-colors bg-white ${isExceeded
                                                                                ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-100"
                                                                                : "border-slate-200 focus:border-blue-500"
                                                                                }`}
                                                                        />
                                                                        {isExceeded && (
                                                                            <span className="absolute -bottom-4 left-0 text-[9px] font-semibold text-red-500 whitespace-nowrap">
                                                                                Exceeds stock
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>

                                                                {/* Subtotal Price */}
                                                                <td className="py-3 px-3 text-right font-bold text-slate-700">
                                                                    {formatCurrency(med.price)}
                                                                </td>

                                                                {/* Remove Action */}
                                                                <td className="py-3 px-3 text-right">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveMedicine(med._id)}
                                                                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                                        title="Remove medicine"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Prescription Summary */}
                                    {selectedMedicines.length > 0 && (
                                        <div className="bg-slate-100/60 p-4 border-t border-slate-200 flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Consultation Cost</span>
                                            <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl">
                                                <IndianRupee className="w-4 h-4 text-blue-600 shrink-0" />
                                                <span className="text-lg font-extrabold text-blue-700 leading-none">
                                                    {totalPrescriptionPrice.toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Prescription Notes / Treatment Instructions */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">
                                        Treatment Notes / Dosage Instructions
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="e.g. Take 1 capsule of Amoxicillin 3 times a day for 5 days. 1 tablet of Paracetamol in case of fever."
                                        className="w-full rounded-xl border border-slate-200 p-3 bg-slate-50 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all duration-150 resize-none font-medium placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                </div>

                {/* ── Form Controls Footer ────────────────────────────────────────── */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3.5">
                    <Button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        background="bg-slate-100! text-slate-500!"
                        border="border-none!"
                        className="px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider hover:bg-slate-200! transition-colors cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 font-bold text-xs rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-none shadow-md hover:shadow-lg transition-all duration-150 active:scale-98 flex items-center gap-1.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>{editingPrescriptionId ? "Saving..." : (selectedExistingPatient ? "Adding Visit..." : "Registering Patient...")}</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{editingPrescriptionId ? "Save Prescription" : (selectedExistingPatient ? "Add Visit & Prescription" : "Register Patient")}</span>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </PageWrapper>
    );
}