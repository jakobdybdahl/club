import { pgTable, varchar } from "drizzle-orm/pg-core";
import { clubId, clubIndexes, creator, timestamps } from "../util/sql";

export const event = pgTable(
  "event",
  {
    ...clubId,
    ...timestamps,
    ...creator,
    name: varchar("name", { length: 255 }).notNull(),
    visibility: varchar("visibility").$type<"public" | "private">().notNull(),
  },
  (table) => [...clubIndexes(table)]
);
