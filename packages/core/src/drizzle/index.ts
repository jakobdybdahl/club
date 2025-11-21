import { drizzle } from "drizzle-orm/postgres-js";
import { default as pg } from "postgres";
import { Resource } from "sst";
import * as clubSchema from "../club/club.sql";
import * as userSchema from "../user/user.sql";

export * from "drizzle-orm";
export { migrate } from "drizzle-orm/postgres-js/migrator";

export const schema = {
  ...clubSchema,
  ...userSchema,
};

const pgClient = pg({
  idle_timeout: 30000,
  connect_timeout: 30000,
  host: Resource.Database.host,
  database: Resource.Database.database,
  user: Resource.Database.username,
  password: Resource.Database.password,
  port: Resource.Database.port,
  max: parseInt(process.env.POSTGRES_POOL_MAX || "1"),
});

export const db = drizzle(pgClient, {
  schema,
});
