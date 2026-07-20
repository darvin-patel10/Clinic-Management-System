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
import Navbar from "../component/Navbar";
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
        return <DashboardErrorState onRetry={onRetry} />;
    }

    return (
        <div className="flex flex-col gap-8 p-4 md:p-6">
            <Navbar />
            <header>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Here&apos;s what&apos;s happening at your clinic today.
                </p>
            </header>

            {/* Row 1 — KPI cards */}
            <section
                aria-label="Key metrics"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
                    : buildKpiCards(stats).map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
            </section>

            {/* Row 2 — Revenue chart + Low stock
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <Card title="Revenue overview" subtitle="Last 7 days">
                    {isLoading ? (
                        <ChartSkeleton />
                    ) : (
                        <RevenueChart data={stats.revenueTrend} />
                    )}
                </Card>

                <Card
                    title="Low stock medicines"
                    subtitle={`${stats.lowStockMedicines.length} need attention`}
                    action={
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            View all
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                    }
                >
                    {isLoading ? (
                        <ListSkeleton rows={5} />
                    ) : (
                        <LowStockList items={stats.lowStockMedicines} />
                    )}
                </Card>
            </section> */}

            {/* Row 3 — Recent patients + Recent prescriptions */}
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <Card
                    title="Recent patients"
                    action={<TextLink label="View all" />}
                >
                    {isLoading ? (
                        <TableSkeleton rows={5} />
                    ) : (
                        <RecentPatientsTable patients={stats.recentPatients} />
                    )}
                </Card>

                <Card
                    title="Recent prescriptions"
                    action={<TextLink label="View all" />}
                >
                    {isLoading ? (
                        <TableSkeleton rows={5} />
                    ) : (
                        <RecentPrescriptionsTable prescriptions={stats.recentPrescriptions} />
                    )}
                </Card>
            </section>
        </div>
    );
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

const TONE_STYLES = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
};

function KpiCard({ label, value, icon: Icon, tone = "blue", delta }) {
    const isPositive = typeof delta === "number" && delta >= 0;
    const hasDelta = typeof delta === "number";

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${TONE_STYLES[tone]}`}
                >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>

                {hasDelta && (
                    <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {isPositive ? (
                            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                            <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {Math.abs(delta)}%
                    </span>
                )}
            </div>

            <p className="mt-4 text-[28px] font-bold leading-8 text-gray-900 tabular-nums">
                {value}
            </p>
            <p className="mt-1 text-xs text-gray-600">{label}</p>
        </div>
    );
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

function Card({ title, subtitle, action, children }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-[20px] font-semibold leading-7 text-gray-900">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="mt-0.5 text-xs text-gray-600">{subtitle}</p>
                    )}
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

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

function ChartSkeleton() {
    return <div className="h-64 w-full animate-pulse rounded-lg bg-gray-100" />;
}

/* -------------------------------------------------------------------------
 * Low stock list
 * ---------------------------------------------------------------------- */

function LowStockList({ items }) {
    if (!items || items.length === 0) {
        return <EmptyState message="All medicines are well stocked." />;
    }

    return (
        <ul className="flex flex-col gap-1">
            {items.map((med) => (
                <li
                    key={med.id}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 hover:bg-gray-50"
                >
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                            {med.name}
                        </p>
                        <p className="text-xs text-gray-600">{med.category}</p>
                    </div>
                    <StockBadge quantity={med.quantity} threshold={med.lowStockThreshold} />
                </li>
            ))}
        </ul>
    );
}

function StockBadge({ quantity, threshold }) {
    const isCritical = quantity <= Math.ceil(threshold / 2);
    const tone = isCritical
        ? "bg-red-50 text-red-600"
        : "bg-yellow-50 text-yellow-600";

    return (
        <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}
        >
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            {quantity} left
        </span>
    );
}

/* -------------------------------------------------------------------------
 * Recent patients table
 * ---------------------------------------------------------------------- */

function RecentPatientsTable({ patients }) {
    if (!patients || patients.length === 0) {
        return <EmptyState message="No patients added yet." />;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-gray-100">
                        <Th>Name</Th>
                        <Th>Phone</Th>
                        <Th>Last visit</Th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map((p) => (
                        <tr
                            key={p.id}
                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                        >
                            <Td>
                                <div className="flex items-center gap-3">
                                    <Avatar name={p.name} />
                                    <span className="font-medium text-gray-900">{p.name}</span>
                                </div>
                            </Td>
                            <Td className="tabular-nums text-gray-600">{p.phone}</Td>
                            <Td className="text-gray-600">{formatDate(p.lastVisit)}</Td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* -------------------------------------------------------------------------
 * Recent prescriptions table
 * ---------------------------------------------------------------------- */

function RecentPrescriptionsTable({ prescriptions }) {
    if (!prescriptions || prescriptions.length === 0) {
        return <EmptyState message="No prescriptions created yet." />;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-gray-100">
                        <Th>Patient</Th>
                        <Th>Medicines</Th>
                        <Th>Date</Th>
                    </tr>
                </thead>
                <tbody>
                    {prescriptions.map((rx) => (
                        <tr
                            key={rx.id}
                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                        >
                            <Td className="font-medium text-gray-900">{rx.patientName}</Td>
                            <Td className="text-gray-600">
                                {rx.medicineCount} medicine{rx.medicineCount !== 1 ? "s" : ""}
                            </Td>
                            <Td className="text-gray-600">
                                <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                                    {formatDate(rx.date)}
                                </span>
                            </Td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* -------------------------------------------------------------------------
 * Small shared bits
 * ---------------------------------------------------------------------- */

function Th({ children }) {
    return (
        <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-600">
            {children}
        </th>
    );
}

function Td({ children, className = "" }) {
    return <td className={`py-3 pr-4 text-sm ${className}`}>{children}</td>;
}

function Avatar({ name }) {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
            {initials}
        </span>
    );
}

function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <AlertTriangle className="h-8 w-8 text-gray-300" aria-hidden="true" />
            <p className="text-sm text-gray-600">{message}</p>
        </div>
    );
}

function ListSkeleton({ rows = 4 }) {
    return (
        <div className="flex flex-col gap-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                    <div className="h-5 w-14 animate-pulse rounded-full bg-gray-100" />
                </div>
            ))}
        </div>
    );
}

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

function DashboardErrorState({ onRetry }) {
    return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertTriangle className="h-10 w-10 text-red-600" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-900">
                Something went wrong
            </h2>
            <p className="max-w-sm text-sm text-gray-600">
                We couldn&apos;t load your dashboard data. Please check your connection
                and try again.
            </p>
            <button
                type="button"
                onClick={onRetry}
                className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
                Retry
            </button>
        </div>
    );
}

/* -------------------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------------- */

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(isoDate) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(isoDate));
}

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