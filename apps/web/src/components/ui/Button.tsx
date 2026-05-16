import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-sans text-body font-medium transition-all duration-archive ease-archive focus-visible:outline-none focus-visible:shadow-gold-glow disabled:pointer-events-none disabled:opacity-40 disabled:text-ghost",
  {
    variants: {
      variant: {
        default: "bg-depth border border-ridge text-parchment hover:border-shingle hover:bg-surface",
        primary: "bg-depth border border-gold text-gold hover:bg-gold/10 hover:border-gold-dim",
        destructive: "bg-depth border border-fear text-fear hover:bg-fear/10",
        outline: "bg-transparent border border-ridge text-ash hover:border-shingle hover:text-parchment",
        ghost: "bg-transparent text-ash hover:text-parchment hover:bg-surface/50",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-card",
        sm: "h-8 px-3 text-small rounded-card",
        lg: "h-11 px-6 rounded-card",
        icon: "h-10 w-10 rounded-card",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
