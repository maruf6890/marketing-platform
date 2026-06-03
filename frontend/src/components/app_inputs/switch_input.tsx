"use client";
import React from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

interface SwitchInputProps {
  id: string;
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export default function SwitchInput({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  helperText,
  required = false,
  className = "",
}: SwitchInputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        {label && (
          <div>
            <Label
              htmlFor={id}
              className={`cursor-pointer ${
                required
                  ? "after:content-['*'] after:ml-0.5 after:text-destructive"
                  : ""
              }`}
            >
              {label}
            </Label>
            <p className="text-sm text-muted-foreground">{helperText}</p>
          </div>
        )}
        <div className="flex gap-2 items-center">
          {checked ? (
            <span className="text-muted-foreground">Enabled</span>
          ) : (
            <span className="text-muted-foreground">Disabled</span>
          )}
          <Switch
            id={id}
            checked={checked}
            onCheckedChange={onChange}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
