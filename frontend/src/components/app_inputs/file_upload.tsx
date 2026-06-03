"use client";

import React from "react";
import { ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value?: File[];
  onChange?: (files: File[]) => void;
  maxFiles?: number;
}

export default function ImageUpload({
  value = [],
  onChange,
  maxFiles = 4,
}: ImageUploadProps) {
  const [files, setFiles] = React.useState<File[]>(value);

  const updateFiles = (newFiles: File[]) => {
    setFiles(newFiles);
    onChange?.(newFiles);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files).slice(0, maxFiles);
    updateFiles([...files, ...selected].slice(0, maxFiles));
  };

  const removeFile = (index: number) => {
    updateFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center hover:bg-muted">
        <div className="rounded-lg bg-muted p-3">
          <ImageIcon className="size-6 text-muted-foreground" />
        </div>
        <p className="mt-2 text-sm font-medium">Upload images</p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG up to 4MB (max {maxFiles})
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleSelect}
          className="hidden"
        />
      </label>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <span className="truncate text-sm">{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
