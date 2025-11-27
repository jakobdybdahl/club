import { editorTheme } from "@club/ui/editor";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ReadonlyJSONValue } from "@rocicorp/zero";
import { useState } from "react";

export function Renderer({
  state,
  className,
}: {
  state: ReadonlyJSONValue | InitialConfigType["editorState"];
  className?: string;
}) {
  const [config] = useState(
    () =>
      ({
        namespace: "reader",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        editorState: state as any,
        onError: (err) => console.log(err),
        editable: false,
        theme: editorTheme,
      } satisfies InitialConfigType)
  );
  return (
    <div className={className}>
      <LexicalComposer initialConfig={config}>
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </LexicalComposer>
    </div>
  );
}
