import { index, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import {
  clubId,
  clubIndexes,
  creator,
  timestamp,
  timestamps,
} from "../util/sql";

export const user = pgTable(
  "user",
  {
    ...clubId,
    ...timestamps,
    ...creator,
    fullName: varchar("full_name", { length: 255 }),
    username: varchar("username", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    initials: varchar("initials", { length: 10 }).notNull(), // should be 2 characters, but we'll allow 10 in case of extension
    color: varchar("color", { length: 100 }).notNull(),
    timeSeen: timestamp("time_seen"),
  },
  (table) => [
    ...clubIndexes(table),
    uniqueIndex("user_email").on(table.clubId, table.email),
    index("email_global").on(table.email),
  ]
);
