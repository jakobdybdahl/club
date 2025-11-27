import { Widget as WidgetType } from "@club/core/cms/page/schema";
import { EventListWidget } from "./event-list";
import { ImageWidget } from "./image";
import { RichTextWidget } from "./rich-text";

type WidgetOfType<T extends WidgetType["type"]> = Extract<
  WidgetType,
  { type: T }
>;

const WidgetMap: {
  [Type in WidgetType["type"]]: React.FC<{
    data: WidgetOfType<Type>;
    className?: string;
  }>;
} = {
  "rich-text": RichTextWidget,
  events: EventListWidget,
  image: ImageWidget,
};

export function WidgetRenderer({ data }: { data: WidgetType }) {
  const Comp = WidgetMap[data.type];
  // @ts-expect-error do not know why data prop is of type 'never'
  return <Comp data={data} />;
}
