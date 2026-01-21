import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import { EditorState, SerializedEditorState } from "lexical";
import { TooltipProvider } from "../tooltip";
import { Plugins } from "./plugins/index";
import { editorTheme } from "./themes/editor-theme";

function onError(error: Error) {
  console.error(error);
}

export type { EditorState, SerializedEditorState };

export function Editor({
  state,
  onChange,
}: {
  state?: EditorState | string;
  onChange?: (state: EditorState) => void;
}) {
  const config: InitialConfigType = {
    namespace: "my-editor",
    theme: editorTheme,
    editorState: state,
    onError,
  };

  return (
    <div className="bg-background overflow-hidden rounded-lg border shadow">
      <LexicalComposer initialConfig={config}>
        <TooltipProvider>
          <Plugins />
          <OnChangePlugin
            ignoreSelectionChange
            onChange={(state) => onChange?.(state)}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}
