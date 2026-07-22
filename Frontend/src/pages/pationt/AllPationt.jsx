import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    Search,
    Filter,
    Plus,
    Clock,
    Edit3,
    Trash2,
    X,
    CheckCircle2,
    AlertTriangle,
    Calendar,
    MapPin,
    Phone,
    User,
    Eye,
    Pill,
    IndianRupee,
    RefreshCw,
    ClipboardList,
} from "lucide-react";

import PageWrapper from "../../component/PageWrapper";
import Card from "../../component/Deshbord/Card";
import Button from "../../component/Button";
import InputField from "../../component/InputField";
import Dropdown from "../../component/Dropdown";
import DeleteAlart from "../../component/DeleteAlart";
import KpiCard from "../../component/Deshbord/KpiCard";
import { useNotification } from "../../hooks/showNotification";
import { formatCurrency, formatDate } from "../../utils/formatters";

// API services
import {
    SearchPatientService,
    UpdatePatientService,
    UpdatePatientDataService,
    EditPrescriptionInfoService,
    DeletePrescriptionService,
    DeletePatientService
} from "../../service/api/patientServices";
import { AllMedicinesService } from "../../service/api/medicineServices";
import SectionWrapper from "../../component/SectionWrapper";

// Fallback mock medicines if backend is empty/offline
const FALLBACK_MEDICINES = [
    { _id: "m1", medicineName: "Amoxicillin 500mg", quantity: 80, unitPrice: 12.5 },
    { _id: "m2", medicineName: "Paracetamol 650mg", quantity: 140, unitPrice: 3.0 },
    { _id: "m3", medicineName: "Cetirizine 10mg", quantity: 50, unitPrice: 4.5 },
    { _id: "m4", medicineName: "Metformin 500mg", quantity: 180, unitPrice: 6.8 },
];

export default function AllPationt() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    // Data and Fetching state
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [genderFilter, setGenderFilter] = useState("All");
    const [regionFilter, setRegionFilter] = useState("All");

    // Modal state controllers
    const [historyPatient, setHistoryPatient] = useState(null);
    const [newVisitPatient, setNewVisitPatient] = useState(null);
    const [editProfilePatient, setEditProfilePatient] = useState(null);
    const [deletingPatient, setDeletingPatient] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New Prescription state (for New Visit modal)
    const [selectedMedicines, setSelectedMedicines] = useState([]);
    const [medSearchQuery, setMedSearchQuery] = useState("");
    const [medicinesInventory, setMedicinesInventory] = useState([]);
    const [isSearchingInventory, setIsSearchingInventory] = useState(false);
    const [loadingInventory, setLoadingInventory] = useState(false);
    const [visitNote, setVisitNote] = useState("");
    const inventorySearchRef = useRef(null);

    // Edit Prescription state (inside History modal)
    const [editingVisit, setEditingVisit] = useState(null); // holds prescription object to edit
    const [editSelectedMedicines, setEditSelectedMedicines] = useState([]);
    const [editMedSearchQuery, setEditMedSearchQuery] = useState("");
    const [editVisitNote, setEditVisitNote] = useState("");
    const [isSearchingEditInventory, setIsSearchingEditInventory] = useState(false);
    const editInventorySearchRef = useRef(null);

    // Profile Edit state
    const [profileName, setProfileName] = useState("");
    const [profileAge, setProfileAge] = useState("");
    const [profileGender, setProfileGender] = useState("");
    const [profilePhone, setProfilePhone] = useState("");
    const [profileRegion, setProfileRegion] = useState("");

    // Fetch patients from API
    const fetchPatients = async (queryParam = "") => {
        setLoading(true);
        try {
            let params = {};
            const trimmedQuery = queryParam.trim();
            if (trimmedQuery) {
                // Determine search field based on input format
                if (/^\d+$/.test(trimmedQuery)) {
                    if (trimmedQuery.length === 10) {
                        params.phonenumber = Number(trimmedQuery);
                    } else {
                        params.uniqueno = Number(trimmedQuery);
                    }
                } else {
                    params.name = trimmedQuery;
                }
            }

            const response = await SearchPatientService(params);
            if (response && response.patients) {
                setPatients(response.patients);
            }
        } catch (error) {
            console.error("Failed to load patients:", error);
            showNotification({
                title: "Fetch Failed",
                message: error.message || "Failed to load patients from the server.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // Load patients on mount
    useEffect(() => {
        fetchPatients();
    }, []);

    // Fetch medicines inventory for prescriptions
    const fetchMedicinesInventory = async () => {
        setLoadingInventory(true);
        try {
            const response = await AllMedicinesService();
            if (response && response.medicine && response.medicine.length > 0) {
                setMedicinesInventory(response.medicine);
            } else {
                setMedicinesInventory(FALLBACK_MEDICINES);
            }
        } catch (error) {
            console.warn("Failed to fetch medicines from API, using fallback data:", error);
            setMedicinesInventory(FALLBACK_MEDICINES);
        } finally {
            setLoadingInventory(false);
        }
    };

    // Trigger medicine fetch when a prescription builder is shown
    useEffect(() => {
        if (newVisitPatient || editingVisit) {
            fetchMedicinesInventory();
        }
    }, [newVisitPatient, editingVisit]);

    // Handle outside clicks for autocomplete search dropdowns
    useEffect(() => {
        function handleClickOutside(event) {
            if (inventorySearchRef.current && !inventorySearchRef.current.contains(event.target)) {
                setIsSearchingInventory(false);
            }
            if (editInventorySearchRef.current && !editInventorySearchRef.current.contains(event.target)) {
                setIsSearchingEditInventory(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search Trigger handler (for search query submission)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchPatients(searchQuery);
    };

    // Clear search and reset
    const handleResetFilters = () => {
        setSearchQuery("");
        setGenderFilter("All");
        setRegionFilter("All");
        fetchPatients("");
    };

    // Calculate dynamic list metrics for KPIs
    const metrics = useMemo(() => {
        const total = patients.length;
        const male = patients.filter((p) => p.patientGender?.toLowerCase() === "male").length;
        const female = patients.filter((p) => p.patientGender?.toLowerCase() === "female").length;
        const other = total - male - female;

        // Calculate average age
        const totalAge = patients.reduce((sum, p) => sum + (p.patientAge || 0), 0);
        const averageAge = total > 0 ? Math.round(totalAge / total) : 0;

        // Calculate visits today (prescriptions created today)
        const todayStr = new Date().toDateString();
        const visitsToday = patients.reduce((count, p) => {
            const prescriptionsToday = p.prescription?.filter((pres) => {
                const date = pres.createdAt ? new Date(pres.createdAt) : new Date();
                return date.toDateString() === todayStr;
            }).length || 0;
            return count + prescriptionsToday;
        }, 0);

        return { total, male, female, other, averageAge, visitsToday };
    }, [patients]);

    // Extract unique regions for filter dropdown
    const uniqueRegions = useMemo(() => {
        const regions = patients.map((p) => p.region).filter(Boolean);
        return ["All", ...new Set(regions)];
    }, [patients]);

    // Filter patients locally
    const filteredPatients = useMemo(() => {
        return patients.filter((p) => {
            const matchesGender = genderFilter === "All" || p.patientGender === genderFilter;
            const matchesRegion = regionFilter === "All" || p.region === regionFilter;
            return matchesGender && matchesRegion;
        });
    }, [patients, genderFilter, regionFilter]);

    // Check if prescription is within 24 hours
    const isWithin24Hours = (dateString) => {
        if (!dateString) return true;
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        return diffInMs < 24 * 60 * 60 * 1000;
    };

    /* ── PROFILE EDIT ACTIONS ────────────────────────────────────────── */
    const handleOpenEditProfile = (patient) => {
        setEditProfilePatient(patient);
        setProfileName(patient.patientName || "");
        setProfileAge(patient.patientAge || "");
        setProfileGender(patient.patientGender || "");
        setProfilePhone(patient.phonenumber || "");
        setProfileRegion(patient.region || "");
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!profileName.trim() || !profileAge || !profileGender || !profilePhone || !profileRegion.trim()) {
            showNotification({ title: "Validation Error", message: "All fields are required", type: "error" });
            return;
        }
        if (isNaN(profilePhone) || profilePhone.toString().length !== 10) {
            showNotification({ title: "Validation Error", message: "Phone number must be exactly 10 digits", type: "error" });
            return;
        }

        setIsSubmitting(true);
        try {
            await UpdatePatientDataService(editProfilePatient._id, {
                patientName: profileName.trim(),
                patientAge: Number(profileAge),
                patientGender: profileGender,
                phonenumber: Number(profilePhone),
                region: profileRegion.trim(),
            });
            showNotification({
                title: "Profile Updated",
                message: `Updated profile details for ${profileName} successfully.`,
                type: "success",
            });
            setEditProfilePatient(null);
            fetchPatients(searchQuery); // refresh list
        } catch (error) {
            console.error("Profile update error:", error);
            showNotification({
                title: "Update Failed",
                message: error.message || "Failed to update patient profile.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── ADD PRESCRIPTION / NEW VISIT ACTIONS ─────────────────────────── */
    const filteredMedicines = useMemo(() => {
        if (!medSearchQuery.trim()) return [];
        return medicinesInventory.filter((med) => {
            const matchesSearch = med.medicineName.toLowerCase().includes(medSearchQuery.toLowerCase());
            const alreadyAdded = selectedMedicines.some((sm) => sm._id === med._id);
            return matchesSearch && !alreadyAdded;
        });
    }, [medSearchQuery, medicinesInventory, selectedMedicines]);

    const handleAddMedicine = (med) => {
        if (med.quantity <= 0) {
            showNotification({ title: "Out of Stock", message: `${med.medicineName} is out of stock.`, type: "warning" });
            return;
        }

        setSelectedMedicines((prev) => [
            ...prev,
            {
                _id: med._id,
                medicineName: med.medicineName,
                availableStock: med.quantity,
                unitPrice: med.unitPrice,
                quantity: 1,
                price: med.unitPrice,
            },
        ]);
        setMedSearchQuery("");
        setIsSearchingInventory(false);
    };

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

    const handleRemoveMedicine = (medId) => {
        setSelectedMedicines((prev) => prev.filter((m) => m._id !== medId));
    };

    const totalPrescriptionPrice = useMemo(() => {
        return Number(selectedMedicines.reduce((sum, med) => sum + (med.price || 0), 0).toFixed(2));
    }, [selectedMedicines]);

    const handleSaveNewVisit = async (e) => {
        e.preventDefault();
        if (selectedMedicines.length === 0) {
            showNotification({ title: "Validation Error", message: "Prescribe at least one medicine", type: "warning" });
            return;
        }
        const hasInvalidQty = selectedMedicines.some((m) => m.quantity === "" || m.quantity <= 0);
        if (hasInvalidQty) {
            showNotification({ title: "Validation Error", message: "Enter valid quantities for all medicines", type: "error" });
            return;
        }
        const stockExceeded = selectedMedicines.find((m) => m.quantity > m.availableStock);
        if (stockExceeded) {
            showNotification({
                title: "Stock Exceeded",
                message: `Quantity for "${stockExceeded.medicineName}" exceeds stock (${stockExceeded.availableStock})`,
                type: "error",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                prescription: {
                    medicine: selectedMedicines.map((m) => ({
                        medicineId: m._id,
                        medicineName: m.medicineName,
                        quantity: Number(m.quantity),
                        price: Number(m.price),
                    })),
                    note: visitNote.trim() || "No note",
                    totalPrice: totalPrescriptionPrice,
                },
            };

            await UpdatePatientService(newVisitPatient._id, payload);
            showNotification({
                title: "Visit Logged",
                message: `Logged new visit and prescription for ${newVisitPatient.patientName}.`,
                type: "success",
            });

            // Reset state and close modal
            setNewVisitPatient(null);
            setSelectedMedicines([]);
            setVisitNote("");
            fetchPatients(searchQuery);
        } catch (error) {
            console.error("Failed to add visit:", error);
            showNotification({
                title: "Log Visit Failed",
                message: error.message || "Failed to log prescription. Verify medicine stocks.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── EDIT PRESCRIPTION (timeline visit) ACTIONS ─────────────────────── */
    const filteredEditMedicines = useMemo(() => {
        if (!editMedSearchQuery.trim()) return [];
        return medicinesInventory.filter((med) => {
            const matchesSearch = med.medicineName.toLowerCase().includes(editMedSearchQuery.toLowerCase());
            const alreadyAdded = editSelectedMedicines.some((sm) => sm.medicineId === med._id);
            return matchesSearch && !alreadyAdded;
        });
    }, [editMedSearchQuery, medicinesInventory, editSelectedMedicines]);

    const handleAddEditMedicine = (med) => {
        if (med.quantity <= 0) {
            showNotification({ title: "Out of Stock", message: `${med.medicineName} is out of stock.`, type: "warning" });
            return;
        }

        setEditSelectedMedicines((prev) => [
            ...prev,
            {
                medicineId: med._id,
                medicineName: med.medicineName,
                availableStock: med.quantity, // current stock in DB
                unitPrice: med.unitPrice,
                quantity: 1,
                price: med.unitPrice,
            },
        ]);
        setEditMedSearchQuery("");
        setIsSearchingEditInventory(false);
    };

    const handleEditQuantityChange = (medId, val) => {
        const qty = parseInt(val, 10) || "";
        setEditSelectedMedicines((prev) =>
            prev.map((med) => {
                if (med.medicineId === medId) {
                    const finalQty = qty === "" ? "" : Math.max(0, qty); // Qty 0 will be allowed if we want to remove
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

    const handleRemoveEditMedicine = (medId) => {
        setEditSelectedMedicines((prev) => prev.filter((m) => m.medicineId !== medId));
    };

    const editPrescriptionPrice = useMemo(() => {
        return Number(editSelectedMedicines.reduce((sum, med) => sum + (med.price || 0), 0).toFixed(2));
    }, [editSelectedMedicines]);

    const handleStartEditPrescription = (visit) => {
        setEditingVisit(visit);
        setEditVisitNote(visit.note || "");

        // Map existing prescription medicines
        // In the database model, visit.medicine has: { medicineId, medicineName, quantity, price }
        const mapped = visit.medicine.map((m) => {
            // Find in inventory to get current stock and unit price
            const invDoc = medicinesInventory.find((inv) => inv._id === m.medicineId);
            const unitPrice = invDoc ? invDoc.unitPrice : (m.price / m.quantity) || 0;
            const availableStock = invDoc ? invDoc.quantity : 100; // default if not found

            return {
                medicineId: m.medicineId,
                medicineName: m.medicineName,
                // The max stock allowed to be prescribed is: current stock + previously prescribed qty
                availableStock: availableStock + m.quantity,
                unitPrice,
                quantity: m.quantity,
                price: m.price,
            };
        });
        setEditSelectedMedicines(mapped);
    };

    const handleSaveEditPrescription = async (e) => {
        e.preventDefault();
        const validMedicines = editSelectedMedicines.filter((m) => m.quantity > 0);
        const hasInvalidQty = editSelectedMedicines.some((m) => m.quantity === "");
        if (hasInvalidQty) {
            showNotification({ title: "Validation Error", message: "Enter valid quantities for medicines", type: "error" });
            return;
        }

        // Validate stock
        const exceeded = editSelectedMedicines.find((m) => {
            // Check if inventory has enough stock for the increase
            const invDoc = medicinesInventory.find((inv) => inv._id === m.medicineId);
            const originalQty = editingVisit.medicine.find((om) => om.medicineId === m.medicineId)?.quantity || 0;
            const delta = m.quantity - originalQty;
            if (delta > 0 && invDoc && invDoc.quantity < delta) {
                return true;
            }
            return false;
        });

        if (exceeded) {
            showNotification({
                title: "Stock Exceeded",
                message: `Insufficient inventory stock to increase quantity for "${exceeded.medicineName}"`,
                type: "error",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                prescription: {
                    prescriptionId: editingVisit._id,
                    note: editVisitNote.trim() || "No note",
                    totalPrice: editPrescriptionPrice,
                    medicine: validMedicines.map((m) => ({
                        medicineId: m.medicineId,
                        medicineName: m.medicineName,
                        quantity: Number(m.quantity),
                    })),
                },
            };

            const response = await EditPrescriptionInfoService(historyPatient._id, payload);
            showNotification({
                title: "Prescription Updated",
                message: "Prescription details edited successfully.",
                type: "success",
            });

            // Update patient details in history screen
            if (response && response.patient) {
                setHistoryPatient(response.patient);
            }
            setEditingVisit(null);
            fetchPatients(searchQuery);
        } catch (error) {
            console.error("Prescription update error:", error);
            showNotification({
                title: "Update Failed",
                message: error.message || "Failed to update prescription details.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── DELETE PRESCRIPTION ACTIONS ────────────────────────────────── */
    const handleDeletePrescription = async (prescriptionId) => {
        if (!window.confirm("Are you sure you want to delete this prescription visit? Stock will be restored to inventory.")) {
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await DeletePrescriptionService(historyPatient._id, { prescriptionId });
            showNotification({
                title: "Prescription Deleted",
                message: "Prescription deleted. Stock has been restored.",
                type: "success",
            });

            if (response && response.patientDeleted) {
                // If patient was deleted because it had no prescriptions left
                setHistoryPatient(null);
                fetchPatients(searchQuery);
            } else if (response && response.patient) {
                setHistoryPatient(response.patient);
                fetchPatients(searchQuery);
            }
        } catch (error) {
            console.error("Failed to delete prescription:", error);
            showNotification({
                title: "Delete Failed",
                message: error.message || "Failed to delete prescription.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── DELETE PATIENT ACTIONS ──────────────────────────────────────── */
    const handleDeletePatientConfirm = async () => {
        if (!deletingPatient) return;
        setIsSubmitting(true);
        try {
            await DeletePatientService(deletingPatient._id);
            showNotification({
                title: "Patient Deleted",
                message: `Successfully removed ${deletingPatient.patientName} from records.`,
                type: "warning",
            });
            setDeletingPatient(null);
            fetchPatients(searchQuery);
        } catch (error) {
            console.error("Patient delete error:", error);
            showNotification({
                title: "Delete Failed",
                message: error.message || "Failed to delete patient record.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to extract initials for Avatars
    const getInitials = (name = "") => {
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    return (
        <PageWrapper
            title="Patients Directory"
            subtitle="Search patient files, record clinical visits, view medical timeline histories, and manage details."
            onBack={() => navigate("/dashboard")}
            actions={
                <Button
                    type="button"
                    onClick={() => navigate("/add-pationt")}
                    className="w-full sm:w-auto font-semibold text-xs rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-none shadow-sm hover:shadow transition-all duration-150 active:scale-95 flex justify-center items-center"
                    padding="py-2.5 px-3"
                >
                    <Plus className="w-4 h-4 mr-1.5 shrink-0" />
                    Register New Patient
                </Button>
            }
        >
            <div className="flex flex-col gap-6">
                {/* ── 1. KPI Cards Row ────────────────────────────────────────── */}
                <SectionWrapper className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                        label="Total Active Patients"
                        value={metrics.total.toString()}
                        icon={Users}
                        tone="blue"
                    />
                    <KpiCard
                        label="Today's Patient Visits"
                        value={metrics.visitsToday.toString()}
                        icon={Clock}
                        tone="green"
                    />
                    <KpiCard
                        label="Gender Ratio (M / F / O)"
                        value={`${metrics.male} / ${metrics.female} / ${metrics.other}`}
                        icon={User}
                        tone="blue"
                    />
                    <KpiCard
                        label="Average Patient Age"
                        value={`${metrics.averageAge} yrs`}
                        icon={Calendar}
                        tone="blue"
                    />
                </SectionWrapper>

                {/* ── 2. Filters & Toolbar Card ────────────────────────────────── */}
                <Card>
                    <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
                        {/* Search Input */}
                        <div className="relative flex-1 w-full lg:max-w-md">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <InputField
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by Patient Name, Phone, or ID..."
                                className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        fetchPatients("");
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Dropdowns & Reset */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                            <Dropdown
                                value={genderFilter}
                                onChange={(e) => setGenderFilter(e.target.value)}
                                options={[
                                    { value: "All", label: "Gender: All" },
                                    { value: "Male", label: "Male" },
                                    { value: "Female", label: "Female" },
                                    { value: "Other", label: "Other" },
                                ]}
                            />
                            <Dropdown
                                value={regionFilter}
                                onChange={(e) => setRegionFilter(e.target.value)}
                                options={uniqueRegions.map((reg) => ({
                                    value: reg,
                                    label: reg === "All" ? "Locality: All" : reg,
                                }))}
                            />
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex h-10 items-center justify-center gap-1.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-all cursor-pointer"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Reset Filters
                            </button>
                        </div>
                    </form>
                </Card>

                {/* ── 3. Patients Data Grid/Table Card ────────────────────────── */}
                <Card title={`Patients Records (${filteredPatients.length})`}>
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-sm font-semibold text-slate-600">Retrieving patient directory...</p>
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                            <Users className="w-12 h-12 text-slate-300 mb-2" />
                            <p className="text-sm font-bold text-slate-700">No patients directory records match criteria.</p>
                            <p className="text-xs text-slate-500 mt-1">Try resetting search filters or register a new patient file.</p>
                            <button
                                onClick={handleResetFilters}
                                className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
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
                                            <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">ID</th>
                                            <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Patient Details</th>
                                            <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Phone Number</th>
                                            <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Region / Locality</th>
                                            <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Last Visit</th>
                                            <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredPatients.map((p) => {
                                            const lastVisitObj = p.prescription?.slice(-1)[0];
                                            const lastVisitDate = lastVisitObj ? formatDate(lastVisitObj.createdAt) : "No visits";

                                            return (
                                                <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                                                    {/* Unique No */}
                                                    <td className="py-3.5 pr-4 text-xs font-bold text-slate-700">
                                                        #{p.uniqueno}
                                                    </td>

                                                    {/* Name, Age, Gender */}
                                                    <td className="py-3.5 pr-4 text-sm font-semibold text-slate-900">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs">
                                                                {getInitials(p.patientName)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-slate-900 font-bold">{p.patientName}</span>
                                                                <span className="text-[11px] text-slate-400 font-medium">
                                                                    {p.patientGender} • {p.patientAge} Years old
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Contact */}
                                                    <td className="py-3.5 pr-4 text-xs font-bold text-slate-700 tabular-nums">
                                                        {p.phonenumber}
                                                    </td>

                                                    {/* Region */}
                                                    <td className="py-3.5 pr-4 text-xs font-medium text-slate-600">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                            {p.region}
                                                        </div>
                                                    </td>

                                                    {/* Last Visit */}
                                                    <td className="py-3.5 pr-4 text-xs font-bold text-slate-700 whitespace-nowrap">
                                                        {lastVisitDate}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-3.5 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => {
                                                                    setNewVisitPatient(p);
                                                                    setSelectedMedicines([]);
                                                                    setVisitNote("");
                                                                }}
                                                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                                title="Record New Visit"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setHistoryPatient(p)}
                                                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                                                title="View History Timeline"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenEditProfile(p)}
                                                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                                                                title="Edit Profile"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeletingPatient(p)}
                                                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                                                title="Delete Patient Record"
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
                                {filteredPatients.map((p) => {
                                    const lastVisitObj = p.prescription?.slice(-1)[0];
                                    const lastVisitDate = lastVisitObj ? formatDate(lastVisitObj.createdAt) : "No visits";

                                    return (
                                        <div key={p._id} className="p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {getInitials(p.patientName)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-900">{p.patientName}</h4>
                                                        <p className="text-[11px] text-slate-400 font-semibold">
                                                            #{p.uniqueno} • {p.patientGender} • {p.patientAge} Yrs
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            setNewVisitPatient(p);
                                                            setSelectedMedicines([]);
                                                            setVisitNote("");
                                                        }}
                                                        className="p-2 rounded-lg text-emerald-600 bg-emerald-50"
                                                        aria-label="Add Visit"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setHistoryPatient(p)}
                                                        className="p-2 rounded-lg text-blue-600 bg-blue-50"
                                                        aria-label="View History"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEditProfile(p)}
                                                        className="p-2 rounded-lg text-slate-600 bg-slate-100"
                                                        aria-label="Edit Profile"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingPatient(p)}
                                                        className="p-2 rounded-lg text-rose-600 bg-rose-50"
                                                        aria-label="Delete Patient"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <div>
                                                    <p className="text-slate-400 font-medium">Phone</p>
                                                    <p className="font-bold text-slate-800 tabular-nums">{p.phonenumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400 font-medium">Locality</p>
                                                    <p className="font-bold text-slate-800 truncate">{p.region}</p>
                                                </div>
                                                <div className="col-span-2 pt-1 border-t border-slate-100 mt-1 flex justify-between">
                                                    <span className="text-slate-400 font-medium">Last Visit:</span>
                                                    <span className="font-bold text-slate-800">{lastVisitDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </Card>
            </div>

            {/* ── 4. PROFILE EDIT MODAL ────────────────────────────────────────── */}
            {editProfilePatient && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Edit Patient Profile</h3>
                                <p className="text-[10px] text-slate-500 font-semibold">Unique ID: #{editProfilePatient.uniqueno}</p>
                            </div>
                            <button
                                onClick={() => setEditProfilePatient(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
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
                                    onClick={() => setEditProfilePatient(null)}
                                    background="bg-slate-100! text-slate-500!"
                                    border="border-none!"
                                    className="px-4 py-2 rounded-xl text-xs font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 font-bold text-xs rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-none shadow-sm flex items-center gap-1"
                                >
                                    {isSubmitting ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 5. RECORD NEW VISIT / ADD PRESCRIPTION MODAL ────────────────── */}
            {newVisitPatient && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Record Patient Visit & Prescription</h3>
                                <p className="text-[10px] text-slate-500 font-semibold">Patient: {newVisitPatient.patientName} (ID: #{newVisitPatient.uniqueno})</p>
                            </div>
                            <button
                                onClick={() => setNewVisitPatient(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveNewVisit} className="p-5 space-y-4 overflow-y-auto flex-1">
                            {/* Medicine Search Autocomplete */}
                            <div className="relative" ref={inventorySearchRef}>
                                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 tracking-wider">Search & Add Medicine *</label>
                                <div className="relative">
                                    <InputField
                                        type="text"
                                        value={medSearchQuery}
                                        onChange={(e) => {
                                            setMedSearchQuery(e.target.value);
                                            setIsSearchingInventory(true);
                                        }}
                                        onFocus={() => setIsSearchingInventory(true)}
                                        placeholder="Type medicine name to search inventory..."
                                        icon={Search}
                                    />
                                    {loadingInventory && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>

                                {isSearchingInventory && medSearchQuery.trim() !== "" && (
                                    <div className="absolute left-0 right-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                                        {filteredMedicines.length === 0 ? (
                                            <div className="p-3 text-xs font-medium text-slate-500 text-center flex items-center justify-center gap-1">
                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                                No in-stock medicines match "{medSearchQuery}"
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-100">
                                                {filteredMedicines.map((med) => (
                                                    <button
                                                        key={med._id}
                                                        type="button"
                                                        onClick={() => handleAddMedicine(med)}
                                                        className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <Pill className="w-3.5 h-3.5 text-blue-500" />
                                                            <div>
                                                                <p className="text-slate-800 font-bold">{med.medicineName}</p>
                                                                <p className="text-[9px] text-slate-400 mt-0.5">Price: {formatCurrency(med.unitPrice)}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${med.quantity <= 15 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                                                            {med.quantity} stock
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Prescribed Medicines List Table */}
                            <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                                <th className="py-2 px-3">Medicine</th>
                                                <th className="py-2 px-3 w-28">Prescribed Qty</th>
                                                <th className="py-2 px-3 text-right">Price</th>
                                                <th className="py-2 px-3 text-right w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedMedicines.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="py-6 px-4 text-center text-slate-400 font-medium">
                                                        <ClipboardList className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                                                        No medicines prescribed yet.<br />
                                                        <span className="text-[10px] text-slate-400">Search and select medicines from the input above.</span>
                                                    </td>
                                                </tr>
                                            ) : (
                                                selectedMedicines.map((med) => {
                                                    const isExceeded = med.quantity > med.availableStock;
                                                    return (
                                                        <tr key={med._id} className="hover:bg-slate-50">
                                                            <td className="py-2.5 px-3">
                                                                <div className="font-bold text-slate-800">{med.medicineName}</div>
                                                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                                    Stock: <span className="font-bold">{med.availableStock}</span> • {formatCurrency(med.unitPrice)}/unit
                                                                </div>
                                                            </td>
                                                            <td className="py-2.5 px-3">
                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        required
                                                                        value={med.quantity}
                                                                        onChange={(e) => handleQuantityChange(med._id, e.target.value)}
                                                                        className={`w-20 px-2 py-0.5 text-xs font-semibold rounded-lg border outline-none text-slate-800 bg-white ${isExceeded ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-100" : "border-slate-200 focus:border-blue-500"}`}
                                                                    />
                                                                    {isExceeded && (
                                                                        <span className="absolute -bottom-4 left-0 text-[8px] font-semibold text-red-500 whitespace-nowrap">Exceeds stock</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-2.5 px-3 text-right font-bold text-slate-700">{formatCurrency(med.price)}</td>
                                                            <td className="py-2.5 px-3 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveMedicine(med._id)}
                                                                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
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

                                {selectedMedicines.length > 0 && (
                                    <div className="bg-slate-100/60 p-3 border-t border-slate-200 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Total Prescription Cost</span>
                                        <div className="flex items-center gap-0.5 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-xl">
                                            <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
                                            <span className="text-base font-extrabold text-blue-700 leading-none">{totalPrescriptionPrice.toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Visit treatment notes */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 tracking-wider">Treatment Notes / Instructions</label>
                                <textarea
                                    rows="3"
                                    value={visitNote}
                                    onChange={(e) => setVisitNote(e.target.value)}
                                    placeholder="Dosage directions, follow-up recommendations, or special symptoms..."
                                    className="w-full rounded-xl border border-slate-200 p-3 bg-slate-50 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all duration-150 resize-none font-medium placeholder:text-slate-400"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                                <Button
                                    type="button"
                                    onClick={() => setNewVisitPatient(null)}
                                    background="bg-slate-100! text-slate-500!"
                                    border="border-none!"
                                    className="px-4 py-2 rounded-xl text-xs font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 font-bold text-xs rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-none shadow-sm flex items-center gap-1"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Saving visit...</span>
                                        </>
                                    ) : (
                                        "Log Patient Visit"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 6. DETAILED VISIT HISTORY & TIMELINE MODAL ─────────────────── */}
            {historyPatient && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Medical Visit History</h3>
                                <p className="text-[10px] text-slate-500 font-semibold">Patient File: {historyPatient.patientName} (ID: #{historyPatient.uniqueno})</p>
                            </div>
                            <button
                                onClick={() => {
                                    setHistoryPatient(null);
                                    setEditingVisit(null);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto p-5 flex flex-col md:flex-row gap-5">
                            {/* Profile details left panel */}
                            <div className="w-full md:w-1/3 bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-3.5 h-fit shrink-0">
                                <div className="text-center">
                                    <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 border-2 border-white shadow-sm flex items-center justify-center font-bold text-lg mx-auto">
                                        {getInitials(historyPatient.patientName)}
                                    </div>
                                    <h4 className="font-bold text-slate-900 mt-2 text-sm">{historyPatient.patientName}</h4>
                                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100">Patient #{historyPatient.uniqueno}</span>
                                </div>
                                <div className="border-t border-slate-200/60 pt-3 space-y-2 text-xs font-semibold text-slate-700">
                                    <div className="flex items-center gap-2">
                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{historyPatient.patientGender} • {historyPatient.patientAge} Years</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="tabular-nums">{historyPatient.phonenumber}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="truncate">{historyPatient.region}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline visit listings right panel */}
                            <div className="flex-1 space-y-4">
                                {editingVisit ? (
                                    /* ── NESTED EDIT PRESCRIPTION FORM ── */
                                    <form onSubmit={handleSaveEditPrescription} className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 space-y-4 animate-in slide-in-from-right-2 duration-200">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                                            <h4 className="text-xs font-bold text-slate-800">Edit Prescription Details</h4>
                                            <button
                                                type="button"
                                                onClick={() => setEditingVisit(null)}
                                                className="text-[10px] font-bold text-slate-500 hover:text-slate-800"
                                            >
                                                Back to timeline
                                            </button>
                                        </div>

                                        {/* Medicine Autocomplete Search */}
                                        <div className="relative" ref={editInventorySearchRef}>
                                            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 tracking-wider">Search & Add Medicine</label>
                                            <div className="relative">
                                                <InputField
                                                    type="text"
                                                    value={editMedSearchQuery}
                                                    onChange={(e) => {
                                                        setEditMedSearchQuery(e.target.value);
                                                        setIsSearchingEditInventory(true);
                                                    }}
                                                    onFocus={() => setIsSearchingEditInventory(true)}
                                                    placeholder="Search medicine inventory..."
                                                    icon={Search}
                                                />
                                            </div>

                                            {isSearchingEditInventory && editMedSearchQuery.trim() !== "" && (
                                                <div className="absolute left-0 right-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-36 overflow-y-auto">
                                                    {filteredEditMedicines.length === 0 ? (
                                                        <div className="p-3 text-xs font-medium text-slate-500 text-center">No medicines match.</div>
                                                    ) : (
                                                        <div className="divide-y divide-slate-100">
                                                            {filteredEditMedicines.map((med) => (
                                                                <button
                                                                    key={med._id}
                                                                    type="button"
                                                                    onClick={() => handleAddEditMedicine(med)}
                                                                    className="w-full px-3 py-1.5 text-left text-xs font-semibold hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                                                                >
                                                                    <span>{med.medicineName}</span>
                                                                    <span className="text-[9px] text-slate-400">Stock: {med.quantity}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Edit Prescription Table */}
                                        <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                                                        <th className="py-2 px-2.5">Medicine</th>
                                                        <th className="py-2 px-2.5 w-24">Qty</th>
                                                        <th className="py-2 px-2.5 text-right">Price</th>
                                                        <th className="py-2 px-2.5 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {editSelectedMedicines.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="4" className="py-4 text-center text-slate-400">No medicines. Add stock items.</td>
                                                        </tr>
                                                    ) : (
                                                        editSelectedMedicines.map((med) => {
                                                            const isExceeded = med.quantity > med.availableStock;
                                                            return (
                                                                <tr key={med.medicineId}>
                                                                    <td className="py-2 px-2.5">
                                                                        <div className="font-bold text-slate-800">{med.medicineName}</div>
                                                                        <div className="text-[9px] text-slate-400 font-semibold">Max Stock limit: {med.availableStock}</div>
                                                                    </td>
                                                                    <td className="py-2 px-2.5">
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            required
                                                                            value={med.quantity}
                                                                            onChange={(e) => handleEditQuantityChange(med.medicineId, e.target.value)}
                                                                            className={`w-16 px-1.5 py-0.5 rounded border outline-none text-xs ${isExceeded ? "border-red-500 bg-red-50" : "border-slate-200"}`}
                                                                        />
                                                                    </td>
                                                                    <td className="py-2 px-2.5 text-right font-bold text-slate-700">{formatCurrency(med.price)}</td>
                                                                    <td className="py-2 px-2.5 text-right">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveEditMedicine(med.medicineId)}
                                                                            className="text-slate-400 hover:text-rose-600 p-0.5"
                                                                        >
                                                                            <X className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    )}
                                                </tbody>
                                            </table>

                                            {editSelectedMedicines.length > 0 && (
                                                <div className="bg-slate-50 p-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                                                    <span>Total Price:</span>
                                                    <span className="text-blue-700">{formatCurrency(editPrescriptionPrice)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Edit Note */}
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 tracking-wider">Dosage Instructions</label>
                                            <textarea
                                                rows="2"
                                                value={editVisitNote}
                                                onChange={(e) => setEditVisitNote(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 p-2.5 bg-white text-xs text-slate-800 outline-none focus:border-blue-500 resize-none font-medium"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => setEditingVisit(null)}
                                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5 disabled:opacity-70"
                                            >
                                                {isSubmitting ? "Saving..." : "Save Edits"}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    /* ── VISITS TIMELINE LIST ── */
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-slate-500" />
                                            Visits History ({historyPatient.prescription?.length || 0})
                                        </h4>

                                        {!historyPatient.prescription || historyPatient.prescription.length === 0 ? (
                                            <div className="py-12 text-center text-slate-400 font-semibold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                No prescription visit histories recorded.
                                            </div>
                                        ) : (
                                            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                                                {historyPatient.prescription.slice().reverse().map((visit, index) => {
                                                    const editable = isWithin24Hours(visit.createdAt);
                                                    return (
                                                        <div key={visit._id} className="relative pl-5 border-l-2 border-blue-100 last:border-l-transparent pb-1">
                                                            {/* Timeline circle node indicator */}
                                                            <div className="absolute -left-[6px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white shadow-sm" />

                                                            <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-3.5 space-y-2">
                                                                <div className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                                                                    <div>
                                                                        <p className="text-xs font-bold text-slate-800">{formatDate(visit.createdAt)}</p>
                                                                        <p className="text-[10px] text-slate-400 font-semibold">{index === 0 ? "(Initial Registration Visit)" : `(Visit #${historyPatient.prescription.length - index})`}</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                                                            {formatCurrency(visit.totalPrice)}
                                                                        </span>
                                                                        {editable && (
                                                                            <div className="flex items-center gap-0.5">
                                                                                <button
                                                                                    onClick={() => handleStartEditPrescription(visit)}
                                                                                    className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                                                    title="Edit prescription (24h limit)"
                                                                                >
                                                                                    <Edit3 className="w-3.5 h-3.5" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDeletePrescription(visit._id)}
                                                                                    className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                                                                                    title="Delete visit (24h limit)"
                                                                                >
                                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Medicines table listing */}
                                                                <div className="text-[11px] text-slate-600 space-y-1">
                                                                    <p className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Prescribed medicines</p>
                                                                    <div className="divide-y divide-slate-100">
                                                                        {visit.medicine.map((med) => (
                                                                            <div key={med._id} className="py-1 flex items-center justify-between font-semibold">
                                                                                <span className="text-slate-800">{med.medicineName}</span>
                                                                                <span className="text-slate-500">Qty: {med.quantity} • {formatCurrency(med.price)}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Notes */}
                                                                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Clinical Notes</p>
                                                                    <p className="text-xs text-slate-700 font-semibold mt-0.5 leading-snug">{visit.note}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 7. PERMANENT DELETE PATIENT ALART DIALOG ─────────────────────── */}
            <DeleteAlart
                isOpen={!!deletingPatient}
                onClose={() => setDeletingPatient(null)}
                onConfirm={handleDeletePatientConfirm}
                title="Delete Patient Record"
                message={`Are you sure you want to permanently delete patient "${deletingPatient?.patientName}"? All prescription history will be removed. If this file was created within 12 hours, quantities will automatically restore to medicine stock.`}
            />
        </PageWrapper>
    );
}
