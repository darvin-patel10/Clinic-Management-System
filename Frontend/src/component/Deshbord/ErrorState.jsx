import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorState({ onRetry }) {
    return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertTriangle className="h-10 w-10 text-red-600" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-900">
                Something went wrong
            </h2>
            <p className="max-w-sm text-sm text-gray-600">
                We couldn&apos;t load your data. Please check your connection
                and try again.
            </p>
            <button
                type="button"
                onClick={onRetry}
                className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
                Retry
            </button>
        </div>
    );
}
