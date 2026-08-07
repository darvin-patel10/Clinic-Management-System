import React, { useEffect, useState } from "react";
import {
    Printer,
    X,
    Building2,
    User,
    Phone,
    MapPin,
    Calendar,
    Pill,
    IndianRupee,
    BadgeCheck,
    Stethoscope,
    FileText,
    CheckCircle2,
    Clock,
    Sparkles,
    ShieldCheck
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { GetMeService } from "../../service/api/authServices.js";

const PRINT_STYLES = `
@media print {
    body * {
        visibility: hidden;
    }
    #printable-invoice-modal,
    #printable-invoice-modal * {
        visibility: visible;
    }
    #printable-invoice-modal {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        margin: 0;
        padding: 0;
        background: white !important;
        box-shadow: none !important;
    }
    .no-print {
        display: none !important;
    }
    .print-card {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
    }
}
`;

export default function Invoice({ isOpen, onClose, invoiceData }) {
    const [meData, setMeData] = useState(null);

    console.log("invoiceData--------------", invoiceData);

    // Fetch GetMe API data whenever modal opens and log response
    useEffect(() => {
        if (isOpen) {
            GetMeService()
                .then((res) => {
                    console.log("GetMe API data in Invoice:", res);
                    setMeData(res);
                })
                .catch((err) => {
                    console.error("Failed to fetch GetMe API data in Invoice:", err);
                });
        }
    }, [isOpen]);

    // Inject print keyframes/styles dynamically
    useEffect(() => {
        if (!document.getElementById("invoice-print-styles")) {
            const style = document.createElement("style");
            style.id = "invoice-print-styles";
            style.textContent = PRINT_STYLES;
            document.head.appendChild(style);
        }
    }, []);

    if (!isOpen || !invoiceData) return null;

    // Extract patient document if invoiceData is a raw API response object ({ message, patient: { ... } }) or a direct patient object
    const patientDoc = (invoiceData?.patient && typeof invoiceData.patient === "object" && invoiceData.patient.patientName)
        ? invoiceData.patient
        : (invoiceData?.patientName ? invoiceData : null);

    // Get all prescriptions from patient document
    const prescriptions = (patientDoc?.prescription && Array.isArray(patientDoc.prescription))
        ? patientDoc.prescription
        : [];

    const targetPrescriptionId = invoiceData?.targetPrescriptionId || invoiceData?.prescriptionId;

    // Get the active/target prescription (or default to the latest visit prescription)
    const latestPrescription = targetPrescriptionId
        ? (prescriptions.find((p) => String(p._id) === String(targetPrescriptionId)) || prescriptions[prescriptions.length - 1])
        : (prescriptions.length > 0 ? prescriptions[prescriptions.length - 1] : null);

    // Resolve patient details using API response or custom invoice object fallback
    const patient = patientDoc ? {
        patientName: patientDoc.patientName || "",
        patientAge: patientDoc.patientAge || "",
        patientGender: patientDoc.patientGender || "",
        phonenumber: patientDoc.phonenumber || "",
        region: patientDoc.region || "",
        uniqueno: patientDoc.uniqueno || ""
    } : (invoiceData.patient || {});

    // Parse itemized medicines list from active prescription
    const rawMedicines = latestPrescription?.medicine || invoiceData.medicines || [];
    const medicines = rawMedicines.map((m) => {
        const qty = Number(m.quantity) || 1;
        const itemPrice = Number(m.price) || 0;
        const unitRate = m.unitPrice !== undefined
            ? Number(m.unitPrice)
            : (qty > 0 ? (itemPrice / qty) : itemPrice);

        return {
            _id: m._id || m.medicineId,
            medicineName: m.medicineName || "Medicine",
            quantity: qty,
            unitPrice: unitRate,
            price: itemPrice
        };
    });

    const doctorCharges = latestPrescription?.visitingcharge !== undefined
        ? Number(latestPrescription.visitingcharge)
        : Number(invoiceData.doctorCharges || 0);

    const totalPrescriptionPrice = medicines.reduce((sum, m) => sum + (Number(m.price) || 0), 0);

    const totalConsultationCost = latestPrescription?.totalPrice !== undefined
        ? Number(latestPrescription.totalPrice)
        : Number(invoiceData.totalConsultationCost || invoiceData.totalPrice || (totalPrescriptionPrice + doctorCharges));

    const payAmount = latestPrescription?.payamount !== undefined
        ? Number(latestPrescription.payamount)
        : (invoiceData.payAmount !== undefined ? Number(invoiceData.payAmount) : totalConsultationCost);

    const note = latestPrescription?.note !== undefined
        ? latestPrescription.note
        : (invoiceData.note || "");

    const date = latestPrescription?.createdAt || patientDoc?.createdAt || invoiceData.date || new Date().toISOString();

    const invoiceNo = invoiceData.patient.uniqueno || (patientDoc
        ? `INV-${patientDoc.uniqueno || '001'}-${(latestPrescription?._id || patientDoc._id || Date.now()).toString().slice(-4).toUpperCase()}`
        : `INV-${Date.now().toString().slice(-6)}`);

    // Get doctor / clinic information from GetMe API, localStorage, or prop
    let docInfo = {};
    try {
        const stored = localStorage.getItem("cms_doctor_medical_info");
        if (stored) docInfo = JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse doctor info from localStorage", e);
    }

    const meUser = meData?.user || {};
    const meQual = meUser?.qulification || {};
    const meClinic = meUser?.clinicinfo || {};

    const doctorName = invoiceData.doctorInfo?.doctorName ||
        (docInfo.doctorName ? `${docInfo.doctorTitle || "Dr."} ${docInfo.doctorName}` : "") ||
        meQual.doctorName || meUser.username || "";
    const qualification = invoiceData.doctorInfo?.qualification || docInfo.qualification || meQual.qualification || "";
    const specialty = invoiceData.doctorInfo?.specialty || docInfo.specialty || meQual.specialty || "";
    const registrationNo = invoiceData.doctorInfo?.registrationNo || docInfo.registrationNo || meQual.registrationNo || "";
    const clinicName = invoiceData.doctorInfo?.clinicName || docInfo.clinicName || meClinic.clinicName || "";
    const clinicPhone = invoiceData.doctorInfo?.clinicPhone || docInfo.clinicPhone || docInfo.clinicphone || meClinic.clinicphone || meClinic.clinicPhone || "";
    const clinicAddress = invoiceData.doctorInfo?.clinicAddress
        ? `${invoiceData.doctorInfo.clinicAddress.address || ""}, ${invoiceData.doctorInfo.clinicAddress.city || ""}`
        : (docInfo.clinicAddress ? `${docInfo.clinicAddress || ""}, ${docInfo.city || ""}` : (meClinic.clinicAddress ? `${meClinic.clinicAddress.address || ""}, ${meClinic.clinicAddress.city || ""}` : ""));
    const opdTiming = invoiceData.doctorInfo?.opdTiming || docInfo.opdTiming || docInfo.clinicTiming || meClinic.clinicTiming || "";

    const formattedDate = new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
    const formattedTime = new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

    const paidVal = payAmount !== "" && payAmount !== null && !isNaN(payAmount) ? Number(payAmount) : totalConsultationCost;
    const isPaid = paidVal >= totalConsultationCost;
    const isUnpaid = paidVal === 0 && totalConsultationCost > 0;
    const balance = Math.max(0, totalConsultationCost - paidVal);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div
            className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget && onClose) onClose();
            }}
        >
            <div
                id="printable-invoice-modal"
                className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col border border-slate-100 transition-all transform my-auto max-h-[95vh] print-card"
            >
                {/* ── Top Action Bar (Hidden on Print) ──────────────────────── */}
                <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center font-bold">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm sm:text-base leading-tight">Patient Receipt & Medical Invoice</h3>
                            <p className="text-[11px] text-slate-400 font-medium">Invoice #{invoiceNo}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Print Invoice</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            aria-label="Close invoice modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* ── Printable Invoice Content Area ──────────────────────── */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800 bg-white">

                    {/* Clinic Branding & Header Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-slate-100 gap-4">
                        <div className="space-y-1 max-w-md">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                                    <Stethoscope className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                        {clinicName}
                                    </h1>
                                    <p className="text-xs font-bold text-blue-600 flex items-center gap-1">
                                        <BadgeCheck className="w-3.5 h-3.5" />
                                        {doctorName} <span className="text-slate-400 font-normal">({qualification})</span>
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 space-y-0.5 text-xs text-slate-500 font-medium">
                                <p className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {clinicAddress}</p>
                                {clinicPhone && <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400 shrink-0" /> +91 {clinicPhone}</p>}
                                <p className="flex items-center gap-1 text-[11px] text-slate-400"><Clock className="w-3 h-3 shrink-0" /> OPD Hours: {opdTiming}</p>
                            </div>
                        </div>

                        {/* Invoice Metadata Meta Box */}
                        <div className="sm:text-right space-y-2 shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-100/90 w-full sm:w-auto">
                            <div>
                                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Invoice Number</span>
                                <span className="text-sm font-mono font-bold text-slate-900">#{invoiceNo}</span>
                            </div>
                            <div className="grid grid-cols-2 sm:block gap-2 text-xs">
                                <div>
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Date & Time</span>
                                    <span className="font-semibold text-slate-700">{formattedDate} • {formattedTime}</span>
                                </div>
                                <div className="mt-1.5">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${isPaid
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : isUnpaid
                                            ? "bg-red-50 text-red-700 border-red-200"
                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                        }`}>
                                        <CheckCircle2 className="w-3 h-3" /> {isPaid ? "PAID IN FULL" : isUnpaid ? "UNPAID" : "PARTIAL PAYMENT"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Patient Information Section */}
                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Patient Name</span>
                            <span className="font-extrabold text-slate-900 text-sm block truncate">{patient.patientName || "N/A"}</span>
                            <span className="text-[10px] font-bold text-blue-600">ID: #{patient.uniqueno || "—"}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Age / Gender</span>
                            <span className="font-bold text-slate-800">{patient.patientAge ? `${patient.patientAge} Yrs` : "N/A"} • {patient.patientGender || "N/A"}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Phone Number</span>
                            <span className="font-bold text-slate-800">{patient.phonenumber || "N/A"}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Locality / Region</span>
                            <span className="font-bold text-slate-800 truncate block">{patient.region || "N/A"}</span>
                        </div>
                    </div>

                    {/* Itemized Prescribed Medicines & Services Table */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-blue-500" />
                            Prescription & Clinical Services
                        </h4>
                        <div className="border border-slate-200/90 rounded-2xl overflow-hidden">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="py-3 px-4 w-12 text-center">#</th>
                                        <th className="py-3 px-4">Item / Medicine Description</th>
                                        <th className="py-3 px-4 text-center w-20">Qty</th>
                                        <th className="py-3 px-4 text-right w-24">Unit Rate</th>
                                        <th className="py-3 px-4 text-right w-28">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                                    {medicines.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-4 px-4 text-center text-slate-400 italic">
                                                No medicines prescribed in this visit.
                                            </td>
                                        </tr>
                                    ) : (
                                        medicines.map((med, idx) => {
                                            const unitRate = med.unitPrice || (med.quantity > 0 ? med.price / med.quantity : 0);
                                            return (
                                                <tr key={med._id || idx} className="hover:bg-slate-50/50">
                                                    <td className="py-3 px-4 text-center text-slate-400 font-bold text-[11px]">{idx + 1}</td>
                                                    <td className="py-3 px-4 font-bold text-slate-900">{med.medicineName}</td>
                                                    <td className="py-3 px-4 text-center font-bold text-slate-700">{med.quantity}</td>
                                                    <td className="py-3 px-4 text-right text-slate-600 tabular-nums">{formatCurrency(unitRate)}</td>
                                                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">{formatCurrency(med.price)}</td>
                                                </tr>
                                            );
                                        })
                                    )}

                                    {/* Consultation Fee Row */}
                                    <tr className="bg-slate-50/60 font-semibold">
                                        <td className="py-3 px-4 text-center text-slate-400 font-bold text-[11px]">{medicines.length + 1}</td>
                                        <td className="py-3 px-4 font-bold text-slate-900">Doctor Consultation & Visiting Fee</td>
                                        <td className="py-3 px-4 text-center text-slate-400">—</td>
                                        <td className="py-3 px-4 text-right text-slate-600 tabular-nums">{formatCurrency(doctorCharges)}</td>
                                        <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">{formatCurrency(doctorCharges)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Totals & Note */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start pt-2">
                        {/* Notes / Instructions */}
                        <div className="sm:col-span-7 bg-blue-50/40 p-4 rounded-2xl border border-blue-100/70 space-y-1">
                            <span className="text-[10px] uppercase font-extrabold text-blue-700 tracking-wider block">
                                Treatment Notes / Prescription Dosage
                            </span>
                            <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                {note && note !== "No note" ? note : "Take prescribed medications as per doctor instructions. Drink plenty of water and rest well."}
                            </p>
                        </div>

                        {/* Financial Totals */}
                        <div className="sm:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                            <div className="flex justify-between text-slate-600 font-medium">
                                <span>Medicines Subtotal:</span>
                                <span className="font-bold text-slate-800 tabular-nums">{formatCurrency(totalPrescriptionPrice)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 font-medium">
                                <span>Doctor Consultation Fee:</span>
                                <span className="font-bold text-slate-800 tabular-nums">{formatCurrency(doctorCharges)}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
                                <span>Grand Total:</span>
                                <span className="text-blue-700 text-base font-extrabold tabular-nums">{formatCurrency(totalConsultationCost)}</span>
                            </div>
                            <div className="pt-1.5 border-t border-slate-200/60 flex justify-between text-slate-700 font-semibold text-[11px]">
                                <span>Amount Paid:</span>
                                <span className="font-bold text-emerald-700 tabular-nums">{formatCurrency(paidVal)}</span>
                            </div>
                            {balance > 0 && (
                                <div className="flex justify-between text-amber-800 font-bold text-[11px]">
                                    <span>Balance Due:</span>
                                    <span className="tabular-nums">{formatCurrency(balance)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Signature & Footer Section */}
                    <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                        <div className="space-y-1 text-center sm:text-left text-slate-400">
                            <p className="font-bold text-slate-700 flex items-center gap-1 justify-center sm:justify-start">
                                <ShieldCheck className="w-4 h-4 text-blue-500" />
                                Valid Medical Receipt
                            </p>
                            <p className="text-[10px]">Thank you for visiting {clinicName}. Wish you good health!</p>
                            <p className="text-[9px] text-slate-400 font-mono">Computer generated invoice • No signature required</p>
                        </div>

                        <div className="text-center sm:text-right space-y-1 pt-2 sm:pt-0">
                            <div className="h-10 border-b border-slate-300 w-36 mx-auto sm:ml-auto mb-1 flex items-end justify-center">
                                <span className="text-[10px] text-slate-400 font-serif italic mb-0.5">{doctorName}</span>
                            </div>
                            <p className="font-bold text-slate-900 text-xs">{doctorName}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">Authorized Signature & Seal</p>
                        </div>
                    </div>

                </div>

                {/* ── Modal Footer Buttons (Hidden on Print) ──────────────── */}
                <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Print Invoice</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
