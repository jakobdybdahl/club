import { Menu as MenuPrimitive } from "@base-ui-components/react/menu";
import { ChevronRightIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../util";

function Menu(props: React.ComponentProps<typeof MenuPrimitive.Root>) {
  return <MenuPrimitive.Root data-slot="menu" {...props} />;
}

function MenuTrigger(
  props: React.ComponentProps<typeof MenuPrimitive.Trigger>
) {
  return (
    <MenuPrimitive.Trigger className="" data-slot="menu-trigger" {...props} />
  );
}

function MenuPortal(props: React.ComponentProps<typeof MenuPrimitive.Portal>) {
  return <MenuPrimitive.Portal data-slot="menu-portal" {...props} />;
}

function MenuPositioner(
  props: React.ComponentProps<typeof MenuPrimitive.Positioner>
) {
  return (
    <MenuPrimitive.Positioner
      className="outline-none"
      data-slot="menu-positioner"
      {...props}
    />
  );
}

function MenuPopup({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Popup>) {
  return (
    <MenuPrimitive.Popup
      className={cn(
        "origin-[var(--transform-origin)] outline-none min-w-[8rem] rounded-md bg-popover text-popover-foreground border p-1 shadow-md transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0",
        className
      )}
      data-slot="menu-popup"
      {...props}
    />
  );
}

function MenuArrow(props: React.ComponentProps<typeof MenuPrimitive.Arrow>) {
  return (
    <MenuPrimitive.Arrow
      className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180"
      data-slot="menu-arrow"
      {...props}
    />
  );
}

function MenuItem({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Item>) {
  return (
    <MenuPrimitive.Item
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm outline-hidden text-foreground/85 hover:text-foreground select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-slot="menu-item"
      {...props}
    />
  );
}

function MenuSeparator(
  props: React.ComponentProps<typeof MenuPrimitive.Separator>
) {
  return (
    <MenuPrimitive.Separator
      className="bg-border -mx-1 my-1 h-px"
      data-slot="menu-separator"
      {...props}
    />
  );
}

function MenuSubmenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.SubmenuTrigger>) {
  return (
    <MenuPrimitive.SubmenuTrigger
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm outline-hidden text-foreground/85 select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-slot="menu-submenu-trigger"
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </MenuPrimitive.SubmenuTrigger>
  );
}

export {
  Menu,
  MenuArrow,
  MenuItem,
  MenuPopup,
  MenuPortal,
  MenuPositioner,
  MenuSeparator,
  MenuSubmenuTrigger,
  MenuTrigger,
};
