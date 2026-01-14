import * as React from "react";

import { cn } from "@/lib/utils";

export interface SwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onChange, ...props }, ref) => {
    return (
      <label className={cn("inline-flex items-center", className)}>
        <input
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          onChange={onChange}
          ref={ref}
          className="sr-only"
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            "relative inline-block h-6 w-11 rounded-full transition-colors",
            // @ts-ignore - allow boolean class selection
            checked ? "bg-blue-500" : "bg-white/10"
          )}
        >
          <span
            className={cn(
              "absolute left-0 top-0 h-6 w-6 transform rounded-full bg-white/90 shadow transition-transform",
              // @ts-ignore
              checked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </span>
      </label>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
