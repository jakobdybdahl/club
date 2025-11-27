export * as Club from "./";

import { eq } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { Resource } from "sst";
import { z } from "zod";
import { useWorkspace } from "../actor";
import { bus } from "../bus";
import { createEvent } from "../event";
import { withPermission } from "../util/auth";
import { VisibleError } from "../util/error";
import { toSlug } from "../util/slug";
import { createTransactionEffect, useTransaction } from "../util/transaction";
import { zod } from "../util/zod";
import { club } from "./club.sql";

export const Events = {
  Created: createEvent(
    "club.created",
    z.object({ workspaceId: z.string().nonempty() })
  ),
};

export class ClubExistsError extends VisibleError {
  constructor(slug: string) {
    super("club.slug_exists", `there is already a club with slug "${slug}"`);
  }
}

export const Info = createSelectSchema(club, {
  name: (schema) =>
    schema
      .trim()
      .nonempty()
      .min(3)
      .regex(/^[a-zA-Z0-9\-\s]+$/),
  shortCode: (schema) => schema.trim().min(2).max(3),
});

export type Info = z.infer<typeof Info>;

export const create = zod(
  Info.pick({ name: true, id: true }).partial({ id: true }),
  (input) =>
    useTransaction(async (tx) => {
      const id = input.id ?? nanoid();
      const slug = toSlug(input.name);
      const shortCode = slug.slice(0, 2).toUpperCase();

      const result = await tx
        .insert(club)
        .values({ id, name: input.name, slug, shortCode })
        .onConflictDoNothing()
        .returning();

      if (result.length === 0) {
        throw new ClubExistsError(slug);
      }

      await createTransactionEffect(() =>
        bus.publish(Resource.Bus, Events.Created, { workspaceId: id })
      );

      return id;
    })
);

export const fromId = zod(Info.shape.id, (id) => {
  return useTransaction((tx) => {
    return tx
      .select()
      .from(club)
      .where(eq(club.id, id))
      .execute()
      .then((rows) => rows[0]);
  });
});

export const fromSlug = zod(Info.shape.slug, (slug) => {
  return useTransaction((tx) => {
    return tx
      .select()
      .from(club)
      .where(eq(club.slug, slug))
      .then((rows) => rows[0]);
  });
});

export const UpdateWorkspaceSchema = Info.pick({
  name: true,
  shortCode: true,
});

export type UpdateWorkspaceInput = z.infer<typeof UpdateWorkspaceSchema>;

export const update = withPermission(
  "admin",
  zod(UpdateWorkspaceSchema, (input) => {
    return useTransaction(async (tx) => {
      await tx
        .update(club)
        .set({
          name: input.name,
          shortCode: input.shortCode,
          timeUpdated: Date.now(),
        })
        .where(eq(club.id, useWorkspace()));
    });
  })
);
