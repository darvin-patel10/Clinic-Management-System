import React from "react";

export default function Card({ title, subtitle, action, children, className = "" }) {
    return (
        <div className={`rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 lg:p-6 shadow-sm hover:shadow-md/40 transition-all duration-200 w-full min-w-0 ${className}`.trim()}>
            {(title || subtitle || action) && (
                <div className="mb-3.5 sm:mb-4 flex flex-row items-center justify-between gap-3 min-w-0 border-b border-slate-100/80 pb-3 sm:pb-3.5">
                    <div className="min-w-0">
                        {title && (
                            <h2 className="text-base sm:text-lg lg:text-[20px] font-bold leading-snug text-slate-900 tracking-tight truncate">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="mt-0.5 text-xs text-slate-500 font-medium truncate">{subtitle}</p>
                        )}
                    </div>
                    {action && <div className="shrink-0 flex items-center">{action}</div>}
                </div>
            )}
            <div className="min-w-0 w-full">
                {children}
            </div>
        </div>
    );
}
