import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function StepBar({ steps, currentStep }) {
    return (
        <div className="mb-5 sm:mb-7 select-none">
            {/* ── Progress bar track ── */}
            <div className="flex gap-1 mb-2.5 sm:mb-3">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={`flex-1 h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                            currentStep >= step.id ? "bg-teal-500" : "bg-slate-200"
                        }`}
                    />
                ))}
            </div>

            {/* ── Step tabs ── */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl
                            bg-slate-100/90 border border-slate-200/70">
                {steps.map((step) => {
                    const IconComponent = step.icon;
                    const isActive  = currentStep === step.id;
                    const isPassed  = currentStep >  step.id;

                    return (
                        <div
                            key={step.id}
                            className={`flex flex-col items-center justify-center
                                        py-2 sm:py-2.5 px-1 sm:px-2
                                        rounded-lg sm:rounded-xl text-xs font-semibold
                                        transition-all duration-200
                                        ${isActive
                                            ? "bg-white text-teal-700 shadow-md border border-slate-200/60"
                                            : isPassed
                                                ? "text-slate-700 bg-white/40"
                                                : "text-slate-400"
                                        }`}
                        >
                            <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
                                {isPassed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                                ) : (
                                    <IconComponent
                                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                                            isActive ? "text-teal-600" : "text-slate-400"
                                        }`}
                                    />
                                )}
                                {/* Full name on sm+; step number on mobile */}
                                <span className="hidden sm:inline truncate">{step.name}</span>
                                <span className="sm:hidden text-[10px] font-bold">{step.id}</span>
                            </div>

                            {/* Description — only visible on sm+ */}
                            <span className="hidden sm:block text-[10px] text-slate-400 font-normal truncate max-w-[110px]">
                                {step.desc}
                            </span>

                            {/* Mobile: show abbreviated step name below icon number */}
                            <span className="sm:hidden text-[9px] text-slate-400 font-normal truncate max-w-[64px] leading-tight text-center mt-0.5">
                                {step.name.split(" ")[0]}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
