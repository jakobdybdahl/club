import { cn } from "@club/ui/lib/utils";
import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable";

type Props = {
  placeholder: string;
  className?: string;
  placeholderClassName?: string;
};

export function ContentEditable({ placeholder, className }: Props) {
  return (
    <LexicalContentEditable
      className={cn(
        "relative block min-h-72 min-h-full overflow-auto px-8 py-4 focus:outline-none",
        className,
      )}
      aria-placeholder={placeholder}
      placeholder={
        <div className="text-muted-foreground pointer-events-none absolute top-0 left-0 overflow-hidden p-4 text-ellipsis select-none">
          {placeholder}
        </div>
      }
    />
  );
}
