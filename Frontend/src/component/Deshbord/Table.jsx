import React from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { formatDate } from "../../utils/formatters.js";

function Avatar({ name = "" }) {
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

export default function Table({ data, patient = false }) {

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <AlertTriangle className="h-8 w-8 text-gray-300" aria-hidden="true" />
                <p className="text-sm text-gray-600">
                    {patient ? "No patients added yet." : "No prescriptions created yet."}
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-gray-100">
                        {patient ? (
                            <>
                                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-600">Name</th>
                                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-600">Phone</th>
                                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-600">Last visit</th>
                            </>
                        ) : (
                            <>
                                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-600">Patient</th>
                                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-600">Medicines</th>
                                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-600">Date</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {patient
                        ? data.map((p) => (
                            <tr
                                key={p.id}
                                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                            >
                                <td className="py-3 pr-4 text-sm font-medium text-gray-900">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={p.name} />
                                        <span>{p.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 pr-4 text-sm tabular-nums text-gray-600">{p.phone}</td>
                                <td className="py-3 pr-4 text-sm text-gray-600">{formatDate(p.lastVisit)}</td>
                            </tr>
                        ))
                        : data.map((rx) => (
                            <tr
                                key={rx.id}
                                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                            >
                                <td className="py-3 pr-4 text-sm font-medium text-gray-900">{rx.patientName}</td>
                                <td className="py-3 pr-4 text-sm text-gray-600">
                                    {rx.medicineCount} medicine{rx.medicineCount !== 1 ? "s" : ""}
                                </td>
                                <td className="py-3 pr-4 text-sm text-gray-600">
                                    <span className="inline-flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                                        {formatDate(rx.date)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}
