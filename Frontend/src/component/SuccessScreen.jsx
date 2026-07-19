import { Success } from "../assets/Icons/index.js";

export default function SuccessScreen() {
    return (
        <div className="su-success-pop flex flex-col items-center justify-center text-center py-6 px-2">
            <div className="w-20 h-20 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center mb-5">
                {/* <svg className="w-10 h-10 text-teal-500" viewBox="0 0 48 48" fill="none"
                    stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline className="su-check-draw" points="10,25 20,35 38,14" />
                </svg> */}
                <Success className="w-10 h-10 text-teal-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                Account created!
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-xs">
                Your doctor account is ready. You can now sign in to access your clinic dashboard.
            </p>
            <a
                href="/login"
                className="flex items-center justify-center h-12 w-full max-w-xs rounded-[.625rem]
                   bg-gradient-to-br from-blue-600 to-blue-800 text-white font-semibold text-base
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