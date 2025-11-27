import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui-components/react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "../util";
import { ArrowSvg } from "./arrow-svg";

const NavigationMenuRoot = NavigationMenuPrimitive.Root;
const NavigationMenuList = NavigationMenuPrimitive.List;
const NavigationMenuItem = NavigationMenuPrimitive.Item;
const NavigationMenuPortal = NavigationMenuPrimitive.Portal;
const NavigationMenuLink = NavigationMenuPrimitive.Link;

const navigationMenuTriggerStyle = cva(
  "inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-popup-open:hover:bg-accent data-popup-open:text-accent-foreground data-popup-open:focus:bg-accent data-popup-open:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1"
);

function NavigationMenuTriggerComp({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuTrigger>) {
  return (
    <Slot className={cn(navigationMenuTriggerStyle(), className)} {...props} />
  );
}

function NavigationMenuRootLink(
  props: React.ComponentProps<typeof NavigationMenuPrimitive.Link>
) {
  return (
    <NavigationMenuTriggerComp>
      <NavigationMenuLink {...props} />
    </NavigationMenuTriggerComp>
  );
}

function NavigationMenuTrigger({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuTriggerComp>
      <NavigationMenuPrimitive.Trigger {...props} />
    </NavigationMenuTriggerComp>
  );
}

function NavigationMenuIcon({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Icon>) {
  return (
    <NavigationMenuPrimitive.Icon
      className={cn(
        "transition-transform duration-200 ease-in-out data-popup-open:rotate-180 ml-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-3.5" />
    </NavigationMenuPrimitive.Icon>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      className={cn(
        "w-[calc(100vw-40px)] h-full p-2 sm:w-max sm:min-w-[400px]",
        "transition-[opacity,transform,translate] duration-[var(--duration)] ease-[var(--easing)]",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        "data-[starting-style]:data-[activation-direction=left]:translate-x-[-50%]",
        "data-[starting-style]:data-[activation-direction=right]:translate-x-[50%]",
        "data-[ending-style]:data-[activation-direction=left]:translate-x-[50%]",
        "data-[ending-style]:data-[activation-direction=right]:translate-x-[-50%]",
        className
      )}
      {...props}
    />
  );
}

function NavigationMenuPositioner({
  className,
  ...props
}: Omit<
  React.ComponentProps<typeof NavigationMenuPrimitive.Positioner>,
  "style"
>) {
  return (
    <NavigationMenuPrimitive.Positioner
      sideOffset={10}
      collisionPadding={{ top: 5, bottom: 5, left: 20, right: 20 }}
      collisionAvoidance={{ side: "none" }}
      className={cn(
        "box-border h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom] duration-[var(--duration)] ease-[var(--easing)] before:absolute before:content-[''] data-[instant]:transition-none data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0 data-[side=bottom]:before:h-2.5 data-[side=left]:before:top-0 data-[side=left]:before:right-[-10px] data-[side=left]:before:bottom-0 data-[side=left]:before:w-2.5 data-[side=right]:before:top-0 data-[side=right]:before:bottom-0 data-[side=right]:before:left-[-10px] data-[side=right]:before:w-2.5 data-[side=top]:before:right-0 data-[side=top]:before:bottom-[-10px] data-[side=top]:before:left-0 data-[side=top]:before:h-2.5",
        className
      )}
      style={{
        ["--duration" as string]: "0.35s",
        ["--easing" as string]: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      {...props}
    />
  );
}

function NavigationMenuPopup({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Popup>) {
  return (
    <NavigationMenuPrimitive.Popup
      className={cn(
        "data-[ending-style]:easing-[ease] relative h-[var(--popup-height)] origin-[var(--transform-origin)] rounded-lg bg-popover shadow-lg outline transition-[opacity,transform,width,height,scale,translate] duration-[var(--duration)] ease-[var(--easing)] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[ending-style]:duration-150 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 w-[var(--popup-width)] sm:w-[var(--popup-width)]",
        className
      )}
      {...props}
    />
  );
}

function NavigationMenuArrow({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Arrow>) {
  return (
    <NavigationMenuPrimitive.Arrow
      className={cn(
        "flex transition-[left] duration-[var(--duration)] ease-[var(--easing)] data-[side=bottom]:top-[-9px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180",
        className
      )}
      {...props}
    >
      <ArrowSvg borderPathClassName="fill-ring/50" />
    </NavigationMenuPrimitive.Arrow>
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <NavigationMenuPrimitive.Viewport
      className={cn("relative overflow-hidden", className)}
      {...props}
    />
  );
}

export {
  NavigationMenuArrow,
  NavigationMenuContent,
  NavigationMenuIcon,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuPopup,
  NavigationMenuPortal,
  NavigationMenuPositioner,
  NavigationMenuRoot,
  NavigationMenuRootLink,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
};
