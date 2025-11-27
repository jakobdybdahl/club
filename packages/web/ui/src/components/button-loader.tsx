import { Slot } from "@radix-ui/react-slot";
import { useEffect, useState } from "react";
import { cn } from "../util";
import { Button } from "./button";

function ButtonLoader({
  isLoading: externalIsLoading,
  children,
  className,
  ...props
}: {
  isLoading: boolean;
  children: React.ReactNode;
} & React.ComponentProps<typeof Button>) {
  const [isLoading, setIsLoading] = useState(externalIsLoading);
  useEffect(() => setIsLoading(externalIsLoading), [externalIsLoading]);

  return (
    <Button
      className={cn(
        'group grid [grid-template-areas:"stack"] justify-items-center',
        className
      )}
      data-loading={isLoading}
      {...props}
    >
      {children}
    </Button>
  );
}

function ButtonIdle({
  asChild,
  className,
  ...props
}: { asChild?: boolean } & React.ComponentProps<"span">) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      className={cn(
        "[grid-area:stack] group-data-[loading=true]:opacity-0",
        className
      )}
      {...props}
    />
  );
}

function ButtonLoading({
  asChild,
  className,
  ...props
}: { asChild?: boolean } & React.ComponentProps<"span">) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      className={cn(
        "[grid-area:stack] opacity-0 group-data-[loading=true]:opacity-100",
        className
      )}
      {...props}
    />
  );
}

export { ButtonIdle, ButtonLoader, ButtonLoading };
