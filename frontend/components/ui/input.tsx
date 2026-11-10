import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-lg border border-white/80 bg-white/90 px-3.5 py-2 text-sm text-[#24352A] shadow-[0_1px_3px_rgba(25,49,32,0.08)] transition-colors placeholder:text-[#7D8980] focus-visible:border-[#3D8059] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245C40]/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
