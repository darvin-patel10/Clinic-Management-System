import React from "react";
import { X, Search, Clock, Edit3, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function ViewPatient({
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
    filteredEditMedicines,
    handleAddEditMedicine,
    editSelectedMedicines,
    handleEditQuantityChange,
    handleRemoveEditMedicine,
    editPrescriptionPrice,
    editVisitNote,
    setEditVisitNote,
    isSubmitting,
    isWithin24Hours,
    handleStartEditPrescription,
    handleDeletePrescription,
}) {
    if (!historyPatient) return null;

    const handleClose = () => {
        if (setEditingVisit) setEditingVisit(null);
        if (setHistoryPatient) setHistoryPatient(null);
    };

    const isWithin12Hours = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        return diffInHours < 12;
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">Patient Clinical History</h3>
                        <p className="text-[10px] text-slate-500 font-semibold">
                            {historyPatient.patientName} (#{historyPatient.uniqueno}) • {historyPatient.phonenumber}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto flex-1 space-y-4">
                    {/* Summary info cards */}
                    <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Demographics</p>
                            <p className="font-bold text-slate-800">{historyPatient.patientGender}, {historyPatient.patientAge} Yrs</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Locality</p>
                            <p className="font-bold text-slate-800 truncate">{historyPatient.region}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Visits</p>
                            <p className="font-bold text-blue-600">{historyPatient.prescription?.length || 0} visits</p>
                        </div>
                    </div>

                    {/* Editing Visit inline form or Visits List */}
                    {editingVisit ? (
                        <form onSubmit={handleSaveEditPrescription} className="bg-slate-50 border border-blue-200 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <h4 className="font-bold text-xs text-blue-800">
                                    Editing Prescription ({formatDate(editingVisit.createdAt)})
                                </h4>
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    Within 12h Window
                                </span>
                            </div>

                            {/* Medicine Search Autocomplete */}
                            <div className="relative" ref={editInventorySearchRef}>
                                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 tracking-wider">Search & Add Medicine</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={editMedSearchQuery}
                                        onChange={(e) => {
                                            setEditMedSearchQuery(e.target.value);
                                            setIsSearchingEditInventory(true);
                                        }}
                                        onFocus={() => setIsSearchingEditInventory(true)}
                                        placeholder="Search medicine to add to visit..."
                                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
                                    />
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                </div>

                                {isSearchingEditInventory && editMedSearchQuery.trim() !== "" && (
                                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-36 overflow-y-auto">
                                        {filteredEditMedicines.length === 0 ? (
                                            <div className="p-2 text-xs text-slate-500 text-center">No medicines match</div>
                                        ) : (
                                            filteredEditMedicines.map((med) => (
                                                <button
                                                    key={med._id}
                                                    type="button"
                                                    onClick={() => handleAddEditMedicine(med)}
                                                    className="w-full px-3 py-1.5 text-left text-xs font-semibold hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                                                >
                                                    <span>{med.medicineName}</span>
                                                    <span className="text-[10px] text-slate-400">Stock: {med.quantity} • {formatCurrency(med.unitPrice)}</span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Prescribed medicines list */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                                            <th className="py-1.5 px-2.5">Medicine</th>
                                            <th className="py-1.5 px-2.5 w-24">Qty</th>
                                            <th className="py-1.5 px-2.5 text-right">Price</th>
                                            <th className="py-1.5 px-2.5 w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {editSelectedMedicines.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-3 text-center text-slate-400 text-xs">No medicines in prescription</td>
                                            </tr>
                                        ) : (
                                            editSelectedMedicines.map((med) => {
                                                const isExceeded = med.quantity > med.availableStock;
                                                return (
                                                    <tr key={med.medicineId}>
                                                        <td className="py-2 px-2.5 font-bold text-slate-800">
                                                            {med.medicineName}
                                                            <div className="text-[9px] text-slate-400 font-medium">
                                                                Stock limit: {med.availableStock}
                                                            </div>
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
                                                                className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
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
                                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5 disabled:opacity-70 cursor-pointer"
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
                                        const editable = isWithin12Hours(visit.createdAt || visit.date);
                                        return (
                                            <div key={visit._id} className="relative pl-5 border-l-2 border-blue-100 last:border-l-transparent pb-1">
                                                <div className="absolute -left-[6px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white shadow-sm" />

                                                <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-3.5 space-y-2">
                                                    <div className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800">{formatDate(visit.createdAt)}</p>
                                                            <p className="text-[10px] text-slate-400 font-semibold">
                                                                {index === 0 ? "(Initial Registration Visit)" : `(Visit #${historyPatient.prescription.length - index})`}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                                                {formatCurrency(visit.totalPrice)}
                                                            </span>
                                                            {editable && (
                                                                <div className="flex items-center gap-0.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleStartEditPrescription && handleStartEditPrescription(visit)}
                                                                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                                                        title="Edit prescription (Available for 12 hours after visit)"
                                                                    >
                                                                        <Edit3 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeletePrescription && handleDeletePrescription(visit._id)}
                                                                        className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                                                        title="Delete visit (Available for 12 hours after visit)"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="text-[11px] text-slate-600 space-y-1">
                                                        <p className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Prescribed medicines</p>
                                                        <div className="divide-y divide-slate-100">
                                                            {(visit.medicine || []).map((med) => (
                                                                <div key={med._id || med.medicineId} className="py-1 flex items-center justify-between font-semibold">
                                                                    <span className="text-slate-800">{med.medicineName}</span>
                                                                    <span className="text-slate-500">Qty: {med.quantity} • {formatCurrency(med.price)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

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
    );
}
