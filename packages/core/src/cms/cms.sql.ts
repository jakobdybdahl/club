import {
  foreignKey,
  json,
  pgTable,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import {
  clubId,
  clubIndexes,
  creator,
  nanoid,
  sqlNow,
  timestamp,
  timestamps,
} from "../util/sql";

export const page = pgTable(
  "cms_page",
  {
    ...clubId,
    ...timestamps,
    ...creator,
    title: varchar("title", { length: 255 }).notNull(),
    visibility: varchar().$type<"public" | "private">().notNull(),
    slug: varchar().notNull(),
    body: json().notNull(),
    parentId: nanoid("parent_id"),
  },
  (table) => [
    ...clubIndexes(table),
    foreignKey({
      columns: [table.clubId, table.parentId],
      foreignColumns: [table.clubId, table.id],
      name: "page_parent_fk",
    }).onDelete("cascade"),
    unique("page_slug_unique")
      .on(table.clubId, table.parentId, table.slug)
      .nullsNotDistinct(), // parentId is null for root tasks
  ]
);

export const menu = pgTable("cms_menu", {
  clubId: nanoid("club_id").primaryKey(),
  timeUpdated: timestamp("time_updated").default(sqlNow()).notNull(),
  config: json().notNull(),
});
