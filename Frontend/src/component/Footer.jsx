import React from "react";
import { ClinicLogo } from "../assets/Icons/index.js";
import { ShieldCheck, Heart, Stethoscope } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <ClinicLogo className="w-8 h-8 drop-shadow-sm" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight leading-none font-sans">
                Clinic<span className="text-blue-500">CMS</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Comprehensive Medical Practice & Clinic Management Suite. Designed to streamline patient records, prescriptions, and daily workflow seamlessly.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>HIPAA Compliant & Secure System</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <a href="/dashboard" className="hover:text-blue-400 transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/patients" className="hover:text-blue-400 transition-colors">
                  Patients Directory
                </a>
              </li>
              <li>
                <a href="/medicines" className="hover:text-blue-400 transition-colors">
                  Medicine Inventory
                </a>
              </li>
              <li>
                <a href="/prescriptions" className="hover:text-blue-400 transition-colors">
                  Prescriptions
                </a>
              </li>
            </ul>
          </div>

          {/* Support & System Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Practice Suite
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li className="flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                <span>Doctor Practice Portal</span>
              </li>
              <li>
                <span className="text-slate-500">Version 1.0.0 (Live)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ClinicCMS. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Healthcare Professionals
          </p>
        </div>
      </div>
    </footer>
  );
}
