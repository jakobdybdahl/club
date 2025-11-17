export * as PermissionGroup from "./group";

import { and, count, eq, isNull, ne, sql } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { z } from "zod";
import { PermissionSchema } from ".";
import { useActor, useActorId, useWorkspace } from "../actor";
import { assert } from "../util/asserts";
import { VisibleError } from "../util/error";
import { createTransaction, useTransaction } from "../util/transaction";
import { zod } from "../util/zod";
import { permissionGroup, permissionGroupMember } from "./permission.sql";

export class PermissionGroupExistsError extends VisibleError {
  public constructor(name: string) {
    super(
      "permission_group.name_exists",
      `Permission group with name '${name}' already exists.`
    );
  }
}

export class PermissionGroupImmutableError extends VisibleError {
  public constructor() {
    super(
      "permission_group.immutable",
      "Cannot update an immutable permission group"
    );
  }
}

export class AtLeastOneMemberRequiredError extends VisibleError {
  public constructor() {
    super(
      "permission_group.one_member",
      "At least one member is required to be assigned to the group"
    );
  }
}

export const Info = createSelectSchema(permissionGroup, {
  id: (schema) => schema.nanoid(),
  name: (schema) => schema.trim().nonempty(),
  permissions: () =>
    z
      .array(PermissionSchema)
      .refine((perms) => new Set(perms).size === perms.length, {
        message: "All items must be unqiue, no duplicates values allowed",
      }),
});

export type Info = z.infer<typeof Info>;

type Member = typeof permissionGroupMember.$inferSelect;

export const CreateSchema = Info.pick({
  id: true,
  name: true,
  permissions: true,
  immutable: true,
}).partial({
  id: true,
  permissions: true,
  immutable: true,
});

export type CreateInput = z.infer<typeof CreateSchema>;

export const create = zod(CreateSchema, (input) => {
  return createTransaction(async (tx) => {
    const id = input.id ?? nanoid();
    const result = await tx
      .insert(permissionGroup)
      .values({
        id,
        name: input.name,
        permissions: input.permissions,
        immutable: input.immutable,
        creatorId: useActorId(),
        creatorType: useActor().type,
        clubId: useWorkspace(),
      })
      .onConflictDoNothing({
        target: [permissionGroup.clubId, permissionGroup.name],
      })
      .returning();

    if (result.length === 0) {
      throw new PermissionGroupExistsError(input.name);
    }

    return id;
  });
});

export const UpdateSchema = Info.pick({
  id: true,
  name: true,
  permissions: true,
});

export type UpdateInput = z.infer<typeof UpdateSchema>;

export const update = zod(UpdateSchema, (input) => {
  return createTransaction(async (tx) => {
    const row = await tx
      .select()
      .from(permissionGroup)
      .where(
        and(
          eq(permissionGroup.id, input.id),
          eq(permissionGroup.clubId, useWorkspace())
        )
      )
      .then((rows) => rows[0]);

    if (!row) return;

    if (row.immutable) {
      throw new PermissionGroupImmutableError();
    }

    try {
      const result = await tx
        .insert(permissionGroup)
        .values({
          id: input.id,
          name: input.name,
          permissions: input.permissions,
          clubId: useWorkspace(),
          creatorId: useActorId(),
          creatorType: useActor().type,
        })
        .onConflictDoUpdate({
          target: [permissionGroup.clubId, permissionGroup.id],
          set: {
            timeUpdated: sql`now()`,
            name: input.name,
            permissions: input.permissions,
          },
          setWhere: eq(permissionGroup.immutable, false),
        })
        .returning();
      return result.at(0);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("unique_name")) {
          throw new PermissionGroupExistsError(input.name);
        }
      }
      throw err;
    }
  });
});

export const remove = zod(Info.shape.id, (id) => {
  return createTransaction(async (tx) => {
    const group = await tx
      .update(permissionGroup)
      .set({
        timeDeleted: sql`now()`,
        name: permissionGroup.id,
        oldName: permissionGroup.name,
      })
      .where(
        and(
          eq(permissionGroup.id, id),
          eq(permissionGroup.clubId, useWorkspace()),
          isNull(permissionGroup.timeDeleted),
          ne(permissionGroup.immutable, true)
        )
      )
      .returning()
      .then((rows) => rows[0]);

    if (!group) return;

    await tx
      .update(permissionGroupMember)
      .set({ timeDeleted: sql`now()` })
      .where(
        and(
          eq(permissionGroupMember.groupId, id),
          eq(permissionGroupMember.clubId, useWorkspace())
        )
      );
  });
});

export const fromId = zod(Info.shape.id, (id) => {
  return useTransaction((tx) =>
    tx
      .select()
      .from(permissionGroup)
      .where(
        and(
          eq(permissionGroup.id, id),
          eq(permissionGroup.clubId, useWorkspace())
        )
      )
      .then((rows) => rows[0])
  );
});

export const immutable = () => {
  return useTransaction(async (tx) => {
    const rows = await tx
      .select()
      .from(permissionGroup)
      .leftJoin(
        permissionGroupMember,
        and(
          eq(permissionGroup.id, permissionGroupMember.groupId),
          isNull(permissionGroupMember.timeDeleted)
        )
      )
      .where(
        and(
          eq(permissionGroup.clubId, useWorkspace()),
          eq(permissionGroup.immutable, true)
        )
      );

    const group = rows[0]?.permission_group;
    if (!group) return;

    return {
      ...group,
      members: rows.map((row) => row.permission_group_member),
    };
  });
};

export const all = () => {
  return useTransaction(async (tx) => {
    return await tx
      .select()
      .from(permissionGroup)
      .where(eq(permissionGroup.clubId, useWorkspace()));
  });
};

export const AssignSchema = Info.pick({ id: true }).extend({
  userId: z.string().nanoid(),
});

export type AssignInput = z.infer<typeof AssignSchema>;

export const assign = zod(AssignSchema, (input) => {
  return createTransaction(async (tx) => {
    await tx
      .insert(permissionGroupMember)
      .values({
        groupId: input.id,
        userId: input.userId,
        clubId: useWorkspace(),
        creatorId: useActorId(),
        creatorType: useActor().type,
      })
      .onConflictDoNothing();
  });
});

export const UnassignSchema = Info.pick({ id: true }).extend({
  userId: z.string().nanoid(),
});

export type UnassignInput = z.infer<typeof UnassignSchema>;

export const unassign = zod(UnassignSchema, (input) => {
  return createTransaction(async (tx) => {
    const group = await tx
      .select({
        immutable: permissionGroup.immutable,
        memberCount: count(permissionGroupMember.userId),
      })
      .from(permissionGroup)
      .leftJoin(
        permissionGroupMember,
        eq(permissionGroup.id, permissionGroupMember.groupId)
      )
      .groupBy(permissionGroup.immutable)
      .where(
        and(
          eq(permissionGroup.id, input.id),
          eq(permissionGroup.clubId, useWorkspace())
        )
      )
      .then((rows) => rows[0]);

    if (!group) return;

    if (group.immutable && group.memberCount === 1) {
      throw new AtLeastOneMemberRequiredError();
    }

    await tx
      .delete(permissionGroupMember)
      .where(
        and(
          eq(permissionGroupMember.groupId, input.id),
          eq(permissionGroupMember.userId, input.userId),
          eq(permissionGroupMember.clubId, useWorkspace())
        )
      );
  });
});

export const unassignUser = zod(
  z.object({ userId: z.string().nanoid() }),
  (input) => {
    return createTransaction(async (tx) => {
      const rows = await tx
        .select()
        .from(permissionGroup)
        .innerJoin(
          permissionGroupMember,
          and(
            eq(permissionGroup.id, permissionGroupMember.groupId),
            eq(permissionGroupMember.userId, input.userId)
          )
        )
        .where(eq(permissionGroup.clubId, useWorkspace()));

      const groups = Object.values(
        rows.reduce<Record<string, Info & { members: Member[] }>>(
          (acc, row) => {
            const group = row.permission_group;
            const member = row.permission_group_member;
            if (!acc[group.id]) {
              acc[group.id] = { ...group, members: [] };
            }
            acc[group.id]!.members.push(member);
            return acc;
          },
          {}
        )
      );

      const immutableGroup = await immutable();
      assert(immutableGroup !== undefined);

      // delete memberships
      for (const group of groups) {
        // check if user is the last member of the immutable group
        if (
          group.id === immutableGroup.id &&
          immutableGroup.members.length === 1
        ) {
          throw new AtLeastOneMemberRequiredError();
        }
        await tx
          .delete(permissionGroupMember)
          .where(
            and(
              eq(permissionGroupMember.groupId, group.id),
              eq(permissionGroupMember.userId, input.userId),
              eq(permissionGroupMember.clubId, useWorkspace())
            )
          );
      }
    });
  }
);
