import { Account } from "@club/core/account/index";
import { withActor } from "@club/core/actor";
import { club } from "@club/core/club/club.sql";
import { Club } from "@club/core/club/index";
import { db, eq } from "@club/core/drizzle/index";
import { input } from "@inquirer/prompts";
import z from "zod";

const accountEmail = "dybdahl@smukand.dk";

const account = await (async () => {
  const existing = await Account.fromEmail(accountEmail);
  if (existing) return existing;
  const id = await Account.create({ email: accountEmail });
  return (await Account.fromID(id))!;
})();

const name = await (async () => {
  let valid = false;
  let name = "";
  while (!valid) {
    name = await input({ message: "Club name:", required: true });
    valid = z.string().trim().nonempty().safeParse(name).success;
    if (!valid) console.log("Invalid name");
  }
  return name;
})();

console.log(`Creating club '${name}'...`);

const c = await (async () => {
  const existing = await db
    .select()
    .from(club)
    .where(eq(club.name, name))
    .then((rows) => rows[0]);

  if (existing) return (await Club.fromId(existing.id))!;

  return await withActor(
    {
      type: "account",
      properties: { accountId: account.id, email: account.email },
    },
    async () => {
      const id = await Club.create({ name });
      return (await Club.fromId(id))!;
    }
  );
})();

console.log(c);

process.exit(0);
