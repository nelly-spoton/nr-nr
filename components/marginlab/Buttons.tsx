import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonStyles = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-ctl px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand text-white hover:bg-[color-mix(in_srgb,var(--brand)_88%,black)]",
        secondary: "border border-rule bg-surface text-ink hover:bg-surface-2",
        ghost: "text-muted hover:bg-surface-2 hover:text-ink",
      },
      size: { md: "", sm: "min-h-9 px-3 text-xs" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>;

const Base = forwardRef<HTMLButtonElement, Props>(function Base({ className, variant, size, ...rest }, ref) {
  return <button ref={ref} type="button" className={cn(buttonStyles({ variant, size }), className)} {...rest} />;
});

export const PrimaryButton = forwardRef<HTMLButtonElement, Omit<Props, "variant">>(function PrimaryButton(p, ref) {
  return <Base ref={ref} variant="primary" {...p} />;
});
export const SecondaryButton = forwardRef<HTMLButtonElement, Omit<Props, "variant">>(function SecondaryButton(p, ref) {
  return <Base ref={ref} variant="secondary" {...p} />;
});
export const GhostButton = forwardRef<HTMLButtonElement, Omit<Props, "variant">>(function GhostButton(p, ref) {
  return <Base ref={ref} variant="ghost" {...p} />;
});
