import { and, eq, sql } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import z from "zod";
import { assertActor, useActor, useActorId, useWorkspace } from "../actor";
import { db } from "../drizzle";
import { Storage } from "../storage/index";
import { withPermission } from "../util/auth";
import { createTransaction, useTransaction } from "../util/transaction";
import { zod } from "../util/zod";
import { file } from "./file.sql";

export * as File from "./index";

export const Info = createSelectSchema(file, {
  name: (schema) => schema.trim().nonempty(),
  size: (schema) => schema.min(0).max(6_000_000),
  subjectType: () => z.enum(["task", "comment"]),
  contentType: (schema) => schema.trim().nonempty(),
});

export type Info = z.infer<typeof Info>;

export const upload = zod(
  Info.pick({
    id: true,
    name: true,
    size: true,
    subjectId: true,
    subjectType: true,
  })
    .partial({
      id: true,
      size: true,
    })
    .extend({
      contentType: z.string().trim().nonempty().optional(),
    }),
  async (input) => {
    return createTransaction(async (tx) => {
      const entity = await tx
        .insert(file)
        .values({
          id: input.id ?? nanoid(),
          creatorId: useActorId(),
          creatorType: useActor().type,
          name: input.name,
          size: input.size ?? 0,
          subjectId: input.subjectId,
          subjectType: input.subjectType,
          contentType: input.contentType,
          workspaceId: useWorkspace(),
          state: "pending-upload",
        })
        .returning()
        .then((rows) => rows[0]);

      if (!entity) {
        throw new Error("Failed to create file entity in database");
      }

      const info = await Storage.getUpload({
        id: entity.id,
        context: input.subjectType,
        contentType: input.contentType ?? undefined,
      });

      return {
        id: entity.id,
        upload: info,
      };
    });
  }
);

export const download = zod(Info.pick({ id: true }), async ({ id }) => {
  const entity = await db
    .select()
    .from(file)
    .where(and(eq(file.workspaceId, useWorkspace()), eq(file.id, id)))
    .then((rows) => rows.at(0));

  if (!entity) return;

  const info = await Storage.getDownload({
    id: entity.id,
    filename: entity.name,
    context: entity.subjectType,
  });

  return info;
});

export const setState = zod(
  Info.pick({ id: true, state: true }),
  async (input) => {
    assertActor("system");
    return createTransaction(async (tx) => {
      await tx
        .update(file)
        .set({
          timeUpdated: sql`now()`,
          state: input.state,
        })
        .where(
          and(eq(file.id, input.id), eq(file.workspaceId, useWorkspace()))
        );
    });
  }
);

export const fromId = zod(Info.pick({ id: true }), async ({ id }) => {
  return useTransaction((tx) => {
    return tx
      .select()
      .from(file)
      .where(and(eq(file.id, id), eq(file.workspaceId, useWorkspace())))
      .then((rows) => rows[0]);
  });
});

export type RemoveInput = z.infer<typeof remove.schema>;
export const remove = withPermission(
  "write:task",
  zod(Info.pick({ id: true }), async ({ id }) => {
    await createTransaction(async (tx) => {
      const entity = await tx
        .update(file)
        .set({
          state: "removing",
          timeUpdated: sql`now()`,
        })
        .where(and(eq(file.id, id), eq(file.workspaceId, useWorkspace())))
        .returning()
        .then((rows) => rows[0]);

      if (!entity) return;

      const key = Storage.restrictedKey({
        context: entity.subjectType,
        id: entity.id,
      });

      await Storage.remove(key);
    });
  })
);

export const onRemoved = zod(Info.pick({ id: true }), async (input) => {
  assertActor("system");
  return createTransaction(async (tx) => {
    await tx
      .delete(file)
      .where(and(eq(file.id, input.id), eq(file.workspaceId, useWorkspace())));
  });
});
