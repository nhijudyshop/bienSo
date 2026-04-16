"use client";

import { formatPlate } from "@/lib/api";

interface PlateNumberProps {
  plate: string;
  colorCode: number | string;
  size?: "sm" | "md" | "lg";
  suffix?: string;
}

export default function PlateNumber({
  plate,
  colorCode,
  size = "md",
  suffix,
}: PlateNumberProps) {
  const isYellow = String(colorCode) === "3";
  const formatted = formatPlate(plate);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span className="inline-flex flex-col items-center gap-0.5">
      <span
        className={`plate ${isYellow ? "plate-yellow" : "plate-white"} ${sizeClasses[size]}`}
      >
        {formatted}
      </span>
      {suffix && (
        <span className="text-xs text-accent-orange">{suffix}</span>
      )}
    </span>
  );
}
