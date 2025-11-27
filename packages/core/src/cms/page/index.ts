import { and, eq, isNull } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import z from "zod";
import { useActor, useActorId, useWorkspace } from "../../actor";
import { toSlug } from "../../util/slug";
import { createTransaction } from "../../util/transaction";
import { zod } from "../../util/zod";
import { page } from "../cms.sql";
import { pageSchema } from "./schema";

export const Info = createSelectSchema(page, {
  visibility: z.enum(["public", "private"]),
  title: () => z.string().trim().nonempty(),
  slug: z.string().trim().nonempty(),
});
export type Info = z.infer<typeof Info>;

export type CreateInput = z.infer<typeof create.schema>;
export const create = zod(
  Info.pick({
    id: true,
    parentId: true,
    slug: true,
    title: true,
    visibility: true,
  })
    .partial({ id: true, visibility: true, slug: true })
    .extend({ body: pageSchema }),
  async (input) => {
    return createTransaction(async (tx) => {
      const id = input.id ?? nanoid();
      await tx.insert(page).values({
        id,
        clubId: useWorkspace(),
        body: input.body,
        creatorId: useActorId(),
        creatorType: useActor().type,
        slug: toSlug(input.slug ?? input.title),
        title: input.title,
        visibility: input.visibility ?? "public",
        parentId: input.parentId,
      });
      return id;
    });
  }
);

export type UpdateInput = z.infer<typeof update.schema>;
export const update = zod(
  Info.pick({ id: true, title: true }).extend({ body: pageSchema }),
  async (input) => {
    return createTransaction(async (tx) => {
      await tx
        .update(page)
        .set({
          timeUpdated: Date.now(),
          body: input.body,
          title: input.title,
        })
        .where(
          and(
            eq(page.clubId, useWorkspace()),
            eq(page.id, input.id),
            isNull(page.timeDeleted)
          )
        );
    });
  }
);
