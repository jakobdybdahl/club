import { Account } from "@club/core/account/index";
import { withActor } from "@club/core/actor";
import { club } from "@club/core/club/club.sql";
import { Club } from "@club/core/club/index";
import { db, eq } from "@club/core/drizzle/index";
import { PermissionGroup } from "@club/core/permission/group";
import { User } from "@club/core/user/index";
import { createTransaction } from "@club/core/util/transaction";
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
      return createTransaction(async () => {
        const clubId = await Club.create({ name });
        const club = await Club.fromId(clubId);
        if (!club) throw new Error("Newly created club was not found");
        await withActor(
          { type: "system", properties: { clubId } },
          async () => {
            const userId = await User.create({
              email: account.email,
            });
            const groupId = await PermissionGroup.create({
              name: "Admin",
              permissions: ["admin"],
              immutable: true,
            });
            await PermissionGroup.assign({ id: groupId, userId });
          }
        );
        return club;
      });
    }
  );
})();

console.log(c);

process.exit(0);
