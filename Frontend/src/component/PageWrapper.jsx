import React from "react";
import Navbar from "./Navbar.jsx";
// import Footer from "./Footer.jsx";

export default function PageWrapper({
  title,
  subtitle,
  actions,
  children,
  doctorInfo,
  onSearch,
  onQuickAction,
  onBack,
  className = "",
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900">
      <Navbar
        doctorInfo={doctorInfo}
        onSearch={onSearch}
        onQuickAction={onQuickAction}
        onBack={onBack}
      />

      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 ${className}`}>
        {(title || subtitle || actions) && (
          <header className="mb-6 flex flex-col items-center justify-center text-center gap-4">
            <div>
              {title && (
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-slate-500 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center justify-center gap-3">{actions}</div>}
          </header>
        )}

        {children}
      </main>

      {/* <Footer /> */}
    </div>
  );
}
