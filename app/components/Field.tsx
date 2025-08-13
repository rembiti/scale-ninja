import React from "react";

interface FieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, children, className = "" }: FieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-neutral-200">{label}</label>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
