import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const TONE_STYLES = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
};

export default function KpiCard({ label, value, icon: Icon, tone = "blue", delta }) {
    const isPositive = typeof delta === "number" && delta >= 0;
    const hasDelta = typeof delta === "number";

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${TONE_STYLES[tone] || TONE_STYLES.blue}`}
                >
                    {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
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
