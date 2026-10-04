import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-primary text-primary-foreground shadow-btn hover:-translate-y-0.5 hover:brightness-105",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-border bg-card text-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.9),0_1px_2px_oklch(0.42_0.06_30/0.08)] hover:border-primary/35 hover:bg-secondary/70 hover:text-secondary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.7),0_1px_2px_oklch(0.42_0.06_30/0.1)] hover:bg-secondary/70",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-hero text-primary-foreground shadow-btn hover:-translate-y-0.5 hover:brightness-105",
        sunny:
          "bg-gradient-sun text-sunny-foreground shadow-soft hover:-translate-y-0.5 hover:brightness-105",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-full px-3 text-xs",
        lg: "h-11 rounded-full px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
