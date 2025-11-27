import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ToolbarContext } from "../../context/toolbar-context";

export function ToolbarPlugin({ children }: { children: React.ReactNode }) {
  const [editor] = useLexicalComposerContext();
  return <ToolbarContext editor={editor}>{children}</ToolbarContext>;
}
