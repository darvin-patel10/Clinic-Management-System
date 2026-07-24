import React from "react";

export default function HistoryTableSkeleton({ cols = 4, rows = 4 }) {
    return (
        <div className="overflow-x-auto animate-pulse">
            <table className="w-full text-xs">
                <thead>
                    <tr className="border-b border-slate-100">
                        {Array.from({ length: cols }).map((_, i) => (
                            <th key={i} className="py-2 px-3">
                                <div className="h-3 w-16 rounded bg-slate-100" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {Array.from({ length: rows }).map((_, i) => (
                        <tr key={i}>
                            {Array.from({ length: cols }).map((_, j) => (
                                <td key={j} className="py-2.5 px-3">
                                    <div className="h-3 w-20 rounded bg-slate-100" />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
