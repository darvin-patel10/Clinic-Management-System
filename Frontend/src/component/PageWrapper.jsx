import React from "react";
import Navbar from "./Navbar.jsx";

export default function PageWrapper({
  title,
  subtitle,
  action,
  actions,
  children,
  doctorInfo,
  onSearch,
  onQuickAction,
  onBack,
  className = "",
}) {
  const headerActions = action || actions;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900">
      <Navbar
        doctorInfo={doctorInfo}
        onSearch={onSearch}
        onQuickAction={onQuickAction}
        onBack={onBack}
      />

      <main className={`flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 ${className}`}>
        {(title || subtitle || headerActions) && (
          <header className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 text-center sm:text-left border-b border-slate-100/80 pb-4 sm:pb-5">
            <div>
              {title && (
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center justify-center sm:justify-end gap-2.5 shrink-0 w-full sm:w-auto">
                {headerActions}
              </div>
            )}
          </header>
        )}

        {children}
      </main>
    </div>
  );
}
