import React, { useEffect } from "react";
import { Trash2 } from "lucide-react";
import Button from "./Button";

export default function DeleteAlart({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Item",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel"
}) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-2xl max-w-xs sm:max-w-sm w-full p-4 sm:p-6 text-center animate-in zoom-in-95 duration-200 my-auto relative overflow-hidden">
                {/* Warning Icon */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100/80 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-2xs shrink-0">
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
                </div>

                {/* Title & Message */}
                <h3 className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">{title}</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1.5 leading-relaxed px-1 sm:px-2">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                    <Button
                        type="button"
                        onClick={onClose}
                        background="bg-slate-100 hover:bg-slate-200 text-slate-700"
                        border="border-none"
                        className="w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 text-center cursor-pointer"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="w-full px-4 py-2.5 font-bold text-xs rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white border-none shadow-sm flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
