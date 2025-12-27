import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:bg-primary-light active:bg-primary-dark hover:shadow-card",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90",
        outline:
          "border-2 border-border text-foreground bg-transparent hover:bg-muted hover:border-primary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary-light active:bg-secondary-dark hover:shadow-card",
        ghost: 
          "hover:bg-muted hover:text-foreground",
        link: 
          "text-primary underline-offset-4 hover:underline",
        hero: 
          "bg-primary text-primary-foreground shadow-card hover:bg-primary-light hover:shadow-elevated px-8 py-4 text-base",
        heroSecondary:
          "bg-secondary text-secondary-foreground shadow-card hover:bg-secondary-light hover:shadow-elevated px-8 py-4 text-base",
        order:
          "bg-primary text-primary-foreground rounded-xl hover:bg-primary-light px-4 py-2",
        orderOrange:
          "bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary-light px-4 py-2",
        filter:
          "bg-primary text-primary-foreground w-full rounded-xl hover:bg-primary-light",
        admin:
          "bg-primary text-primary-foreground rounded-lg hover:bg-primary-light",
        adminDanger:
          "bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/80",
        whatsapp:
          "bg-[#25D366] text-white hover:bg-[#20BD5A] shadow-card",
        premium:
          "bg-gradient-to-r from-primary to-primary-dark text-primary-foreground shadow-card hover:shadow-elevated",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
