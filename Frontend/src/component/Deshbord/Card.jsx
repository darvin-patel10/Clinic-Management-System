import React from "react";

export default function Card({ title, subtitle, action, children }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-[20px] font-semibold leading-7 text-gray-900">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="mt-0.5 text-xs text-gray-600">{subtitle}</p>
                    )}
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}
