/**
 * Alert Component
 * Display contextual feedback messages
 */

import * as React from "react"
import { cn } from "../../lib/utils"

interface AlertProps {
  variant?: "default" | "destructive";
  className?: string;
  children: React.ReactNode;
}

export function Alert({ variant = "default", className, children }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4",
        variant === "destructive"
          ? "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
          : "border-border bg-background text-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}

interface AlertDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function AlertDescription({ className, children }: AlertDescriptionProps) {
  return (
    <div className={cn("text-sm [&_p]:leading-relaxed", className)}>
      {children}
    </div>
  );
}

export function AlertTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)}>
      {children}
    </h5>
  );
}
