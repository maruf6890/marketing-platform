"use client";

import {  useMemo, useState } from "react";

import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";

const requirements = [
  { regex: /.{8,}/, text: "At least 8 characters" },
  { regex: /[a-z]/, text: "At least 1 lowercase letter" },
  { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
  { regex: /[0-9]/, text: "At least 1 number" },
  {
    regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/,
    text: "At least 1 special character",
  },
];

interface PasswordInputProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
  className?: string;
  helperText?: string;
  disabled?: boolean;
    required?: boolean;
    displayStrength?: boolean;
    displayRequirements?: boolean;
    
    
}
const PasswordInput = ({
  id,
  label,
  value,
  required = false,
  onChange,
  placeholder = "Enter text here",
  fullWidth = true,
  className = "",
  disabled = false,
  displayStrength = true,
  displayRequirements = true,
}: PasswordInputProps) => {
  const [password, setPassword] = useState(value);
  const [isVisible, setIsVisible] = useState(false);



  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const strength = requirements.map((req) => ({
    met: req.regex.test(password),
    text: req.text,
  }));

  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  const getColor = (score: number) => {
    if (score === 0) return "bg-border";
    if (score <= 1) return "bg-destructive";
    if (score <= 2) return "bg-orange-500 ";
    if (score <= 3) return "bg-amber-500";
    if (score === 4) return "bg-yellow-400";

    return "bg-green-500";
  };

  const getText = (score: number) => {
    if (score === 0) return "Enter a password";
    if (score <= 2) return "Weak password";
    if (score <= 3) return "Medium password";
    if (score === 4) return "Strong password";

    return "Very strong password";
  };

  return (
    <div className="w-full  space-y-2">
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
      <div className="relative mb-3">
        <Input
          disabled={disabled}
          id={id}
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            onChange(e.target.value);
          }}
          className={`${fullWidth ? "w-full" : "w-auto"} pr-10 ${className}`}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleVisibility}
          className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
        >
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
          <span className="sr-only">
            {isVisible ? "Hide password" : "Show password"}
          </span>
        </Button>
      </div>

      {displayStrength && (
        <div className="mb-4 flex h-1 w-full gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-full flex-1 rounded-full transition-all duration-500 ease-out",
                index < strengthScore ? getColor(strengthScore) : "bg-border",
              )}
            />
          ))}
        </div>
      )}

      {displayRequirements && password.length>0 && (
        <div>
          <p className="text-foreground text-sm font-medium">
            {getText(strengthScore)}. Must contain:
          </p>
          <ul className="mb-4 space-y-1.5">
            {strength.map((req, index) => (
              <li key={index} className="flex items-center gap-2">
                {req.met ? (
                  <CheckIcon className="size-4 text-green-600 dark:text-green-400" />
                ) : (
                  <XIcon className="text-muted-foreground size-4" />
                )}
                <span
                  className={cn(
                    "text-xs",
                    req.met
                      ? "text-green-600 dark:text-green-400"
                      : "text-muted-foreground",
                  )}
                >
                  {req.text}
                  <span className="sr-only">
                    {req.met ? " - Requirement met" : " - Requirement not met"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
