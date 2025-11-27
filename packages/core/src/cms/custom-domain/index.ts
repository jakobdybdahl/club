import { createSelectSchema } from "drizzle-zod";
import z from "zod";
import { useActor, useActorId, useWorkspace } from "../../actor";
import { createTransaction } from "../../util/transaction";
import { zod } from "../../util/zod";
import { customDomain } from "./custom-domain.sql";

export * as CustomDomain from "./index";

export const Info = createSelectSchema(customDomain, {
  domain: () =>
    z
      .string()
      .regex(
        /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/,
        "Invalid domain format"
      ),
});

export type Info = z.infer<typeof Info>;

export const create = zod(Info.pick({ domain: true }), async (input) => {
  return createTransaction(async (tx) => {
    return tx.insert(customDomain).values({
      clubId: useWorkspace(),
      creatorId: useActorId(),
      creatorType: useActor().type,
      domain: input.domain,
    });
  });
});
