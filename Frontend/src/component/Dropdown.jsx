import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function Dropdown({
    value,
    onChange,
    options = [],
    icon: Icon,
    className = "",
    selectClassName = "",
    disabled = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (val) => {
        if (onChange) {
            onChange({ target: { value: val } });
        }
        setIsOpen(false);
    };

    // Find the label for the currently selected value
    const selectedOption = options.find((opt) => {
        const isObject = typeof opt === "object" && opt !== null;
        const val = isObject ? opt.value : opt;
        return val === value;
    });

    const triggerLabel = selectedOption
        ? (typeof selectedOption === "object" ? selectedOption.label : selectedOption)
        : value;

    return (
        <div className={`relative w-full sm:w-auto ${className}`} ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`flex items-center justify-between gap-2 border border-slate-200 rounded-xl px-3.5 py-2 bg-white text-xs font-semibold text-slate-800 shadow-sm w-full sm:w-auto hover:bg-slate-50 active:scale-98 transition-all cursor-pointer focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-50 ${selectClassName}`}
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <span>{triggerLabel}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute left-0 mt-1.5 w-full min-w-[185px] rounded-xl border border-slate-200/80 bg-white shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="max-h-60 overflow-y-auto">
                        {options.map((opt) => {
                            const isObject = typeof opt === "object" && opt !== null;
                            const val = isObject ? opt.value : opt;
                            const label = isObject ? opt.label : opt;
                            const isSelected = val === value;

                            return (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleSelect(val)}
                                    className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer block ${
                                        isSelected
                                            ? "text-blue-600 bg-blue-50/50 font-bold"
                                            : "text-slate-700 hover:bg-slate-50 font-medium"
                                    }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
