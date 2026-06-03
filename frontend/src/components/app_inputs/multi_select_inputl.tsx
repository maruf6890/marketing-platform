"use client";
import React from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { Check } from "lucide-react";

interface MultiSelectProps {
  id: string;
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  description?: string;
  singleLine?: boolean; // row or column layout
}

export default function MultiSelectButtons({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select options",
  className = "",
  disabled = false,
  required = false,
  description,
  helperText,
  singleLine = true,
}: MultiSelectProps) {
  const toggleValue = (val: string) => {
    if (disabled) return;
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      {label && (
        <Label
          htmlFor={id}
          className={`text-base block ${
            required
              ? "after:content-['*'] after:ml-0.5 after:text-destructive"
              : ""
          }`}
        >
          {label}
        </Label>
      )}

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <div
        className={`flex flex-wrap gap-2 mt-1 ${
          singleLine ? "flex-row" : "flex-col"
        }`}
      >
        {options.map((opt) => {
          const isSelected = value.includes(opt.value);
          return (
            <Button
              key={opt.value}
              variant={isSelected ? "outline" : "default"} // shadcn variants
              size="sm"
              onClick={() => toggleValue(opt.value)}
              disabled={disabled}
              className={`flex items-center gap-1 border ${
                isSelected ? "border-green-500 text-green-700" : ""
              }`}
            >
              {opt.label}
              {isSelected && <Check className="w-4 h-4 text-green-600" />}
            </Button>
          );
        })}
      </div>

      {value.length === 0 && helperText && (
        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
          <IoMdInformationCircleOutline className="w-4 h-4" />
          {helperText}
        </p>
      )}
    </div>
  );
}
