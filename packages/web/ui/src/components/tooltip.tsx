import { Tooltip as TooltipPrimitive } from "@base-ui-components/react";
import * as React from "react";

import { cn } from "../util";
import { ArrowSvg } from "./arrow-svg";
import { Kbd } from "./kbd";

const TooltipRoot = TooltipPrimitive.Root;
const TooltipProvider = TooltipPrimitive.Provider;
const TooltipPortal = TooltipPrimitive.Portal;
const TooltipPositioner = TooltipPrimitive.Positioner;
const TooltipTrigger = TooltipPrimitive.Trigger;

function TooltipPopup({
  className,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Popup>) {
  return (
    <TooltipPrimitive.Popup
      className={cn(
        "flex origin-[var(--transform-origin)] flex-col rounded-md bg-popover px-2 py-1 text-sm shadow-lg border transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:duration-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:shadow-none",
        className
      )}
      {...props}
    />
  );
}

function TooltipArrow({
  className,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Arrow>) {
  return (
    <TooltipPrimitive.Arrow
      className={cn(
        "data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180",
        className
      )}
      {...props}
    />
  );
}

function TooltipContent({
  children,
  className,
  side,
  align,
  hidden,
}: { children: React.ReactNode; hidden?: boolean; className?: string } & Pick<
  React.ComponentProps<typeof TooltipPositioner>,
  "side" | "align"
>) {
  return (
    <TooltipPortal>
      <TooltipPositioner sideOffset={8} side={side} align={align}>
        <TooltipPopup hidden={hidden} className={className}>
          <TooltipArrow>
            <ArrowSvg />
          </TooltipArrow>
          {children}
        </TooltipPopup>
      </TooltipPositioner>
    </TooltipPortal>
  );
}

const HotkeyTooltip = (props: {
  children: React.ReactNode;
  hotkey: string;
  label?: string;
  disabled?: boolean;
}) => {
  const keys = React.useMemo(
    () => (props.hotkey !== "" ? props.hotkey.split("+") : []),
    [props.hotkey]
  );
  return (
    <TooltipRoot disabled={props.disabled}>
      {props.children}
      <TooltipPortal>
        <TooltipPositioner sideOffset={4}>
          <TooltipPopup>
            <div className="flex gap-2 items-center">
              {props.label && <div className="text-sm">{props.label}</div>}
              {keys.length > 0 && (
                <div className="flex gap-1">
                  {keys.map((key) => (
                    <Kbd key={key} maybeMod>
                      {key}
                    </Kbd>
                  ))}
                </div>
              )}
            </div>
          </TooltipPopup>
        </TooltipPositioner>
      </TooltipPortal>
    </TooltipRoot>
  );
};

export {
  HotkeyTooltip,
  TooltipArrow,
  TooltipContent,
  TooltipPopup,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
};
