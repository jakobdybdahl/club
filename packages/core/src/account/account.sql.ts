import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "../util/sql";

export const account = pgTable(
  "account",
  {
    ...id,
    ...timestamps,
    email: varchar("email", { length: 255 }).notNull(),
  },
  (table) => [uniqueIndex("email").on(table.email)]
);
