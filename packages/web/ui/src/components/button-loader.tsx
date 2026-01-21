import { Button } from "@club/ui/components/button";
import { cn } from "@club/ui/lib/utils";
import React, { useEffect, useState } from "react";

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
        className,
      )}
      data-loading={isLoading}
      {...props}
    >
      {children}
    </Button>
  );
}

function ButtonIdle({
  render,
  ...props
}: React.ComponentProps<"span"> & { render?: React.ReactElement }) {
  const element = render ? (
    React.cloneElement(render, props)
  ) : (
    <span
      {...props}
      className={cn(
        "[grid-area:stack] group-data-[loading=true]:opacity-0",
        props.className,
      )}
    />
  );
  return <React.Fragment>{element}</React.Fragment>;
}

function ButtonLoading({
  render,
  ...props
}: React.ComponentProps<"span"> & { render?: React.ReactElement }) {
  const element = render ? (
    React.cloneElement(render, props)
  ) : (
    <span
      {...props}
      className={cn(
        "[grid-area:stack] opacity-0 group-data-[loading=true]:opacity-100",
        props.className,
      )}
    />
  );
  return <React.Fragment>{element}</React.Fragment>;
}

export { ButtonIdle, ButtonLoader, ButtonLoading };
