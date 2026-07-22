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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
                {/* Warning Icon */}
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-5 h-5" />
                </div>

                {/* Title & Message */}
                <h3 className="font-extrabold text-slate-900 tracking-tight text-base">{title}</h3>
                <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed px-2">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-center gap-3 mt-6">
                    <Button
                        type="button"
                        onClick={onClose}
                        background="bg-slate-100!"
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold text-black/50! w-full"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        background="bg-rose-600 hover:bg-rose-700 text-white border-none!"
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold w-full shadow-sm hover:shadow active:scale-95 transition-all duration-150"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
