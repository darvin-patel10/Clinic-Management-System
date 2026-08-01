import React from "react";

export default function KpiCardSkeleton() {
    return (
        <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 lg:p-6 shadow-sm animate-pulse flex flex-col justify-between min-w-0">
            <div className="flex items-start justify-between">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-100" />
            </div>
            <div className="mt-3 sm:mt-4 min-w-0">
                <div className="h-6 sm:h-7 lg:h-8 w-24 sm:w-28 rounded-lg bg-slate-100" />
                <div className="mt-1.5 h-3.5 w-20 sm:w-24 rounded bg-slate-100" />
            </div>
        </div>
    );
}
