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
    PatientsService,
    SearchPatientService,
    UpdatePatientDataService,
    EditPrescriptionInfoService,
    DeletePrescriptionService,
    DeletePatientService
} from "../../service/api/patientServices";
import { SearchMedicineService } from "../../service/api/medicineServices";
import SectionWrapper from "../../component/SectionWrapper";
import EditProfile from "../../component/Patient/EditProfile";
import ProfileView from "../../component/Patient/ProfileView";


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
    const [editProfilePatient, setEditProfilePatient] = useState(null);
    const [deletingPatient, setDeletingPatient] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Inventory State
    const [medicinesInventory, setMedicinesInventory] = useState([]);
    const [loadingInventory, setLoadingInventory] = useState(false);

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
            const trimmedQuery = queryParam.trim();
            let response;

            if (trimmedQuery) {
                let params = {};
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
                response = await SearchPatientService(params);
            } else {
                response = await PatientsService();
            }

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

    // Load patients on mount & debounced search when searchQuery changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPatients(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Search medicines inventory as user types in prescription edit
    useEffect(() => {
        const query = editMedSearchQuery.trim();
        if (!query) {
            setMedicinesInventory([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setLoadingInventory(true);
            try {
                const response = await SearchMedicineService(query);
                if (response && response.medicines && response.medicines.length > 0) {
                    setMedicinesInventory(response.medicines);
                } else if (response && response.medicine && response.medicine.length > 0) {
                    setMedicinesInventory(response.medicine);
                } else {
                    setMedicinesInventory([]);
                }
            } catch (error) {
                console.warn("Failed to search medicines from API:", error);
                setMedicinesInventory([]);
            } finally {
                setLoadingInventory(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [editMedSearchQuery]);

    // Handle outside clicks for autocomplete search dropdowns
    useEffect(() => {
        function handleClickOutside(event) {
            if (editInventorySearchRef.current && !editInventorySearchRef.current.contains(event.target)) {
                setIsSearchingEditInventory(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Prevent body scrolling when any modal is open
    useEffect(() => {
        const isModalOpen = Boolean(historyPatient || editProfilePatient || deletingPatient);
        if (isModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [historyPatient, editProfilePatient, deletingPatient]);

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



    /* ── EDIT PRESCRIPTION (timeline visit) ACTIONS ─────────────────────── */
    const filteredEditMedicines = useMemo(() => {
        return medicinesInventory.filter((med) => {
            const alreadyAdded = editSelectedMedicines.some((sm) => sm.medicineId === med._id);
            return !alreadyAdded;
        });
    }, [medicinesInventory, editSelectedMedicines]);

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
            <div className="flex flex-col gap-4 sm:gap-6">
                {/* ── 1. KPI Cards Row ────────────────────────────────────────── */}
                <SectionWrapper className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                    <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1 w-full lg:max-w-md">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <InputField
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by Patient Name, Phone, or ID..."
                                className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        fetchPatients("");
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                                    aria-label="Clear search"
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
                                className="inline-flex h-10 items-center justify-center gap-1.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-all cursor-pointer w-full sm:w-auto shrink-0"
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
                                className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* ── Desktop & Tablet Table View (md+) ────────────────────── */}
                            <div className="hidden md:block overflow-x-auto -mx-1">
                                <table className="w-full border-collapse text-left min-w-[700px]">
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
                                            const lastVisitTime = lastVisitObj?.createdAt || lastVisitObj?.date || p.createdAt;
                                            const isDeletable = lastVisitTime
                                                ? (new Date() - new Date(lastVisitTime)) / (1000 * 60 * 60) < 12
                                                : false;

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
                                                            {isDeletable && (
                                                                <button
                                                                    onClick={() => setDeletingPatient(p)}
                                                                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                                                    title="Delete Patient Record (Available for 12 hours after last visit)"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Mobile Card View (< md) ──────────────────────────────── */}
                            <div className="block md:hidden space-y-3 -mx-1 sm:mx-0">
                                {filteredPatients.map((p) => {
                                    const lastVisitObj = p.prescription?.slice(-1)[0];
                                    const lastVisitDate = lastVisitObj ? formatDate(lastVisitObj.createdAt) : "No visits";
                                    const lastVisitTime = lastVisitObj?.createdAt || lastVisitObj?.date || p.createdAt;
                                    const isDeletable = lastVisitTime
                                        ? (new Date() - new Date(lastVisitTime)) / (1000 * 60 * 60) < 12
                                        : false;

                                    return (
                                        <div
                                            key={p._id}
                                            className="bg-white rounded-2xl border border-slate-200/90 p-2 shadow-sm hover:shadow-md transition-all duration-200 space-y-3.5 min-w-0 relative overflow-hidden"
                                        >
                                            {/* Header: Avatar, Name, Badges & Actions */}
                                            <div className="flex items-start justify-between gap-1">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {getInitials(p.patientName)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-bold text-slate-900 truncate tracking-tight">
                                                                {p.patientName}
                                                            </h4>
                                                            <span className="p-1 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-md text-[8px] font-bold shrink-0">
                                                                #{p.uniqueno}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px]">
                                                                {p.patientGender}
                                                            </span>
                                                            <span>•</span>
                                                            <span className="text-slate-600">{p.patientAge} Yrs</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action buttons */}
                                                <div className="flex items-center gap-1 shrink-0 bg-slate-50 p-0.5 rounded-xl border border-slate-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => setHistoryPatient(p)}
                                                        className="p-1 rounded-lg text-blue-600 bg-white hover:bg-blue-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
                                                        aria-label="View History"
                                                        title="View History Timeline"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditProfile(p)}
                                                        className="p-1 rounded-lg text-slate-600 bg-white hover:bg-slate-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
                                                        aria-label="Edit Profile"
                                                        title="Edit Profile"
                                                    >
                                                        <Edit3 className="w-3 h-3" />
                                                    </button>
                                                    {isDeletable && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingPatient(p)}
                                                            className="p-1 rounded-lg text-rose-600 bg-white hover:bg-rose-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
                                                            aria-label="Delete Patient"
                                                            title="Delete Patient Record (Available for 12 hours after last visit)"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Details Section */}
                                            <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                                                <div className="flex items-start gap-2 min-w-0">
                                                    <Phone className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Phone</p>
                                                        <p className="font-bold text-[10px] text-slate-800 tabular-nums mt-0.5 truncate">{p.phonenumber}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2 min-w-0">
                                                    <MapPin className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Locality</p>
                                                        <p className="font-bold text-[10px] text-slate-800 truncate mt-0.5">{p.region}</p>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                                                        <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Last Visit</span>
                                                    </div>
                                                    <span className="font-bold text-slate-800 text-[9px] bg-white px-2.5 py-0.5 rounded-lg border border-slate-200/70 shadow-2xs">
                                                        {lastVisitDate}
                                                    </span>
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
            <EditProfile
                editProfilePatient={editProfilePatient}
                setEditProfilePatient={setEditProfilePatient}
                handleSaveProfile={handleSaveProfile}
                profileName={profileName}
                setProfileName={setProfileName}
                profilePhone={profilePhone}
                setProfilePhone={setProfilePhone}
                profileAge={profileAge}
                setProfileAge={setProfileAge}
                profileGender={profileGender}
                setProfileGender={setProfileGender}
                profileRegion={profileRegion}
                setProfileRegion={setProfileRegion}
                isSubmitting={isSubmitting}
            />



            {/* ── 6. DETAILED VISIT HISTORY & TIMELINE MODAL ─────────────────── */}
            <ProfileView
                historyPatient={historyPatient}
                setHistoryPatient={setHistoryPatient}
                editingVisit={editingVisit}
                setEditingVisit={setEditingVisit}
                handleSaveEditPrescription={handleSaveEditPrescription}
                editInventorySearchRef={editInventorySearchRef}
                editMedSearchQuery={editMedSearchQuery}
                setEditMedSearchQuery={setEditMedSearchQuery}
                setIsSearchingEditInventory={setIsSearchingEditInventory}
                isSearchingEditInventory={isSearchingEditInventory}
                filteredEditMedicines={filteredEditMedicines}
                handleAddEditMedicine={handleAddEditMedicine}
                editSelectedMedicines={editSelectedMedicines}
                handleEditQuantityChange={handleEditQuantityChange}
                formatCurrency={formatCurrency}
                handleRemoveEditMedicine={handleRemoveEditMedicine}
                editPrescriptionPrice={editPrescriptionPrice}
                editVisitNote={editVisitNote}
                setEditVisitNote={setEditVisitNote}
                isSubmitting={isSubmitting}
                isWithin24Hours={isWithin24Hours}
                formatDate={formatDate}
                getInitials={getInitials}
                handleStartEditPrescription={handleStartEditPrescription}
                handleDeletePrescription={handleDeletePrescription}
            />

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
