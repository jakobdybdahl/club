import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "../util";

function InputRoot({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("relative", className)} {...props} />;
}

function InputIcon({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Slot
      role="input-icon"
      className={cn(
        "absolute left-2.5 top-2.5 bottom-2 pointer-events-none [&~input]:pl-8 size-4 text-muted-foreground",
        className
      )}
    >
      {children}
    </Slot>
  );
}

const inputVariants = cva(
  cn(
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
  ),
  {
    variants: {
      variant: {
        default: "dark:bg-input/30",
        outline: "",
        ghost:
          "p-0 border-none focus-visble:border-ring-0 outline-none aria-invalid:text-destructive aria-invalid:placeholder:text-destructive shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Input({
  className,
  type,
  variant,
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, className }))}
      {...props}
    />
  );
}

function GhostInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "outline-none aria-invalid:text-destructive aria-invalid:placeholder:text-destructive",
        className
      )}
      {...props}
    />
  );
}

export { GhostInput, Input, InputIcon, InputRoot };
