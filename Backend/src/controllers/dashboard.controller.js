import patientModel from "../models/patient.model.js";
import medicineModel from "../models/medicines.model.js";
import dashboardLogModel from "../models/dashboardLog.model.js";

/**
 * Helper function to check and perform yearly rollover in DashboardLog doc.
 * Summarizes past completed years (< currentYearStr) from monthlyData into yearlyData.
 * Current year data remains in monthlyData and is NOT added to yearlyData until 1 January of the next year.
 */
function performYearlyRolloverInDoc(doc, currentYearStr) {
    if (!doc || !doc.monthlyData || doc.monthlyData.length === 0) return false;

    let isModified = false;
    const pastYears = new Set();

    doc.monthlyData.forEach((m) => {
        const yearPart = m.month ? m.month.split(" ")[1] : null;
        if (yearPart && yearPart < currentYearStr) {
            pastYears.add(yearPart);
        }
    });

    pastYears.forEach((prevYear) => {
        const alreadySavedPrevYear = doc.yearlyData.some((y) => y.year === prevYear);
        if (!alreadySavedPrevYear) {
            let totalMedicines = 0;
            let totalRevenue = 0;
            const prevYearPatientNames = new Set();
            let sumPatientsFallback = 0;

            doc.monthlyData.forEach((m) => {
                const yearPart = m.month ? m.month.split(" ")[1] : null;
                if (yearPart === prevYear) {
                    totalMedicines += m.noOfMedicines || 0;
                    totalRevenue += m.revenue || 0;
                    sumPatientsFallback += m.noOfPatients || 0;
                    (m.patientNames || []).forEach((name) => prevYearPatientNames.add(name));
                }
            });

            const totalPatients = prevYearPatientNames.size > 0 ? prevYearPatientNames.size : sumPatientsFallback;

            doc.yearlyData.push({
                year: prevYear,
                noOfPatients: totalPatients,
                noOfMedicines: totalMedicines,
                revenue: totalRevenue,
            });

            isModified = true;
        }
    });

    if (pastYears.size > 0) {
        // Clear past completed year months from doc.monthlyData
        const initialCount = doc.monthlyData.length;
        doc.monthlyData = doc.monthlyData.filter((m) => {
            const yearPart = m.month ? m.month.split(" ")[1] : null;
            return !yearPart || yearPart >= currentYearStr;
        });
        if (doc.monthlyData.length !== initialCount) {
            isModified = true;
        }
    }

    return isModified;
}

/**
 * Record a deleted prescription into DashboardLog with automatic monthly and yearly rollover.
 */
export async function recordDeletedPrescriptionToLog({ drId, patientName, prescription }) {
    if (!drId || !prescription) return;

    try {
        const presDate = new Date(prescription.createdAt || prescription.date || Date.now());
        const MONTH_NAMES = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const monthIndex = presDate.getMonth(); // 0 for January, 11 for December
        const monthName = MONTH_NAMES[monthIndex];
        const monthStr = `${monthName} ${presDate.getFullYear()}`;
        const presYear = String(presDate.getFullYear());

        const medCount = Array.isArray(prescription.medicine) ? prescription.medicine.length : 0;
        const rev = (prescription.payamount !== undefined && prescription.payamount !== null && prescription.payamount !== "")
            ? Number(prescription.payamount)
            : (Number(prescription.totalPrice) || 0);
        const pName = (patientName || "Unknown Patient").trim();

        // Find or create doctor's dashboard log document
        let doc = await dashboardLogModel.findOne({ drId });
        if (!doc) {
            doc = new dashboardLogModel({ drId, monthlyData: [], yearlyData: [] });
        }

        // ── 1. YEARLY ROLLOVER FOR PAST COMPLETED YEARS (< currentYearStr) ─────────
        const currentYearStr = String(new Date().getFullYear());
        performYearlyRolloverInDoc(doc, currentYearStr);

        // ── 2. PREVENT DUPLICATE MONTHS & UPDATE / REPLACE MONTHLY DATA ─────────
        // Find existing month entry (matches exact monthStr or monthName prefix)
        let monthEntry = doc.monthlyData.find(
            (m) => m.month === monthStr || m.month.startsWith(monthName)
        );

        if (monthEntry) {
            // Check if old month entry is from a previous year that needs replacement
            const entryYearPart = monthEntry.month.split(" ")[1];
            if (entryYearPart && entryYearPart < presYear) {
                // Replace old month entry with new year's month data
                monthEntry.month = monthStr;
                monthEntry.noOfPatients = 1;
                monthEntry.noOfMedicines = medCount;
                monthEntry.revenue = rev;
                monthEntry.patientNames = [pName];
            } else {
                // Same year month update
                const alreadyExists = monthEntry.patientNames.includes(pName);
                if (alreadyExists) {
                    // Duplicate patient name: update medicines and revenue only
                    monthEntry.noOfMedicines += medCount;
                    monthEntry.revenue += rev;
                } else {
                    // New patient in this month: update patient count, medicines, revenue, and store name
                    monthEntry.noOfPatients += 1;
                    monthEntry.noOfMedicines += medCount;
                    monthEntry.revenue += rev;
                    monthEntry.patientNames.push(pName);
                }
                monthEntry.month = monthStr;
            }
        } else {
            // Add new month entry for current year
            doc.monthlyData.push({
                month: monthStr,
                noOfPatients: 1,
                noOfMedicines: medCount,
                revenue: rev,
                patientNames: [pName],
            });
        }

        await doc.save();
    } catch (err) {
        console.error("[DashboardLog] Error recording deleted prescription:", err);
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * getDashboardStats
 * Returns aggregated statistics for the dashboard:
 *  - KPI: totalMedicines, totalPatients, todaysPatients, monthlyRevenue
 *  - todaysPatientsData: full patient objects for today's visits
 *  - monthlyData: per-month aggregation from active + DashboardLog monthlyData
 *  - yearlyData:  per-year aggregation from DashboardLog yearlyData
 * ───────────────────────────────────────────────────────────────────────────── */
export async function getDashboardStats(req, res) {
    try {
        const drId = req.user.id;

        // ── KPI: Total medicines ──────────────────────────────────────────────
        const totalMedicines = await medicineModel.countDocuments({ drId });

        // ── KPI: Total patients ───────────────────────────────────────────────
        const totalPatients = await patientModel.countDocuments({ drId });

        // ── KPI: Today's patients ─────────────────────────────────────────────
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const activePatients = await patientModel.find({ drId });
        const todaysPatientsData = activePatients.filter((p) => {
            return (p.prescription || []).some((pres) => {
                const pDate = new Date(pres.createdAt || pres.date);
                return pDate >= todayStart && pDate <= todayEnd;
            });
        });
        const todaysPatients = todaysPatientsData.length;

        // ── Monthly & Yearly Aggregation ──────────────────────────────────────
        const MONTH_NAMES = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const now = new Date();
        const currentYearStr = String(now.getFullYear());
        const currentMonthStr = `${MONTH_NAMES[now.getMonth()]} ${currentYearStr}`;

        const docLog = await dashboardLogModel.findOne({ drId });
        if (docLog) {
            const wasModified = performYearlyRolloverInDoc(docLog, currentYearStr);
            if (wasModified) {
                await docLog.save();
            }
        }

        const monthlyMap = new Map();

        // 1. Add archived monthlyData from DashboardLog
        if (docLog && docLog.monthlyData) {
            docLog.monthlyData.forEach((m) => {
                monthlyMap.set(m.month, {
                    month: m.month,
                    patients: m.noOfPatients,
                    medicines: m.noOfMedicines,
                    revenue: m.revenue,
                    patientNames: new Set(m.patientNames || [])
                });
            });
        }

        // 2. Add active prescriptions from patientModel
        activePatients.forEach((p) => {
            (p.prescription || []).forEach((pres) => {
                const presDate = new Date(pres.createdAt || pres.date || p.createdAt);
                const monthKey = `${MONTH_NAMES[presDate.getMonth()]} ${presDate.getFullYear()}`;
                const medCount = Array.isArray(pres.medicine) ? pres.medicine.length : 0;
                const rev = (pres.payamount !== undefined && pres.payamount !== null && pres.payamount !== "")
                    ? Number(pres.payamount)
                    : (Number(pres.totalPrice) || 0);
                const pName = (p.patientName || "").trim();

                if (!monthlyMap.has(monthKey)) {
                    monthlyMap.set(monthKey, {
                        month: monthKey,
                        patients: 0,
                        medicines: 0,
                        revenue: 0,
                        patientNames: new Set()
                    });
                }
                const entry = monthlyMap.get(monthKey);
                if (!entry.patientNames.has(pName)) {
                    entry.patientNames.add(pName);
                    entry.patients += 1;
                }
                entry.medicines += medCount;
                entry.revenue += rev;
            });
        });

        // Current Month Revenue
        const currentMonthEntry = monthlyMap.get(currentMonthStr);
        const monthlyRevenue = currentMonthEntry ? currentMonthEntry.revenue : 0;

        // Convert monthly map to array
        const monthlyData = Array.from(monthlyMap.values()).map((e) => ({
            month: e.month,
            patients: e.patients,
            medicines: e.medicines,
            revenue: e.revenue,
        }));

        // ── Yearly Data aggregation ───────────────────────────────────────────
        const yearlyMap = new Map();

        // 1. Add archived yearlyData from DashboardLog
        if (docLog && docLog.yearlyData) {
            docLog.yearlyData.forEach((y) => {
                yearlyMap.set(y.year, {
                    year: y.year,
                    patients: y.noOfPatients,
                    medicines: y.noOfMedicines,
                    revenue: y.revenue
                });
            });
        }

        // 2. Aggregate monthlyData by year ONLY for past completed years (< currentYearStr)
        // Current year data (e.g. 2026) is NOT added to yearlyData array until 1 January of the next year (e.g. 2027)
        monthlyData.forEach((m) => {
            const yearKey = m.month.split(" ")[1];
            if (yearKey && yearKey < currentYearStr) {
                if (!yearlyMap.has(yearKey)) {
                    yearlyMap.set(yearKey, {
                        year: yearKey,
                        patients: 0,
                        medicines: 0,
                        revenue: 0
                    });
                }
                const yEntry = yearlyMap.get(yearKey);
                yEntry.patients += m.patients;
                yEntry.medicines += m.medicines;
                yEntry.revenue += m.revenue;
            }
        });

        const yearlyData = Array.from(yearlyMap.values()).sort((a, b) => b.year.localeCompare(a.year));

        return res.status(200).json({
            success: true,
            totalMedicines,
            totalPatients,
            todaysPatients,
            todaysPatientsData: todaysPatientsData.filter(Boolean),
            monthlyRevenue,
            monthlyData,
            yearlyData,
        });
    } catch (error) {
        console.error("[getDashboardStats] Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
