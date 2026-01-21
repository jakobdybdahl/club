import { RedoIcon, UndoIcon } from "lucide-react";
import { Button } from "../../../button";
import { ButtonGroup } from "../../../button-group";
import { HotkeyTooltip, TooltipTrigger } from "../../../tooltip";

export function HistoryToolbarPlugin() {
  return (
    <ButtonGroup>
      <HotkeyTooltip hotkey="mod+z" label="Undo">
        <TooltipTrigger
          render={
            <Button size="icon" variant="outline" className="h-8! w-8!">
              <UndoIcon className="size-4" />
            </Button>
          }
        />
      </HotkeyTooltip>
      <HotkeyTooltip hotkey="mod+y" label="Redo">
        <TooltipTrigger
          render={
            <Button size="icon" variant="outline" className="h-8! w-8!">
              <RedoIcon className="size-4" />
            </Button>
          }
        />
      </HotkeyTooltip>
    </ButtonGroup>
  );
}
