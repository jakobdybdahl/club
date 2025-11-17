import { withActor } from "@club/core/actor";
import { club } from "@club/core/club/club.sql";
import { db } from "@club/core/drizzle/index";
import { Event } from "@club/core/event/index";
import { input, select } from "@inquirer/prompts";

const clubs = await db.select({ id: club.id, name: club.name }).from(club);
const clubId = await select<string>({
  message: "Select club",
  choices: clubs.map((c) => ({
    value: c.id,
    name: c.name,
  })),
});

await withActor({ type: "system", properties: { clubId } }, async () => {
  const name = await input({ message: "Event name", required: true });
  await Event.create({ name, visibility: "public" });
});

process.exit(0);
