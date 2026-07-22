import React, { useCallback } from "react";
import { toast } from "react-toastify";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

export function useNotification() {
    const showNotification = useCallback(
        ({ title, message, type = "success", duration = 3000, autoClose = true }) => {
            // Select appropriate icon and color palette based on notification type
            let Icon = CheckCircle2;
            let iconColorClass = "bg-emerald-50 text-emerald-600 border border-emerald-100";

            if (type === "error") {
                Icon = AlertCircle;
                iconColorClass = "bg-rose-50 text-rose-600 border border-rose-100";
            } else if (type === "warning" || type === "alert") {
                Icon = AlertTriangle;
                iconColorClass = "bg-amber-50 text-amber-600 border border-amber-100";
            } else if (type === "info") {
                Icon = Info;
                iconColorClass = "bg-blue-50 text-blue-600 border border-blue-100";
            }

            const content = (
                <div className="flex items-start gap-3 py-1 px-0.5">
                    <div className={`p-1.5 rounded-2xl shrink-0 flex items-center justify-center ${iconColorClass}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">{title}</h4>
                        {message && (
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                                {message}
                            </p>
                        )}
                    </div>
                </div>
            );

            const toastOptions = {
                autoClose: autoClose ? duration : false,
                hideProgressBar: false,
                icon: false, // Disable default react-toastify icon to show our custom icon instead
                closeButton: true,
            };

            if (type === "error") return toast.error(content, toastOptions);
            if (type === "warning" || type === "alert") return toast.warning(content, toastOptions);
            if (type === "info") return toast.info(content, toastOptions);
            return toast.success(content, toastOptions);
        },
        [],
    );

    return { showNotification };
}
