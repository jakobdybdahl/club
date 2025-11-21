import { sql } from "drizzle-orm";
import {
  char,
  doublePrecision,
  numeric,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";
import { Actor } from "../actor";
import {
  MONEY_PRECISION,
  MONEY_SCALE,
  QUANTITY_PRECISION,
  QUANTITY_SCALE,
} from "./decimal";

export const nanoid = (name: string) => char(name, { length: 21 });
export const id = {
  get id() {
    return nanoid("id").primaryKey().notNull();
  },
};

export const clubId = {
  get id() {
    return nanoid("id").notNull();
  },
  get clubId() {
    return nanoid("club_id").notNull();
  },
};

export const clubIndexes = (table: any) => [
  primaryKey({ columns: [table.clubId, table.id] }),
];

export const sqlNow = () =>
  sql`(EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric)`;

export const timestamp = (name: string) => doublePrecision(name);

export const timestamps = {
  timeCreated: timestamp("time_created").default(sqlNow()).notNull(),
  timeUpdated: timestamp("time_updated").default(sqlNow()).notNull(),
  timeDeleted: timestamp("time_deleted"),
};

export const actorType = (name: string) =>
  varchar(name).notNull().$type<Actor["type"]>();

export const creator = {
  get creatorId() {
    return varchar("creator_id").notNull();
  },
  get creatorType() {
    return actorType("creator_type");
  },
};

export const money = (name: string) =>
  numeric(name, {
    precision: MONEY_PRECISION,
    scale: MONEY_SCALE,
    mode: "string",
  });

export const quantity = (name: string) =>
  numeric(name, {
    precision: QUANTITY_PRECISION,
    scale: QUANTITY_SCALE,
    mode: "string",
  });

export function escapeLike(val: string) {
  return val.replace(/[%_]/g, "\\$&");
}
