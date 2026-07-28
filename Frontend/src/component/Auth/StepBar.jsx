import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function StepBar({ steps, currentStep }) {
    return (
        <div className="grid grid-cols-3 gap-2 mb-7 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/70 select-none">
            {steps.map((step) => {
                const IconComponent = step.icon;
                const isActive = currentStep === step.id;
                const isPassed = currentStep > step.id;

                return (
                    <div
                        key={step.id}
                        className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all duration-200 ${isActive
                            ? "bg-white text-teal-700 shadow-md border border-slate-200/60"
                            : isPassed
                                ? "text-slate-700 bg-white/40"
                                : "text-slate-400"
                            }`}
                    >
                        <div className="flex items-center gap-1.5 mb-0.5">
                            {isPassed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                                <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? "text-teal-600" : "text-slate-400"}`} />
                            )}
                            <span className="hidden sm:inline">{step.name}</span>
                            <span className="sm:hidden">{step.id}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 hidden sm:block font-normal truncate max-w-[120px]">
                            {step.desc}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
