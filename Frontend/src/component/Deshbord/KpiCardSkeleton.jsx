import React from "react";

export default function KpiCardSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm animate-pulse">
            <div className="h-10 w-10 rounded-xl bg-slate-100" />
            <div className="mt-4 h-7 w-24 rounded-lg bg-slate-100" />
            <div className="mt-2 h-3 w-28 rounded bg-slate-100" />
        </div>
    );
}
