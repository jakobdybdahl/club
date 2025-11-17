import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "../util/sql";

export const club = pgTable(
  "club",
  {
    ...id,
    ...timestamps,
    name: varchar("name", { length: 255 }).notNull(),
    shortCode: varchar("short_code", { length: 10 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    oldSlug: varchar("old_slug", { length: 255 }),
  },
  (table) => [uniqueIndex("slug").on(table.slug)]
);
