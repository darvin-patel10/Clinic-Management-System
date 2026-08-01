import React, { useState, useEffect } from "react";
import InputField from "../InputField";
import Button from "../Button";
import { useNotification } from "../../hooks/showNotification";

export default function AddQty({
    isOpen,
    onClose,
    medicine,
    onSubmit
}) {
    const { showNotification } = useNotification();
    const [qtyToAdd, setQtyToAdd] = useState("");

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Reset form when modal state changes
    useEffect(() => {
        if (!isOpen) {
            setQtyToAdd("");
        }
    }, [isOpen]);

    if (!isOpen || !medicine) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const amount = parseInt(qtyToAdd, 10);
        if (isNaN(amount) || amount <= 0) {
            showNotification({
                title: "Error",
                message: "Please enter a valid positive number.",
                type: "error"
            });
            return;
        }
        onSubmit(amount);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-2xl max-w-sm w-full p-4 sm:p-6 animate-in zoom-in-95 duration-200 my-auto">
                <h3 className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">Add Stock Quantity</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 mb-4 leading-relaxed">
                    Adding inventory stock for <strong className="text-slate-800 font-bold">{medicine.name}</strong> (Current Stock: {medicine.quantity}).
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1.5 tracking-wider">
                            Quantity to Add <span className="text-rose-500">*</span>
                        </label>
                        <InputField
                            type="number"
                            min="1"
                            required
                            value={qtyToAdd}
                            onChange={(e) => setQtyToAdd(e.target.value)}
                            placeholder="e.g. 50"
                            className="h-10 sm:h-11"
                        />
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
                        <Button
                            type="button"
                            onClick={onClose}
                            background="bg-slate-100 hover:bg-slate-200 text-slate-700"
                            border="border-none"
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 text-center cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="w-full sm:w-auto px-5 py-2.5 font-bold text-xs rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-none shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                            Add Stock
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
