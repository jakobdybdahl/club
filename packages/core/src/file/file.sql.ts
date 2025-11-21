import { index, integer, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import {
  clubId,
  clubIndexes,
  creator,
  nanoid,
  sqlNow,
  timestamp,
} from "../util/sql";
import { FILE_STATES } from "./defs";

export const uploadStateEnum = pgEnum("file_upload_state", FILE_STATES);

export const file = pgTable(
  "file",
  {
    ...clubId,
    ...creator,
    timeCreated: timestamp("time_created").notNull().default(sqlNow()),
    timeUpdated: timestamp("time_updated").notNull().default(sqlNow()),
    name: varchar("name").notNull(),
    size: integer("size").notNull(), // in bytes
    contentType: varchar("content_type"),
    state: uploadStateEnum("state").notNull().default("pending-upload"),
    subjectId: nanoid("subject_id").notNull(),
    subjectType: varchar("subject_type").notNull(),
  },
  (table) => [
    ...clubIndexes(table),
    index("subject_idx").on(table.clubId, table.subjectId, table.id),
  ]
);
