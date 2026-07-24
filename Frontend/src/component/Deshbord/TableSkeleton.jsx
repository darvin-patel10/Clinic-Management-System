import React from "react";

export default function TableSkeleton({ rows = 4 }) {
    return (
        <div className="flex flex-col divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3 px-1 animate-pulse">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-slate-100" />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-36 rounded bg-slate-100" />
                        <div className="h-2.5 w-24 rounded bg-slate-100" />
                    </div>
                    <div className="h-3 w-16 rounded bg-slate-100" />
                </div>
            ))}
        </div>
    );
}
