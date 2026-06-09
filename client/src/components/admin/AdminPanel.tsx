import type { ReactNode } from "react";

export default function AdminPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-emerald/20 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-yale-blue">{title}</h2>
      {children}
    </div>
  );
}
