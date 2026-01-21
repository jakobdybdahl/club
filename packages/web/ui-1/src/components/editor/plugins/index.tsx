import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "../editor-ui/content-editable";
import { ToolbarPlugin } from "./toolbar";
import { FontFormatToolbarPlugin } from "./toolbar/font-format";
import { HistoryToolbarPlugin } from "./toolbar/history";

export function Plugins() {
  return (
    <div className="relative">
      <ToolbarPlugin>
        <div className="sticky top-0 flex items-center gap-2 overflow-auto border-b p-1.5">
          <HistoryToolbarPlugin />
          <FontFormatToolbarPlugin />
        </div>
      </ToolbarPlugin>
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="relative block p-4 min-h-72 focus:outline-none"
              placeholder="Press / for commands..."
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
      </div>
    </div>
  );
}
