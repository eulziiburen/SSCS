"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function ConfirmButton({ message, children, className = "a-btn danger" }: { message: string; children: ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function SubmitButton({ children, className = "btn" }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? "Хадгалж байна…" : children}
    </button>
  );
}

// Submits its parent form as soon as the value changes
export function AutoSelect({ name, defaultValue, options, label, className }: { name: string; defaultValue: string; options: Record<string, string>; label: string; className?: string }) {
  return (
    <select name={name} defaultValue={defaultValue} aria-label={label} className={className} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
      {Object.entries(options).map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}
