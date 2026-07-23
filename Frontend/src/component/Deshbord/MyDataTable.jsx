import React from "react";
import { Calendar, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../utils/formatters.js";

export default function MyDataTable({ data = [], type = "month" }) {
    const isMonth = type === "month";
    const headerLabel = isMonth ? "Month" : "Year";
    const IconComponent = isMonth ? Calendar : TrendingUp;
    const iconBgClass = isMonth ? "bg-blue-50" : "bg-amber-50";
    const iconColorClass = isMonth ? "text-blue-500" : "text-amber-500";

    return (
        <div className="overflow-x-auto -mx-1">
            <table className="w-full text-left text-xs border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-2 px-3">{headerLabel}</th>
                        <th className="py-2 px-3 text-center">Patients</th>
                        <th className="py-2 px-3 text-center">Medicines</th>
                        <th className="py-2 px-3 text-right">Revenue</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {data.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-lg ${iconBgClass} flex items-center justify-center shrink-0`}>
                                        <IconComponent className={`w-3 h-3 ${iconColorClass}`} />
                                    </div>
                                    <span className="font-bold text-slate-800">
                                        {isMonth ? row.month : row.year}
                                    </span>
                                </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-100">
                                    {row.patients}
                                </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-100">
                                    {row.medicines}
                                </span>
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-slate-800">
                                {formatCurrency(row.revenue)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
