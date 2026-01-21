import { ArrowBigUp, CommandIcon, DeleteIcon, OptionIcon } from "lucide-react";
import { useState } from "react";
import { cn, getOS, OS } from "../util";

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
  children,
  maybeMod,
  ...props
}: { maybeMod?: boolean } & React.ComponentProps<"kbd">) {
  if (maybeMod && typeof children === "string" && children in modifiers) {
    return <Mod mod={children as Modifier} />;
  }

  return (
    <kbd
      className={cn(
        "bg-background dark:bg-foreground/5 text-foreground/70 pointer-events-none leading-none flex h-5 items-center justify-center gap-1 rounded border has-[svg]:px-0.5 not-has-[svg]:px-1 font-sans text-[0.7rem] font-semibold select-none [&_svg:not([class*='size-'])]:size-3.5 [&_svg:not([class*='size-'])]:min-w-3.5 uppercase",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

export { Kbd, Mod };
export type { Modifier };
