import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-card border border-ridge bg-surface px-3 py-2 text-body text-parchment transition-all duration-archive placeholder:text-dust focus:border-gold focus:shadow-gold-glow focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
