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
        <div className={`relative w-full min-w-0 ${className}`.trim()} ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`flex items-center justify-between gap-2 border border-slate-200 rounded-xl px-3.5 h-10 bg-white text-xs sm:text-sm font-semibold ${!value ? "text-slate-400" : "text-slate-800"} shadow-sm w-full hover:border-slate-300 transition-all cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-50 ${selectClassName}`}
            >
                <div className="flex items-center gap-2 truncate min-w-0">
                    {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />}
                    <span className="truncate">{triggerLabel}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute left-0 mt-1.5 w-full min-w-[180px] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200/90 bg-white shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {options.map((opt) => {
                            const isObject = typeof opt === "object" && opt !== null;
                            const val = isObject ? opt.value : opt;
                            const label = isObject ? opt.label : opt;
                            const isDisabled = isObject ? (opt.disabled || val === "") : val === "";
                            const isSelected = val === value && val !== "";

                            return (
                                <button
                                    key={val || label}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => !isDisabled && handleSelect(val)}
                                    className={`w-full text-left px-3.5 py-2 sm:py-2 text-xs sm:text-sm transition-colors block ${
                                        isDisabled
                                            ? "text-slate-300 font-normal cursor-not-allowed bg-slate-50/50 pointer-events-none"
                                            : isSelected
                                                ? "text-blue-600 bg-blue-50/70 font-bold cursor-pointer"
                                                : "text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
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
