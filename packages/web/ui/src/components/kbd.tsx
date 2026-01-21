import { cn, getOS, OS } from "@club/ui/lib/utils";
import { ArrowBigUp, CommandIcon, DeleteIcon, OptionIcon } from "lucide-react";
import { useState } from "react";

type Modifier = "shift" | "mod" | "alt" | "backspace";

const modifiers: Record<
  Modifier,
  { element: React.ReactNode } & Partial<
    Record<Exclude<OS, "unknown">, React.ReactNode>
  >
> = {
  shift: {
    element: <ArrowBigUp />,
  },
  mod: {
    macos: <CommandIcon />,
    element: "ctrl",
  },
  alt: {
    macos: <OptionIcon />,
    element: "alt",
  },
  backspace: {
    element: <DeleteIcon />,
  },
};

function Mod({
  mod,
  ...props
}: Omit<React.ComponentProps<typeof Kbd>, "children"> & { mod: Modifier }) {
  const [os] = useState(() => {
    const os = getOS();
    return os === "unknown" ? ("element" as const) : os;
  });
  return <Kbd {...props}>{modifiers[mod][os] ?? modifiers[mod].element}</Kbd>;
}

function Kbd({
  className,
  maybeMod,
  children,
  ...props
}: React.ComponentProps<"kbd"> & { maybeMod?: boolean }) {
  if (maybeMod && typeof children === "string" && children in modifiers) {
    return <Mod mod={children as Modifier} />;
  }

  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-muted text-muted-foreground [[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10 h-5 w-fit min-w-5 gap-1 rounded-none px-1 font-sans text-xs font-medium [&_svg:not([class*='size-'])]:size-3 pointer-events-none inline-flex items-center justify-center select-none",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("gap-1 inline-flex items-center", className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup, Mod };
