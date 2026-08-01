import React, { useState, useEffect, useRef } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const TONE_STYLES = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
};

// Parses a string value into dynamic parts for animation
function parseValue(str) {
    if (typeof str !== "string") {
        str = String(str || "");
    }
    
    // 1. Currency (e.g., "₹12,450")
    if (str.includes("₹")) {
        const numericPart = parseFloat(str.replace(/[^\d.]/g, "")) || 0;
        return {
            type: "currency",
            target: numericPart,
            format: (val) => {
                return new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                }).format(val);
            }
        };
    }

    // 2. Ratio / Compound value (e.g., "10 / 5 / 2")
    if (str.includes("/")) {
        const parts = str.split("/");
        const targets = parts.map(p => parseFloat(p.trim()) || 0);
        return {
            type: "ratio",
            targets: targets,
            format: (vals) => {
                return vals.map((v) => Math.round(v).toString()).join(" / ");
            }
        };
    }

    // 3. Number with unit suffix (e.g., "35 yrs")
    const suffixMatch = str.match(/^([\d,.]+)\s*(.+)$/);
    if (suffixMatch) {
        const numStr = suffixMatch[1];
        const suffix = suffixMatch[2];
        const numericPart = parseFloat(numStr.replace(/,/g, "")) || 0;
        const hasCommas = numStr.includes(",");
        return {
            type: "suffix",
            target: numericPart,
            format: (val) => {
                const rounded = Math.round(val);
                const formattedNum = hasCommas ? rounded.toLocaleString("en-IN") : rounded.toString();
                return `${formattedNum} ${suffix}`;
            }
        };
    }

    // 4. Standard formatted number (e.g., "1,936" or "482")
    const cleanStr = str.replace(/,/g, "");
    const numericPart = parseFloat(cleanStr);
    if (!isNaN(numericPart)) {
        const hasCommas = str.includes(",");
        return {
            type: "number",
            target: numericPart,
            format: (val) => {
                const rounded = Math.round(val);
                return hasCommas ? rounded.toLocaleString("en-IN") : rounded.toString();
            }
        };
    }

    // 5. Fallback for non-numeric values
    return {
        type: "literal",
        target: 0,
        format: () => str
    };
}

function AnimatedKpiValue({ value }) {
    const [displayValue, setDisplayValue] = useState(value);
    const currentRef = useRef(null);

    useEffect(() => {
        const parsedTarget = parseValue(value);
        
        let startVals;
        if (currentRef.current !== null && currentRef.current.type === parsedTarget.type) {
            startVals = currentRef.current.values;
        } else {
            if (parsedTarget.type === "ratio") {
                startVals = parsedTarget.targets.map(() => 0);
            } else {
                startVals = [0];
            }
        }

        const targetVals = parsedTarget.type === "ratio" ? parsedTarget.targets : [parsedTarget.target];
        const duration = 1000; // Duration in milliseconds
        let startTime = null;
        let animationFrameId;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // easeOutExpo timing function for dynamic, premium feel
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            const currentVals = startVals.map((start, idx) => {
                const target = targetVals[idx] || 0;
                return start + (target - start) * easeProgress;
            });

            currentRef.current = {
                type: parsedTarget.type,
                values: currentVals
            };

            let formatted;
            if (parsedTarget.type === "ratio") {
                formatted = parsedTarget.format(currentVals);
            } else {
                formatted = parsedTarget.format(currentVals[0]);
            }

            setDisplayValue(formatted);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [value]);

    return <>{displayValue}</>;
}

export default function KpiCard({ label, value, icon: Icon, tone = "blue", delta }) {
    const isPositive = typeof delta === "number" && delta >= 0;
    const hasDelta = typeof delta === "number";

    return (
        <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 lg:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-w-0">
            <div className="flex items-start justify-between gap-2">
                <span
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-105 shrink-0 ${TONE_STYLES[tone] || TONE_STYLES.blue}`}
                >
                    {Icon && <Icon className="h-4 h-4 sm:h-5 sm:w-5" aria-hidden="true" />}
                </span>

                {hasDelta && (
                    <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                            isPositive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
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

            <div className="mt-3 sm:mt-4 min-w-0">
                <p className="text-xl sm:text-2xl lg:text-[28px] font-extrabold leading-tight text-slate-900 tabular-nums tracking-tight truncate">
                    <AnimatedKpiValue value={value} />
                </p>
                <p className="mt-0.5 sm:mt-1 text-xs font-semibold text-slate-500 truncate">{label}</p>
            </div>
        </div>
    );
}
