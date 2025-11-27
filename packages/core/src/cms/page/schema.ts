import z from "zod";
import { KebabCase } from "../../util/types";

const WIDGETS = ["rich-text", "image", "events"] as const;
const WidgetType: { [W in (typeof WIDGETS)[number] as KebabCase<W>]: W } = {
  Image: "image",
  RichText: "rich-text",
  Events: "events",
};

const baseWidget = z.object({
  id: z.string(),
  order: z.string(),
});

const richText = baseWidget.extend({
  type: z.literal(WidgetType.RichText),
  backgroundColor: z.string().optional(),
  body: z.json(),
});

const image = baseWidget.extend({
  type: z.literal(WidgetType.Image),
  align: z.enum(["left", "center", "right"]),
  url: z.string().trim().nonempty(),
});

const events = baseWidget.extend({
  type: z.literal(WidgetType.Events),
  display: z
    .object({
      orderBy: z.string().optional(),
      orderByDirection: z.enum(["asc", "desc"]).optional(),
    })
    .optional(),
  filter: z.object({
    clubId: z.string().trim().nonempty(),
  }),
});

export const widgetSchema = z.union([richText, image, events]);

export const pageSchema = z.object({
  backgroundColor: z.string().optional(),
  widgets: z.array(widgetSchema),
});

export type Page = z.infer<typeof pageSchema>;
export type Widget = z.infer<typeof widgetSchema>;
export type WidgetType = Widget["type"];
export type WidgetOfType<T extends Widget["type"]> = Extract<
  Widget,
  { type: T }
>;
