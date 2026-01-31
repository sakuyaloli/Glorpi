import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glorpi-mint/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas-dark disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-glorpi-mint hover:bg-glorpi-mint-dark text-canvas-dark shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:translate-y-0',
        destructive:
          'bg-validation-error hover:bg-validation-error/90 text-white shadow-btn hover:shadow-btn-hover',
        outline:
          'border border-white/10 bg-white/[0.03] text-ink-white hover:bg-white/[0.06] hover:border-white/15',
        secondary:
          'bg-white/[0.06] text-ink-white hover:bg-white/[0.1]',
        ghost: 'text-ink-slate hover:bg-white/[0.06] hover:text-ink-white',
        link: 'text-glorpi-mint underline-offset-4 hover:underline',
        glass:
          'bg-white/[0.04] backdrop-blur-md border border-white/[0.08] hover:bg-white/[0.06]',
        accent:
          'bg-accent-orange hover:bg-accent-orange-dark text-white shadow-btn hover:shadow-btn-hover',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
