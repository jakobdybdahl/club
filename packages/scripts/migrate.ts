import { db, migrate } from "@club/core/drizzle/index";

console.log("migrating...");

await migrate(db, {
  migrationsFolder: "../core/db/migrations",
});

// await db.$client.file("../core/db/triggers.sql");

console.log("done");
process.exit(0);
