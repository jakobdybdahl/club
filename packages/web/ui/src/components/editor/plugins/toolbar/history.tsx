import { Button } from "@club/ui/components/button";
import { ButtonGroup } from "@club/ui/components/button-group";
import { Kbd, Mod } from "@club/ui/components/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@club/ui/components/tooltip";
import { RedoIcon, UndoIcon } from "lucide-react";
import { Hotkey, HotkeyKbdGroup, HotkeyLabel } from "./hotkey-tooltip";

export function HistoryToolbarPlugin() {
  return (
    <TooltipProvider>
      <ButtonGroup>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button size="icon" variant="outline" className="h-8! w-8!">
                <UndoIcon className="size-4" />
              </Button>
            }
          />
          <TooltipContent>
            <Hotkey>
              <HotkeyLabel>Undo</HotkeyLabel>
              <HotkeyKbdGroup>
                <Mod mod="mod" />
                <Kbd>Z</Kbd>
              </HotkeyKbdGroup>
            </Hotkey>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button size="icon" variant="outline" className="h-8! w-8!">
                <RedoIcon className="size-4" />
              </Button>
            }
          />
          <TooltipContent>
            <Hotkey>
              <HotkeyLabel>Redo</HotkeyLabel>
              <HotkeyKbdGroup>
                <Mod mod="mod" />
                <Kbd>Y</Kbd>
              </HotkeyKbdGroup>
            </Hotkey>
          </TooltipContent>
        </Tooltip>
      </ButtonGroup>
    </TooltipProvider>
  );
}
