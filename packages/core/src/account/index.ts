export * as Account from "./";

import { and, eq, isNull } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { z } from "zod";
import { assertActor } from "../actor";
import { club } from "../club/club.sql";
import { user } from "../user/user.sql";
import { useTransaction } from "../util/transaction";
import { zod } from "../util/zod";
import { account } from "./account.sql";

export const Info = createSelectSchema(account, {
  id: (schema) => schema.nanoid(),
  email: (schema) => schema.trim().toLowerCase().email().nonempty(),
});

export type Info = z.infer<typeof Info>;

export const create = zod(
  Info.pick({ id: true, email: true }).partial({ id: true }),
  (input) =>
    useTransaction(async (tx) => {
      const id = input.id ?? nanoid();
      await tx.insert(account).values({ id, email: input.email });
      return id;
    }),
);

export const fromID = zod(Info.shape.id, async (id) =>
  useTransaction(async (tx) => {
    return tx
      .select()
      .from(account)
      .where(eq(account.id, id))
      .execute()
      .then((rows) => rows[0]);
  }),
);

export const fromEmail = zod(Info.shape.email, async (email) =>
  useTransaction(async (tx) => {
    return tx
      .select()
      .from(account)
      .where(eq(account.email, email))
      .execute()
      .then((rows) => rows[0]);
  }),
);

export const clubs = () => {
  const actor = assertActor("account");
  return useTransaction(async (tx) => {
    const result = await tx
      .select()
      .from(club)
      .innerJoin(user, eq(user.clubId, club.id))
      .where(
        and(
          eq(user.email, actor.properties.email),
          isNull(user.timeDeleted),
          isNull(club.timeDeleted),
        ),
      );
    return result.map((res) => ({
      ...res.club,
      user: res.user,
    }));
  });
};
