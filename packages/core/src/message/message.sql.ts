import { pgTable, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "../util/sql";

export const message = pgTable("message", {
  ...id,
  ...timestamps,
  sender: varchar("sender", { length: 255 }).notNull(),
  content: varchar("content", { length: 10240 }).notNull(),
});
