import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { creator, nanoid, sqlNow, timestamp } from "../../util/sql";

export const customDomain = pgTable(
  "cms_custom_domain",
  {
    ...creator,
    clubId: nanoid("club_id").primaryKey(),
    timeCreated: timestamp("time_created").default(sqlNow()).notNull(),
    timeUpdated: timestamp("time_updated").default(sqlNow()).notNull(),
    domain: varchar("domain", { length: 255 }),
  },
  (table) => [uniqueIndex("domain_unique_idx").on(table.domain)]
);
