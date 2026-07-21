import { useMemo, useState } from "react";
import {
    Pill,
    Users,
    CalendarCheck,
    IndianRupee,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Clock,
    ChevronRight,
} from "lucide-react";
import PageWrapper from "../component/PageWrapper";
import SectionWrapper from "../component/SectionWrapper";
import Card from "../component/Deshbord/Card";
import Table from "../component/Deshbord/Table";
import ErrorState from "../component/Deshbord/ErrorState";
import KpiCard from "../component/Deshbord/KpiCard";
import { formatCurrency, formatDate } from "../utils/formatters.js";
// import {
//     ResponsiveContainer,
//     AreaChart,
//     Area,
//     CartesianGrid,
//     XAxis,
//     YAxis,
//     Tooltip,
// } from "recharts";

/**
 * Dashboard
 * --------------------------------------------------------------------------
 * Route-level dashboard screen. Built per Design.md (Section 7) and
 * Agent.md (Section 8/12). In the real app, `stats` is supplied by the
 * `useDashboardStats()` React Query hook (features/dashboard/hooks) — this
 * file stays presentational and accepts data + loading/error via props so
 * it can be wired to the hook with zero changes here.
 *
 * Props:
 *  - stats:      DashboardStats | undefined
 *  - isLoading:  boolean
 *  - isError:    boolean
 *  - onRetry:    () => void
 */
export default function Dashboard({
    stats = MOCK_STATS,
    isLoading = false,
    isError = false,
    onRetry = () => { },
}) {
    if (isError) {
        return <ErrorState onRetry={onRetry} />;
    }

    /* -------------------------------------------------------------------------
 * KPI Cards
 * ---------------------------------------------------------------------- */

    function buildKpiCards(stats) {
        return [
            {
                label: "Total medicines",
                value: stats.totalMedicines.toLocaleString("en-IN"),
                icon: Pill,
                tone: "blue",
            },
            {
                label: "Total patients",
                value: stats.totalPatients.toLocaleString("en-IN"),
                icon: Users,
                tone: "blue",
            },
            {
                label: "Today's patients",
                value: stats.todaysPatients.toLocaleString("en-IN"),
                icon: CalendarCheck,
                tone: "green",
            },
            {
                label: "Monthly revenue",
                value: formatCurrency(stats.monthlyRevenue),
                icon: IndianRupee,
                tone: "blue",
                delta: stats.revenueDeltaPercent,
            },
        ];
    }



    function KpiCardSkeleton() {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
                <div className="mt-4 h-7 w-24 animate-pulse rounded bg-gray-100" />
                <div className="mt-2 h-3 w-28 animate-pulse rounded bg-gray-100" />
            </div>
        );
    }


    /* -------------------------------------------------------------------------
 * Shared Card shell
 * ---------------------------------------------------------------------- */

    function TextLink({ label }) {
        return (
            <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
                {label}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
        );
    }

    /* -------------------------------------------------------------------------
 * Small shared bits
 * ---------------------------------------------------------------------- */

    function TableSkeleton({ rows = 4 }) {
        return (
            <div className="flex flex-col gap-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-gray-100" />
                        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <PageWrapper
            title="Dashboard"
            subtitle="Here's what's happening at your clinic today."
        >
            <div className="flex flex-col gap-8">
                {/* Row 1 — KPI cards */}
                <SectionWrapper
                    aria-label="Key metrics"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
                        : buildKpiCards(stats).map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
                </SectionWrapper>

                {/* Row 3 — Recent patients + Recent prescriptions */}
                <SectionWrapper className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <Card
                        title="Recent patients"
                        action={<TextLink label="View all" />}
                    >
                        {isLoading ? (
                            <TableSkeleton rows={5} />
                        ) : (
                            <Table data={stats.recentPatients} patient={true} />
                        )}
                    </Card>

                    <Card
                        title="Recent prescriptions"
                        action={<TextLink label="View all" />}
                    >
                        {isLoading ? (
                            <TableSkeleton rows={5} />
                        ) : (
                            <Table data={stats.recentPrescriptions} />
                        )}
                    </Card>
                </SectionWrapper>
            </div>
        </PageWrapper>
    );
}


/* -------------------------------------------------------------------------
 * Revenue chart
 * ---------------------------------------------------------------------- */

// function RevenueChart({ data }) {
//   if (!data || data.length === 0) {
//     return <EmptyState message="No revenue data for this period." />;
//   }

//   return (
//     <div className="h-64 w-full">
//       <ResponsiveContainer width="100%" height="100%">
//         <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
//           <defs>
//             <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="0%" stopColor="#2563EB" stopOpacity={0.18} />
//               <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
//             </linearGradient>
//           </defs>
//           <CartesianGrid stroke="#F1F5F9" vertical={false} />
//           <XAxis
//             dataKey="day"
//             tickLine={false}
//             axisLine={false}
//             tick={{ fontSize: 12, fill: "#94A3B8" }}
//           />
//           <YAxis
//             tickLine={false}
//             axisLine={false}
//             tick={{ fontSize: 12, fill: "#94A3B8" }}
//             tickFormatter={(v) => `₹${v / 1000}k`}
//             width={48}
//           />
//           <Tooltip
//             cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }}
//             contentStyle={{
//               borderRadius: 8,
//               border: "1px solid #E2E8F0",
//               boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
//               fontSize: 12,
//             }}
//             formatter={(value) => [formatCurrency(value), "Revenue"]}
//           />
//           <Area
//             type="monotone"
//             dataKey="revenue"
//             stroke="#2563EB"
//             strokeWidth={2}
//             fill="url(#revenueFill)"
//           />
//         </AreaChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// function ChartSkeleton() {
//     return <div className="h-64 w-full animate-pulse rounded-lg bg-gray-100" />;
// }

/* -------------------------------------------------------------------------
 * Low stock list
 * ---------------------------------------------------------------------- */

// function LowStockList({ items }) {
//     if (!items || items.length === 0) {
//         return <EmptyState message="All medicines are well stocked." />;
//     }

//     return (
//         <ul className="flex flex-col gap-1">
//             {items.map((med) => (
//                 <li
//                     key={med.id}
//                     className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 hover:bg-gray-50"
//                 >
//                     <div className="min-w-0">
//                         <p className="truncate text-sm font-medium text-gray-900">
//                             {med.name}
//                         </p>
//                         <p className="text-xs text-gray-600">{med.category}</p>
//                     </div>
//                     <StockBadge quantity={med.quantity} threshold={med.lowStockThreshold} />
//                 </li>
//             ))}
//         </ul>
//     );
// }

// function StockBadge({ quantity, threshold }) {
//     const isCritical = quantity <= Math.ceil(threshold / 2);
//     const tone = isCritical
//         ? "bg-red-50 text-red-600"
//         : "bg-yellow-50 text-yellow-600";

//     return (
//         <span
//             className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}
//         >
//             <AlertTriangle className="h-3 w-3" aria-hidden="true" />
//             {quantity} left
//         </span>
//     );
// }



/* -------------------------------------------------------------------------
 * Mock data — remove once useDashboardStats() is wired to the real API.
 * ---------------------------------------------------------------------- */

const MOCK_STATS = {
    totalMedicines: 482,
    totalPatients: 1936,
    todaysPatients: 27,
    monthlyRevenue: 486000,
    revenueDeltaPercent: 8,
    revenueTrend: [
        { day: "Mon", revenue: 18500 },
        { day: "Tue", revenue: 21200 },
        { day: "Wed", revenue: 16800 },
        { day: "Thu", revenue: 24300 },
        { day: "Fri", revenue: 27900 },
        { day: "Sat", revenue: 31200 },
        { day: "Sun", revenue: 19600 },
    ],
    lowStockMedicines: [
        { id: "m1", name: "Amoxicillin 500mg", category: "Antibiotic", quantity: 8, lowStockThreshold: 20 },
        { id: "m2", name: "Paracetamol 650mg", category: "Analgesic", quantity: 14, lowStockThreshold: 25 },
        { id: "m3", name: "Cetirizine 10mg", category: "Antihistamine", quantity: 5, lowStockThreshold: 15 },
        { id: "m4", name: "Metformin 500mg", category: "Antidiabetic", quantity: 18, lowStockThreshold: 30 },
    ],
    recentPatients: [
        { id: "p1", name: "Aarav Shah", phone: "+91 98765 43210", lastVisit: "2026-07-19" },
        { id: "p2", name: "Priya Mehta", phone: "+91 91234 56780", lastVisit: "2026-07-18" },
        { id: "p3", name: "Rohan Verma", phone: "+91 99887 66554", lastVisit: "2026-07-18" },
        { id: "p4", name: "Sneha Iyer", phone: "+91 90000 11223", lastVisit: "2026-07-17" },
    ],
    recentPrescriptions: [
        { id: "rx1", patientName: "Aarav Shah", medicineCount: 3, date: "2026-07-19" },
        { id: "rx2", patientName: "Priya Mehta", medicineCount: 2, date: "2026-07-18" },
        { id: "rx3", patientName: "Rohan Verma", medicineCount: 4, date: "2026-07-18" },
        { id: "rx4", patientName: "Sneha Iyer", medicineCount: 1, date: "2026-07-17" },
    ],
};