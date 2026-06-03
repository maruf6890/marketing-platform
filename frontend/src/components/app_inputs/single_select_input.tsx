"use client";
import React from "react";
import { Label } from "../ui/label";
import { IoMdInformationCircleOutline } from "react-icons/io";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface SingleSelectProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  fullWidth?: boolean;
  className?: string;
  helperText?: string;
  disabled?: boolean;
    required?: boolean;
    single_line?: boolean;
    description?: string;
}

export default function SingleSelect({
  id,
    label,
  description,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  disabled = false,
    required = false,
    single_line = true,
}: SingleSelectProps) {
  return (
    <div
      className={`w-full flex  ${single_line ? "flex-row justify-between" : "flex-col "} gap-1 ${className}`}
    >
      <div>
        {label && (
          <Label
            htmlFor={id}
            className={` text-base block ${
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
      </div>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className="w-auto mt-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
