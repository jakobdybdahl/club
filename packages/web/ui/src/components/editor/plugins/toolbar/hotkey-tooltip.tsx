import { KbdGroup } from "@club/ui/components/kbd";
import { cn } from "@club/ui/lib/utils";

function Hotkey({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex gap-2 items-center", className)} {...props} />
  );
}

function HotkeyLabel({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-sm", className)} {...props} />;
}

const HotkeyKbdGroup = KbdGroup;

export { Hotkey, HotkeyKbdGroup, HotkeyLabel };
