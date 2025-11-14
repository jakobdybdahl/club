import { eq } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import z from "zod";
import { createTransaction } from "../util/transaction";
import { zod } from "../util/zod";
import { message } from "./message.sql";

export * as Message from "./index";

export const Info = createSelectSchema(message);
export type Info = z.infer<typeof Info>;

export type CreateInput = z.input<typeof create.schema>;
export const create = zod(
  Info.omit({
    timeDeleted: true,
  }).partial({ id: true }),
  async (input) => {
    return createTransaction(async (tx) => {
      await tx.insert(message).values({
        id: input.id ?? nanoid(),
        content: input.content,
        sender: input.sender,
        timeCreated: Date.now(),
        timeDeleted: Date.now(),
      });
    });
  }
);

export type RemoveInput = z.infer<typeof remove.schema>;
export const remove = zod(Info.pick({ id: true }), async ({ id }) => {
  return createTransaction(async (tx) => {
    await tx.delete(message).where(eq(message.id, id));
  });
});
