"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { DefaultButton } from "./DefaultButton";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteDialogProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  onSubmit?: () => void;
  title?: string;
  description?: string;
  cancelLabel?: string;
  submitLabel?: string;
  trigger?: React.ReactNode;
  loading?: boolean;
}
export default function DeleteDialog({
  open,
  onOpenChange,
  onClose,
  onSubmit,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
  cancelLabel = "Cancel",
  submitLabel = "Continue",
  loading = false,
  trigger = <span>Open</span>,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2">
          <DefaultButton variant="outline" onClick={onClose}>
            {cancelLabel}
          </DefaultButton>
          <DefaultButton className="flex items-center gap-1" variant="default" onClick={onSubmit} disabled={loading}>
            {
              !loading ? <>
                <Trash2 className=" size-4" />
                {submitLabel}
              
              </> : 
                <>
                  <Loader2 className="animate-spin size-4" />
                  Deleting...
                </>
           }
          </DefaultButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
