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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                <h3 className="font-extrabold text-slate-900 tracking-tight text-base">Add Quantity</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 mb-4">
                    Adding stock for <strong className="text-slate-700">{medicine.name}</strong> (Current: {medicine.quantity}).
                </p>
                <form onSubmit={handleSubmit}>
                    <InputField
                        type="number"
                        required
                        value={qtyToAdd}
                        onChange={(e) => setQtyToAdd(e.target.value)}
                        placeholder="e.g. 50"
                    />
                    <div className="flex items-center justify-end gap-3 mt-5">
                        <Button
                            type="button"
                            onClick={onClose}
                            background="bg-slate-100!"
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-black/50!"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="px-5 py-2.5 font-semibold text-xs rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-none shadow-sm w-auto"
                        >
                            Add Stock
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
