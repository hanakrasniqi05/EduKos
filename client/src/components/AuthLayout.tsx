import React from "react";
import { Link } from "react-router-dom";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-[640px] rounded-lg bg-white shadow-md overflow-hidden">
        <div className="bg-[#76C893] px-6 py-4 text-center">
          <Link to="/" className="text-lg font-semibold text-gray-900 hover:text-white transition">
            EduKos
          </Link>
        </div>

        <div className="p-8 md:p-10">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 border-t border-gray-100 pt-4 text-sm text-gray-600">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export function AuthField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block space-y-1.5 text-sm ${className}`}>
      <span className="font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

export const authInputClass =
  "w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#76C893] focus:ring-2 focus:ring-[#76C893]/30";

export const authButtonClass =
  "rounded-md bg-[#76C893] px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-[#5fb87a] disabled:opacity-60";
