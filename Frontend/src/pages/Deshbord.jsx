import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Pill,
    Users,
    CalendarCheck,
    IndianRupee,
    ChevronRight,
    RefreshCw,
    AlertTriangle,
    Calendar,
    BarChart3,
    Eye,
    Edit3,
    Trash2,
} from "lucide-react";
import PageWrapper from "../component/PageWrapper";
import SectionWrapper from "../component/SectionWrapper";
import Card from "../component/Deshbord/Card";
import KpiCard from "../component/Deshbord/KpiCard";
import KpiCardSkeleton from "../component/Deshbord/KpiCardSkeleton";
import TableSkeleton from "../component/Deshbord/TableSkeleton";
import HistoryTableSkeleton from "../component/Deshbord/HistoryTableSkeleton";
import DeleteAlart from "../component/DeleteAlart";
import EditProfile from "../component/Patient/EditProfile";
import ViewPatient from "../component/Deshbord/ViewPatient";
import MyDataTable from "../component/Deshbord/MyDataTable";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { useNotification } from "../hooks/showNotification";
import {
    GetDashboardStatsService,
    UpdatePatientDataService,
    EditPrescriptionInfoService,
    DeletePrescriptionService,
    DeletePatientService,
} from "../service/api/patientServices";
import { SearchMedicineService } from "../service/api/medicineServices";

export default function Dashboard() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state controllers
    const [historyPatient, setHistoryPatient] = useState(null);
    const [editProfilePatient, setEditProfilePatient] = useState(null);
    const [deletingPatient, setDeletingPatient] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit Prescription state (inside History modal)
    const [editingVisit, setEditingVisit] = useState(null);
    const [editSelectedMedicines, setEditSelectedMedicines] = useState([]);
    const [editMedSearchQuery, setEditMedSearchQuery] = useState("");
    const [editVisitNote, setEditVisitNote] = useState("");
    const [editPayAmount, setEditPayAmount] = useState("");
    const [isSearchingEditInventory, setIsSearchingEditInventory] = useState(false);
    const [medicinesInventory, setMedicinesInventory] = useState([]);
    const editInventorySearchRef = useRef(null);

    // Profile Edit state
    const [profileName, setProfileName] = useState("");
    const [profileAge, setProfileAge] = useState("");
    const [profileGender, setProfileGender] = useState("");
    const [profilePhone, setProfilePhone] = useState("");
    const [profileRegion, setProfileRegion] = useState("");

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await GetDashboardStatsService();
            setStats(data);
        } catch (err) {
            console.error("Dashboard fetch failed:", err);
            setError(err?.message || "Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
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

    // Search medicines inventory as user types in prescription edit
    useEffect(() => {
        const query = editMedSearchQuery.trim();
        if (!query) {
            setMedicinesInventory([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
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
                console.warn("Failed to search medicines inventory:", error);
                setMedicinesInventory([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [editMedSearchQuery]);

    // Handle outside click for edit inventory search dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (editInventorySearchRef.current && !editInventorySearchRef.current.contains(event.target)) {
                setIsSearchingEditInventory(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Check if prescription date is within 24 hours
    const isWithin24Hours = (dateString) => {
        if (!dateString) return true;
        const date = new Date(dateString);
        const now = new Date();
        return (now - date) < 24 * 60 * 60 * 1000;
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
            fetchStats();
        } catch (err) {
            console.error("Profile update error:", err);
            showNotification({
                title: "Update Failed",
                message: err.message || "Failed to update patient profile.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── EDIT PRESCRIPTION ACTIONS ──────────────────────────────────── */
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
                availableStock: med.quantity,
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
                    const finalQty = qty === "" ? "" : Math.max(0, qty);
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
        setEditPayAmount(visit.payamount !== undefined && visit.payamount !== null ? visit.payamount : (visit.totalPrice || ""));

        const mapped = (visit.medicine || []).map((m) => {
            const invDoc = medicinesInventory.find((inv) => inv._id === m.medicineId);
            const unitPrice = invDoc ? invDoc.unitPrice : (m.price / m.quantity) || 0;
            const availableStock = invDoc ? invDoc.quantity : 100;

            return {
                medicineId: m.medicineId,
                medicineName: m.medicineName,
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

        const exceeded = editSelectedMedicines.find((m) => {
            const invDoc = medicinesInventory.find((inv) => inv._id === m.medicineId);
            const originalQty = editingVisit.medicine?.find((om) => om.medicineId === m.medicineId)?.quantity || 0;
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
                    payamount: editPayAmount !== "" ? Number(editPayAmount) : editPrescriptionPrice,
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

            if (response && response.patient) {
                setHistoryPatient(response.patient);
            }
            setEditingVisit(null);
            fetchStats();
        } catch (err) {
            console.error("Prescription update error:", err);
            showNotification({
                title: "Update Failed",
                message: err.message || "Failed to update prescription details.",
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
                setHistoryPatient(null);
            } else if (response && response.patient) {
                setHistoryPatient(response.patient);
            }
            fetchStats();
        } catch (err) {
            console.error("Failed to delete prescription:", err);
            showNotification({
                title: "Delete Failed",
                message: err.message || "Failed to delete prescription.",
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
            fetchStats();
        } catch (err) {
            console.error("Patient delete error:", err);
            showNotification({
                title: "Delete Failed",
                message: err.message || "Failed to delete patient record.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── KPI card definitions ─────────────────────────────────────────── */
    const kpiCards = stats
        ? [
            {
                label: "Total Medicines",
                value: stats.totalMedicines.toLocaleString("en-IN"),
                icon: Pill,
                tone: "blue",
            },
            {
                label: "Total Patients",
                value: stats.totalPatients.toLocaleString("en-IN"),
                icon: Users,
                tone: "blue",
            },
            {
                label: "Today's Patients",
                value: stats.todaysPatients.toLocaleString("en-IN"),
                icon: CalendarCheck,
                tone: "green",
            },
            {
                label: "Monthly Revenue",
                value: formatCurrency(stats.monthlyRevenue),
                icon: IndianRupee,
                tone: "blue",
            },
        ]
        : [];

    /* ── Error state ──────────────────────────────────────────────────── */
    if (!loading && error) {
        return (
            <PageWrapper title="Dashboard" subtitle="Here's what's happening at your clinic today.">
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
                        <AlertTriangle className="w-7 h-7 text-rose-500" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Failed to load dashboard</p>
                    <p className="text-xs text-slate-400 max-w-xs text-center">{error}</p>
                    <button
                        onClick={fetchStats}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry
                    </button>
                </div>
            </PageWrapper>
        );
    }

    /* ── Helper ───────────────────────────────────────────────────────── */
    function getInitials(name) {
        return (name || "?")
            .split(" ")
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase())
            .join("");
    }

    function TextLink({ label, onClick }) {
        return (
            <button
                type="button"
                onClick={onClick}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
                {label}
                <ChevronRight className="h-3.5 w-3.5" />
            </button>
        );
    }

    /* ── Render ───────────────────────────────────────────────────────── */
    return (
        <PageWrapper
            title="Dashboard"
            subtitle="Here's what's happening at your clinic today."
        >
            <div className="flex flex-col gap-5 sm:gap-6 lg:gap-8">

                {/* ── Row 1: KPI Cards ──────────────────────────────────── */}
                <SectionWrapper
                    aria-label="Key metrics"
                    className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
                        : kpiCards.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)
                    }
                </SectionWrapper>

                {/* ── Row 2: Today's Patients ───────────────────────────── */}
                <SectionWrapper>
                    <Card
                        title="Today's Patients"
                        subtitle="Patients who visited today"
                        action={<TextLink label="View all" onClick={() => navigate("/all-pationt")} />}
                    >
                        {loading ? (
                            <TableSkeleton rows={5} />
                        ) : !stats?.todaysPatientsData?.length ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                                <CalendarCheck className="w-9 h-9 text-slate-200" />
                                <p className="text-sm font-semibold">No patients today</p>
                                <p className="text-xs text-center">Add a patient or prescribe a visit to see data here.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto -mx-2 sm:mx-0">
                                <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">
                                            <th className="py-2.5 px-3">Patient</th>
                                            <th className="py-2.5 px-3">ID</th>
                                            <th className="py-2.5 px-3">Contact</th>
                                            <th className="py-2.5 px-3">Visits</th>
                                            <th className="py-2.5 px-3 text-right">Pay Amount</th>
                                            <th className="py-2.5 px-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {stats.todaysPatientsData.map((p) => {
                                            const payAmount = (p.prescription || []).reduce(
                                                (sum, pres) => sum + (pres.payamount !== undefined && pres.payamount !== null ? pres.payamount : (pres.totalPrice || 0)),
                                                0
                                            );
                                            const lastVisitObj = p.prescription?.slice(-1)[0];
                                            const lastVisitDateVal = lastVisitObj?.createdAt || lastVisitObj?.date || p.createdAt;
                                            const isDeletable = lastVisitDateVal
                                                ? (new Date() - new Date(lastVisitDateVal)) / (1000 * 60 * 60) < 12
                                                : false;

                                            return (
                                                <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="py-3 px-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-[10px] shrink-0">
                                                                {getInitials(p.patientName)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900">{p.patientName}</p>
                                                                <p className="text-[10px] text-slate-400 font-medium">
                                                                    {p.patientGender} • {p.patientAge} yrs
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 font-bold text-slate-700 whitespace-nowrap">#{p.uniqueno}</td>
                                                    <td className="py-3 px-3 text-slate-600 tabular-nums whitespace-nowrap">{p.phonenumber}</td>
                                                    <td className="py-3 px-3 whitespace-nowrap">
                                                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-100">
                                                            {(p.prescription || []).length} visits
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 text-right font-bold text-slate-800 whitespace-nowrap">
                                                        {formatCurrency(payAmount)}
                                                    </td>
                                                    <td className="py-3 px-3 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => setHistoryPatient(p)}
                                                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                                                title="View History Timeline"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenEditProfile(p)}
                                                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                                                title="Edit Profile"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                            {isDeletable && (
                                                                <button
                                                                    onClick={() => setDeletingPatient(p)}
                                                                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
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
                        )}
                    </Card>
                </SectionWrapper>

                {/* ── Row 3: Monthly + Yearly Historical Data ───────────── */}
                <SectionWrapper className="grid grid-cols-1 gap-5 lg:gap-6 xl:grid-cols-2">

                    {/* Monthly Data */}
                    <Card
                        title="Monthly History"
                        subtitle="Revenue and patient counts grouped by month"
                    >
                        {loading ? (
                            <HistoryTableSkeleton cols={4} rows={6} />
                        ) : !stats?.monthlyData?.length ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                                <Calendar className="w-9 h-9 text-slate-200" />
                                <p className="text-sm font-semibold">No monthly data yet</p>
                                <p className="text-xs">Data will appear after your first patient visit.</p>
                            </div>
                        ) : (
                            <MyDataTable
                                data={stats.monthlyData}
                                type="month"
                            />
                        )}
                    </Card>

                    {/* Yearly Data */}
                    <Card
                        title="Yearly History"
                        subtitle="Revenue and patient counts grouped by year"
                    >
                        {loading ? (
                            <HistoryTableSkeleton cols={4} rows={4} />
                        ) : !stats?.yearlyData?.length ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                                <BarChart3 className="w-9 h-9 text-slate-200" />
                                <p className="text-sm font-semibold">No yearly data yet</p>
                                <p className="text-xs">Data will appear after your first patient visit.</p>
                            </div>
                        ) : (
                            <MyDataTable
                                data={stats.yearlyData}
                                type="year"
                            />
                        )}
                    </Card>

                </SectionWrapper>

            </div>

            {/* ── PROFILE EDIT MODAL ────────────────────────────────────────── */}
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

            {/* ── DETAILED VISIT HISTORY & TIMELINE MODAL ─────────────────── */}
            <ViewPatient
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
                handleRemoveEditMedicine={handleRemoveEditMedicine}
                editPrescriptionPrice={editPrescriptionPrice}
                editVisitNote={editVisitNote}
                setEditVisitNote={setEditVisitNote}
                editPayAmount={editPayAmount}
                setEditPayAmount={setEditPayAmount}
                isSubmitting={isSubmitting}
                isWithin24Hours={isWithin24Hours}
                handleStartEditPrescription={handleStartEditPrescription}
                handleDeletePrescription={handleDeletePrescription}
            />

            {/* ── PERMANENT DELETE PATIENT ALERT DIALOG ─────────────────────── */}
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