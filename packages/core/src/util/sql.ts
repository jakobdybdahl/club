import { sql } from "drizzle-orm";
import { char, doublePrecision } from "drizzle-orm/pg-core";

export const nanoid = (name: string) => char(name, { length: 21 });
export const id = {
  get id() {
    return nanoid("id").primaryKey().notNull();
  },
};

export const workspaceId = {
  get id() {
    return nanoid("id").notNull();
  },
  get workspaceId() {
    return nanoid("workspace_id").notNull();
  },
};

export const timestamp = (name: string) =>
  doublePrecision(name).default(
    sql`(EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric)`
  );

export const timestamps = {
  timeCreated: timestamp("time_created").notNull(),
  timeUpdated: timestamp("time_updated").notNull(),
  timeDeleted: timestamp("time_deleted"),
};

export function escapeLike(val: string) {
  return val.replace(/[%_]/g, "\\$&");
}
