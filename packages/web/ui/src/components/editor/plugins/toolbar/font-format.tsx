import { Kbd } from "@club/ui/components/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@club/ui/components/tooltip";
import { $isTableSelection } from "@lexical/table";
import {
  $isRangeSelection,
  BaseSelection,
  FORMAT_TEXT_COMMAND,
  TextFormatType,
} from "lexical";
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "../../../toggle-group";
import { useToolbarContext } from "../../context/toolbar-context";
import { useUpdateToolbarHandler } from "../../editor-hooks/use-update-toolbar";
import { Hotkey, HotkeyKbdGroup, HotkeyLabel } from "./hotkey-tooltip";

const FORMATS = [
  { format: "bold", icon: BoldIcon, label: "Bold", hotkey: "mod+b" },
  { format: "italic", icon: ItalicIcon, label: "Italic", hotkey: "mod+i" },
  {
    format: "underline",
    icon: UnderlineIcon,
    label: "Underline",
    hotkey: "mod+u",
  },
  {
    format: "strikethrough",
    icon: StrikethroughIcon,
    label: "Strikethrough",
    hotkey: null,
  },
] as const;

export function FontFormatToolbarPlugin() {
  const { editor } = useToolbarContext();
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

  const $updateToolbar = useCallback((selection: BaseSelection) => {
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      const formats: string[] = [];
      FORMATS.forEach(({ format }) => {
        if (selection.hasFormat(format as TextFormatType)) {
          formats.push(format);
        }
      });
      setActiveFormats((prev) => {
        // Only update if formats have changed
        if (
          prev.length !== formats.length ||
          !formats.every((f) => prev.includes(f))
        ) {
          return formats;
        }
        return prev;
      });
    }
  }, []);

  useUpdateToolbarHandler($updateToolbar);

  return (
    <TooltipProvider>
      <ToggleGroup
        multiple
        value={activeFormats}
        onValueChange={setActiveFormats}
        variant="outline"
        size="sm"
      >
        {FORMATS.map(({ format, icon: Icon, label, hotkey }) => (
          <Tooltip>
            <TooltipTrigger
              render={
                <ToggleGroupItem
                  value={format}
                  aria-label={label}
                  onClick={() =>
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
                  }
                  className="px-2"
                >
                  <Icon className="size-3.5" />
                </ToggleGroupItem>
              }
            />
            <TooltipContent>
              <Hotkey>
                <HotkeyLabel>{label}</HotkeyLabel>
                {hotkey && (
                  <HotkeyKbdGroup>
                    {hotkey.split("+").map((key) => (
                      <Kbd maybeMod>{key}</Kbd>
                    ))}
                  </HotkeyKbdGroup>
                )}
              </Hotkey>
            </TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </TooltipProvider>
  );
}
