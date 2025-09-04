import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary";
  size?: "sm" | "md" | "lg";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const sizeCls = size === "lg" ? "h-11 px-6" : size === "sm" ? "h-8 px-3" : "h-10 px-4";
    const variantCls =
      variant === "secondary"
        ? "bg-slate-800/80 text-orange-200 border border-orange-600/30 hover:bg-slate-700/80 hover:text-orange-100"
        : "bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500";
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
          sizeCls,
          variantCls,
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
