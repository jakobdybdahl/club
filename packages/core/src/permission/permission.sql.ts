import {
  boolean,
  foreignKey,
  json,
  pgEnum,
  pgTable,
  primaryKey,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "../user/user.sql";
import { clubId, clubIndexes, creator, nanoid, timestamps } from "../util/sql";
import { ALL_PERMISSIONS, Permission } from "./index";

export const permissionEnum = pgEnum("permission_type", ALL_PERMISSIONS);

export const permissionGroup = pgTable(
  "permission_group",
  {
    ...clubId,
    ...timestamps,
    ...creator,
    permissions: json("permissions")
      .$type<Permission[]>()
      .notNull()
      .default([]),
    name: varchar("name", { length: 255 }).notNull(),
    oldName: varchar("old_name", { length: 255 }),
    immutable: boolean("immutable").default(false),
  },
  (table) => [
    ...clubIndexes(table),
    unique("unique_name").on(table.clubId, table.name),
  ]
);

export const permissionGroupMember = pgTable(
  "permission_group_member",
  {
    clubId: nanoid("club_id").notNull(),
    ...timestamps,
    ...creator,
    userId: nanoid("user_id").notNull(),
    groupId: nanoid("group_id").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.clubId, table.groupId, table.userId] }),
    foreignKey({
      name: "user_fk",
      columns: [table.clubId, table.userId],
      foreignColumns: [user.clubId, user.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "permission_group_fk",
      columns: [table.clubId, table.groupId],
      foreignColumns: [permissionGroup.clubId, permissionGroup.id],
    }).onDelete("cascade"),
  ]
);
