import z from "zod";

export const ItemType = {
  Section: "section",
  Link: "link",
  Group: "group",
  Highlighted: "highlighted",
} as const;

export const TARGETS = ["_blank"] as const;
export type Target = (typeof TARGETS)[number];

const baseItemSchema = z.object({
  id: z.string(),
  order: z.string(),
  parentId: z.string().optional(),
});

const sectionItemSchema = baseItemSchema.extend({
  type: z.literal(ItemType.Section),
  label: z.string(),
});

const linkItemSchema = baseItemSchema.extend({
  type: z.literal(ItemType.Link),
  label: z.string(),
  href: z.string(),
  target: z.enum(TARGETS).optional(),
  description: z.string().optional(),
});

const groupItemSchema = baseItemSchema.extend({
  type: z.literal(ItemType.Group),
  label: z.string(),
  layout: z.enum(["list", "two-columns"]),
});

const highlightedItemSchema = baseItemSchema.extend({
  type: z.literal(ItemType.Highlighted),
  label: z.string(),
  href: z.string(),
  target: z.enum(TARGETS),
  description: z.string().optional(),
});

export const itemSchema = z.union([
  sectionItemSchema,
  linkItemSchema,
  groupItemSchema,
  highlightedItemSchema,
]);

export const menuSchema = z.object({
  items: z.array(itemSchema),
});

export type Item = z.infer<typeof itemSchema>;
export type ItemType = Item["type"];
export type Menu = z.infer<typeof menuSchema>;
