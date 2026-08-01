import { Success } from "../assets/Icons/index.js";

export default function SuccessScreen() {
    return (
        <div className="su-success-pop flex flex-col items-center justify-center text-center py-5 sm:py-6 px-2 sm:px-4">
            {/* Success icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center mb-4 sm:mb-5">
                <Success className="w-8 h-8 sm:w-10 sm:h-10 text-teal-500" />
            </div>

            {/* Heading */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1.5 sm:mb-2">
                Account created!
            </h2>

            {/* Body */}
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-5 sm:mb-6 max-w-[260px] sm:max-w-xs">
                Your doctor account is ready. You can now sign in to access your clinic dashboard.
            </p>

            {/* CTA button */}
            <a
                href="/login"
                className="flex items-center justify-center h-11 sm:h-12 w-full max-w-[260px] sm:max-w-xs rounded-xl
                   bg-gradient-to-br from-blue-600 to-blue-800 text-white font-semibold text-sm sm:text-base
                   no-underline shadow-[0_4px_14px_rgba(37,99,235,.35)]
                   hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(37,99,235,.45)]
                   transition-all duration-150
                   focus-visible:outline-[3px] focus-visible:outline-blue-600 focus-visible:outline-offset-[3px]"
            >
                Sign in now
            </a>
        </div>
    );
}