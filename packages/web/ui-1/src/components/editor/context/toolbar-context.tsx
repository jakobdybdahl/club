import { LexicalEditor } from "lexical";
import React from "react";

const Context = React.createContext<{
  editor: LexicalEditor;
}>({
  editor: {} as LexicalEditor,
});

export function ToolbarContext({
  editor,
  children,
}: {
  editor: LexicalEditor;
  children: React.ReactNode;
}) {
  return (
    <Context.Provider
      value={{
        editor,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useToolbarContext() {
  return React.useContext(Context);
}
