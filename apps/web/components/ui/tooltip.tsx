"use client";

import * as React from "react";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode; delayDuration?: number }) {
  return <>{children}</>;
}

export function TooltipTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  return <>{children}</>;
}

export function TooltipContent({ children }: { children: React.ReactNode; side?: "left" | "right" | "top" | "bottom"; className?: string }) {
  return (
    <div className="inline-block rounded border border-orange-600/30 bg-slate-800 px-2 py-1 text-xs text-orange-100 shadow">
      {children}
    </div>
  );
}
