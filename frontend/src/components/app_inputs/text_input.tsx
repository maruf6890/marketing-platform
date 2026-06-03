"use client";
import { IoMdInformationCircleOutline } from "react-icons/io";
import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface TextInputProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  fullWidth?: boolean;
  className?: string;
  textArea?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function TextInput({
  id,
  label,
  value,
  required = false,
  onChange,
  placeholder = "Enter text here",
  type = "text",
  fullWidth = true,
  className = "",
  textArea = false,
  helperText,
  disabled = false,
}: TextInputProps) {
 
 
  return (
    <div className={fullWidth ? "w-full" : "w-auto"}>
      {label && (
        <Label
          htmlFor={id}
          className={`mb-1 block ${
            required
              ? "after:content-['*'] after:ml-0.5 after:text-destructive"
              : ""
          }`}
        >
          {label}
        </Label>
      )}

      {textArea ? (
        <Textarea
          id={id}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
                  disabled={disabled}
            required={required}
          className={`mt-1 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none ${className}`}
        />
      ) : (
                  <Input
         required={required}
          id={id}
          value={value || ""}
          type={type == "number" ? "text" : type}
          placeholder={placeholder}
          disabled={disabled}
         onChange={(e) => {
    let val = e.target.value;

    if (type === "number") {
      // allow digits and dot
      val = val.replace(/[^0-9.]/g, "");

      // allow only ONE dot
      const parts = val.split(".");
      if (parts.length > 2) {
        val = parts[0] + "." + parts.slice(1).join("");
      }
      onChange(val);
      return;
    }
    onChange(val);
  }}
          inputMode={type == "number" ? "decimal" : undefined}
          onKeyDown={(e) => {
            if (
              type === "number" &&
              !/[0-9.]/.test(e.key) &&
              ![
                "Backspace",
                "Delete",
                "ArrowLeft",
                "ArrowRight",
                "Tab",
              ].includes(e.key)
            ) {
              e.preventDefault();
            }

            // prevent second dot
            if (type === "number" && e.key === "." && value.includes(".")) {
              e.preventDefault();
            }
          }}
      
          className={`mt-1 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none ${className}`}
        />
      )}

      {helperText && (
        <p className="mt-1 text-sm text-muted-foreground flex gap-1 items-center">
          <IoMdInformationCircleOutline className="w-4 h-4" />
          {helperText}
        </p>
      )}
    </div>
  );
}
