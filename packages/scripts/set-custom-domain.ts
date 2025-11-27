import { useActor, useActorId, withActor } from "@club/core/actor";
import { customDomain } from "@club/core/cms/custom-domain/custom-domain.sql";
import { db } from "@club/core/drizzle/index";
import { input } from "@inquirer/prompts";
import { selectClub } from "./util";

const club = await selectClub();
const domain = await input({ message: "Domain:" });
await withActor(
  { type: "system", properties: { clubId: club.id } },
  async () => {
    await db
      .insert(customDomain)
      .values({
        clubId: club.id,
        creatorId: useActorId(),
        creatorType: useActor().type,
        domain: domain,
      })
      .onConflictDoUpdate({
        target: customDomain.clubId,
        set: {
          domain,
        },
      });
  }
);

process.exit(0);
