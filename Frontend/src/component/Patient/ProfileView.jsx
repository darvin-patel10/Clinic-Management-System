import React from "react";
import { X, User, Phone, MapPin, Search, Clock, Edit3, Trash2, ClipboardList, Calendar } from "lucide-react";
import InputField from "../InputField";
import { formatCurrency as defaultFormatCurrency, formatDate as defaultFormatDate } from "../../utils/formatters";

const defaultGetInitials = (name = "") => {
    return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
};

const defaultIsWithin24Hours = (dateString) => {
    if (!dateString) return false;
    const visitDate = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - visitDate) / (1000 * 60 * 60);
    return diffInHours <= 24 && diffInHours >= 0;
};

export default function ProfileView({
    historyPatient,
    setHistoryPatient,
    editingVisit,
    setEditingVisit,
    handleSaveEditPrescription,
    editInventorySearchRef,
    editMedSearchQuery,
    setEditMedSearchQuery,
    setIsSearchingEditInventory,
    isSearchingEditInventory,
    filteredEditMedicines = [],
    handleAddEditMedicine,
    editSelectedMedicines = [],
    handleEditQuantityChange,
    formatCurrency = defaultFormatCurrency,
    handleRemoveEditMedicine,
    editPrescriptionPrice,
    editVisitNote,
    setEditVisitNote,
    isSubmitting,
    isWithin24Hours = defaultIsWithin24Hours,
    formatDate = defaultFormatDate,
    getInitials = defaultGetInitials,
    handleStartEditPrescription,
    handleDeletePrescription,
}) {
    if (!historyPatient) return null;

    const handleCloseModal = () => {
        setHistoryPatient(null);
        setEditingVisit(null);
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 z-50 animate-in fade-in duration-200 overflow-y-auto"
            onClick={(e) => {
                if (e.target === e.currentTarget) handleCloseModal();
            }}
        >
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg md:max-w-4xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col border border-slate-100 transition-all transform duration-200 my-auto">
                {/* Modal Header */}
                <div className="p-3.5 sm:p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0 gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-2xs">
                            <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate tracking-tight">
                                Medical Visit History
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] sm:text-[11px] font-bold shrink-0">
                                    #{historyPatient.uniqueno}
                                </span>
                                <span className="text-slate-400 text-xs">•</span>
                                <span className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                                    {historyPatient.patientName}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleCloseModal}
                        className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 active:scale-95 cursor-pointer transition-all shrink-0"
                        aria-label="Close Modal"
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 flex flex-col md:flex-row gap-4 sm:gap-5 custom-scrollbar">
                    {/* Patient Details Left Panel (Compact on Mobile, Full column on md+) */}
                    <div className="w-full md:w-64 lg:w-72 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 space-y-3 shrink-0">
                        <div className="flex md:flex-col items-center gap-3 text-left md:text-center min-w-0">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 flex items-center justify-center font-bold text-sm md:text-xl shrink-0">
                                {getInitials(historyPatient.patientName)}
                            </div>
                            <div className="min-w-0 flex-1 md:flex-none">
                                <h4 className="font-bold text-slate-900 text-sm md:text-base truncate">{historyPatient.patientName}</h4>
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                    Patient #{historyPatient.uniqueno}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-slate-200/60 pt-3 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-2 text-xs font-semibold text-slate-700">
                            <div className="flex items-center gap-2 bg-white md:bg-transparent p-2 md:p-0 rounded-xl md:rounded-none border border-slate-100 md:border-none min-w-0">
                                <User className="w-4 h-4 text-blue-500 shrink-0" />
                                <span className="truncate">{historyPatient.patientGender} • {historyPatient.patientAge} Yrs</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white md:bg-transparent p-2 md:p-0 rounded-xl md:rounded-none border border-slate-100 md:border-none min-w-0">
                                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span className="tabular-nums truncate">{historyPatient.phonenumber}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white md:bg-transparent p-2 md:p-0 rounded-xl md:rounded-none border border-slate-100 md:border-none min-w-0 sm:col-span-1 md:col-span-1">
                                <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                                <span className="truncate">{historyPatient.region}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Visit Listings Right Panel */}
                    <div className="flex-1 min-w-0 space-y-4">
                        {editingVisit ? (
                            /* ── NESTED EDIT PRESCRIPTION FORM ── */
                            <form onSubmit={handleSaveEditPrescription} className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-4 animate-in slide-in-from-right-2 duration-200">
                                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                                        Edit Prescription Details
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => setEditingVisit(null)}
                                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                    >
                                        ← Back to timeline
                                    </button>
                                </div>

                                {/* Medicine Autocomplete Search */}
                                <div className="relative" ref={editInventorySearchRef}>
                                    <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase mb-1 tracking-wider">Search & Add Medicine</label>
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
                                            className="h-10"
                                        />
                                    </div>

                                    {isSearchingEditInventory && editMedSearchQuery.trim() !== "" && (
                                        <div className="absolute left-0 right-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-40 overflow-y-auto custom-scrollbar">
                                            {filteredEditMedicines.length === 0 ? (
                                                <div className="p-3 text-xs font-medium text-slate-500 text-center">No medicines match query.</div>
                                            ) : (
                                                <div className="divide-y divide-slate-100">
                                                    {filteredEditMedicines.map((med) => (
                                                        <button
                                                            key={med._id}
                                                            type="button"
                                                            onClick={() => handleAddEditMedicine(med)}
                                                            className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                                                        >
                                                            <span className="text-slate-800 truncate">{med.medicineName}</span>
                                                            <span className="text-[10px] text-slate-400 font-bold shrink-0 ml-2">Stock: {med.quantity}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Edit Prescription Table */}
                                <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse min-w-[280px]">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                                    <th className="py-2.5 px-3">Medicine</th>
                                                    <th className="py-2.5 px-3 w-20 sm:w-24">Qty</th>
                                                    <th className="py-2.5 px-3 text-right">Price</th>
                                                    <th className="py-2.5 px-2 w-8"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {editSelectedMedicines.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="py-6 text-center text-xs text-slate-400 font-semibold">
                                                            No medicines prescribed. Search and add inventory items.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    editSelectedMedicines.map((med) => {
                                                        const isExceeded = med.quantity > med.availableStock;
                                                        return (
                                                            <tr key={med.medicineId} className="hover:bg-slate-50/50">
                                                                <td className="py-2.5 px-3">
                                                                    <div className="font-bold text-slate-800">{med.medicineName}</div>
                                                                    <div className="text-[9px] text-slate-400 font-semibold">Max Stock: {med.availableStock}</div>
                                                                </td>
                                                                <td className="py-2.5 px-3">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        required
                                                                        value={med.quantity}
                                                                        onChange={(e) => handleEditQuantityChange(med.medicineId, e.target.value)}
                                                                        className={`w-14 sm:w-16 px-2 py-1 rounded-lg border outline-none text-xs font-bold text-center ${isExceeded ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 focus:bg-white"}`}
                                                                    />
                                                                </td>
                                                                <td className="py-2.5 px-3 text-right font-bold text-slate-800 tabular-nums">
                                                                    {formatCurrency(med.price)}
                                                                </td>
                                                                <td className="py-2.5 px-2 text-right">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveEditMedicine(med.medicineId)}
                                                                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                                                                        title="Remove item"
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
                                    </div>

                                    {editSelectedMedicines.length > 0 && (
                                        <div className="bg-slate-50/90 p-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-800">
                                            <span>Total Prescription Amount:</span>
                                            <span className="text-blue-700 text-sm tabular-nums">{formatCurrency(editPrescriptionPrice)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Edit Note */}
                                <div>
                                    <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase mb-1 tracking-wider">Clinical Notes / Dosage</label>
                                    <textarea
                                        rows="2"
                                        value={editVisitNote}
                                        onChange={(e) => setEditVisitNote(e.target.value)}
                                        placeholder="Add dosage guidelines or notes..."
                                        className="w-full rounded-xl border border-slate-200 p-2.5 bg-white text-xs text-slate-800 outline-none focus:border-blue-500 resize-none font-medium"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80">
                                    <button
                                        type="button"
                                        onClick={() => setEditingVisit(null)}
                                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-1.5 disabled:opacity-75 cursor-pointer shadow-sm active:scale-95"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            "Save Edits"
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* ── VISITS TIMELINE LIST ── */
                            <div className="space-y-3.5">
                                <h4 className="font-bold text-xs sm:text-sm text-slate-800 border-b border-slate-100 pb-2.5 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        Visits History
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                        {historyPatient.prescription?.length || 0} Total Visits
                                    </span>
                                </h4>

                                {!historyPatient.prescription || historyPatient.prescription.length === 0 ? (
                                    <div className="py-12 text-center text-slate-400 font-semibold bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                                        No prescription visit histories recorded for this patient.
                                    </div>
                                ) : (
                                    <div className="space-y-3.5 max-h-[50vh] sm:max-h-[55vh] md:max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                                        {historyPatient.prescription.slice().reverse().map((visit, index) => {
                                            const editable = isWithin24Hours(visit.createdAt);
                                            return (
                                                <div key={visit._id} className="relative pl-5 border-l-2 border-blue-100 last:border-l-transparent pb-1">
                                                    {/* Timeline node indicator */}
                                                    <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white shadow-xs" />

                                                    <div className="bg-white border border-slate-200/80 shadow-xs hover:shadow-sm transition-all rounded-2xl p-3.5 space-y-3">
                                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                                                    <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                                    {formatDate(visit.createdAt)}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                                                    {index === 0 ? "(Initial Registration Visit)" : `(Visit #${historyPatient.prescription.length - index})`}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100/80 tabular-nums">
                                                                    {formatCurrency(visit.totalPrice)}
                                                                </span>
                                                                {editable && (
                                                                    <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-100">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleStartEditPrescription(visit)}
                                                                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-white rounded-md transition-colors cursor-pointer"
                                                                            title="Edit prescription (24h limit)"
                                                                        >
                                                                            <Edit3 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDeletePrescription(visit._id)}
                                                                            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-white rounded-md transition-colors cursor-pointer"
                                                                            title="Delete visit (24h limit)"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Medicines table listing */}
                                                        <div className="text-xs text-slate-600 space-y-1.5">
                                                            <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Prescribed Medicines</p>
                                                            <div className="divide-y divide-slate-100 bg-slate-50/60 rounded-xl border border-slate-100 px-3 py-1">
                                                                {visit.medicine.map((med) => (
                                                                    <div key={med._id} className="py-1.5 flex items-center justify-between font-semibold text-xs">
                                                                        <span className="text-slate-800 truncate pr-2">{med.medicineName}</span>
                                                                        <span className="text-slate-500 text-[11px] shrink-0">
                                                                            Qty: {med.quantity} • {formatCurrency(med.price)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Clinical Notes */}
                                                        {visit.note && (
                                                            <div className="bg-blue-50/40 p-2.5 rounded-xl border border-blue-100/60 mt-1">
                                                                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Clinical Notes</p>
                                                                <p className="text-xs text-slate-700 font-medium mt-0.5 leading-snug">{visit.note}</p>
                                                            </div>
                                                        )}
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
    );
}
