"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useEffect } from "react";

interface AnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (force: boolean) => void;
  loading: boolean;
}

export default function AnalyticsStartModal({
  open,
  onOpenChange,
  onGenerate,
  loading,
}: AnalyticsModalProps) {
  const [forceRegenerate, setForceRegenerate] = React.useState(false);
  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Analytics
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            Start AI-powered analysis for this post’s engagement data.
          </DialogDescription>
        </DialogHeader>

        {/* Warning Box */}
        <div className="rounded-xl border border-border bg-muted p-4 space-y-2">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <p className="font-medium text-sm">Important Notice</p>
          </div>

          <p className="text-sm text-muted-foreground leading-6">
            Turning on{" "}
            <span className="text-foreground font-medium">
              Force Regeneration
            </span>{" "}
            will replace the previous analytics result and generate a new report
            based on the latest available data.
          </p>
        </div>

        {/* Switch */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Force Regeneration
            </p>
            <p className="text-xs text-muted-foreground">
              Override existing analytics result
            </p>
          </div>

          <Switch
            checked={forceRegenerate}
            onCheckedChange={setForceRegenerate}
          />
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={() => onGenerate(forceRegenerate)}
            disabled={loading}
            className="gap-2 bg-primary text-primary-foreground"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate Analytics
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
