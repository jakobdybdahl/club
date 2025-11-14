import { defineConfig } from "drizzle-kit";
import { Resource } from "sst";

const connection = {
  user: Resource.Database.username,
  password: Resource.Database.password,
  host: Resource.Database.host,
  database: Resource.Database.database,
  port: Resource.Database.port,
};

export default defineConfig({
  out: "./db/migrations/",
  strict: true,
  schema: "./src/**/*.sql.ts",
  verbose: true,
  dialect: "postgresql",
  dbCredentials: {
    url: `postgres://${connection.user}:${connection.password}@${connection.host}:${connection.port}/${connection.database}`,
  },
});
