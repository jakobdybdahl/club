import { Account } from "@club/core/account/index";
import { withActor } from "@club/core/actor";
import { club } from "@club/core/club/club.sql";
import { db } from "@club/core/drizzle/index";
import { User } from "@club/core/user/index";
import { input, select } from "@inquirer/prompts";

const clubs = await db.select().from(club);
const c = await select<{ id: string; name: string }>({
  message: "Club:",
  choices: clubs.map((club) => ({ value: club, name: club.name })),
});

await withActor({ type: "system", properties: { clubId: c.id } }, async () => {
  const email = await input({ message: "Email:" });
  const acc = await Account.fromEmail(email);
  if (!acc) {
    console.log(`No account found with email: ${email}`);
    return;
  }

  const existingUser = await User.fromEmail(acc.email);
  if (existingUser) return;

  await User.create({ email: acc.email });
});

process.exit(0);
