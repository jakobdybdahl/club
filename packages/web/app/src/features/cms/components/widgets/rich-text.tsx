import { WidgetOfType } from "@club/core/cms/page/schema";
import { Renderer } from "../rich-text/renderer";

export function RichTextWidget({ data }: { data: WidgetOfType<"rich-text"> }) {
  return <Renderer state={JSON.stringify(data.body)} />;
}
