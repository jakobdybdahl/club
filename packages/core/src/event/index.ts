import { createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import z from "zod";
import { useActor, useActorId, useWorkspace } from "../actor";
import { createTransaction } from "../util/transaction";
import { zod } from "../util/zod";
import { event } from "./event.sql";

export * as Event from "./index";

export const Info = createSelectSchema(event, {
  visibility: z.enum(["public", "private"]),
});
export type Info = z.infer<typeof Info>;

export type CreateInput = z.infer<typeof create.schema>;
export const create = zod(
  Info.pick({
    id: true,
    name: true,
    visibility: true,
    timeCreated: true,
    timeUpdated: true,
  }).partial({
    id: true,
    visibility: true,
    timeCreated: true,
    timeUpdated: true,
  }),
  async (input) => {
    return createTransaction(async (tx) => {
      await tx.insert(event).values({
        id: input.id ?? nanoid(),
        clubId: useWorkspace(),
        creatorId: useActorId(),
        creatorType: useActor().type,
        name: input.name,
        visibility: input.visibility ?? "private",
        timeCreated: Date.now(),
        timeUpdated: Date.now(),
      });
    });
  }
);
