"use client";

import { dmSans, sortsMillGoudy } from "@/app/fonts";

interface ProfileInlineFieldProps {
  value: string;
  placeholder: string;
  editable: boolean;
  variant?: "title" | "subtitle";
  className?: string;
  onChange?: (value: string) => void;
}

export default function ProfileInlineField({
  value,
  placeholder,
  editable,
  variant = "subtitle",
  className = "",
  onChange,
}: ProfileInlineFieldProps) {
  if (!editable) {
    if (!value) return null;

    return (
      <p
        className={`${
          variant === "title"
            ? `${sortsMillGoudy.className} text-3xl tracking-[-0.04em] text-white`
            : `${dmSans.className} text-sm text-white/55`
        } ${className}`}
      >
        {value}
      </p>
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-md border border-white/10 bg-[#141414] outline-none placeholder:text-white/25 focus:border-white/20 focus:placeholder:text-white/35 ${
        variant === "title"
          ? `${sortsMillGoudy.className} px-2 py-1 text-3xl tracking-[-0.04em] text-white`
          : `${dmSans.className} px-2 py-1 text-sm text-white/70`
      } ${className}`}
    />
  );
}
