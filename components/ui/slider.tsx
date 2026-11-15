"use client";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  className?: string;
}

/** Radix slider (keyboard + touch accessible) restyled with MarginLab tokens. */
export function Slider({ value, onChange, min, max, step, label, className }: Props) {
  return (
    <SliderPrimitive.Root
      className={cn("relative flex h-11 w-full touch-none select-none items-center", className)}
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onChange(v[0] ?? min)}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-rule">
        <SliderPrimitive.Range className="absolute h-full bg-brand" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-label={label}
        className="block h-6 w-6 rounded-full border-2 border-brand bg-surface shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      />
    </SliderPrimitive.Root>
  );
}
