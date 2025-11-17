export * as User from "./";

import { and, eq, isNull, sql } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { Resource } from "sst";
import { z } from "zod";
import { useActor, useActorId, useWorkspace } from "../actor";
import { bus } from "../bus";
import { createEvent } from "../event";
import { Permission } from "../permission";
import { PermissionGroup } from "../permission/group";
import {
  permissionGroup,
  permissionGroupMember,
} from "../permission/permission.sql";
import { hasPermission, withPermission } from "../util/auth";
import { colors } from "../util/color";
import { ForbiddenError } from "../util/error";
import {
  createTransaction,
  createTransactionEffect,
  useTransaction,
} from "../util/transaction";
import { zod } from "../util/zod";
import { user } from "./user.sql";

export const Events = {
  UserCreated: createEvent(
    "user.created",
    z.object({ userId: z.string().nanoid() })
  ),
};

export const Info = createSelectSchema(user, {
  id: () => z.nanoid(),
  initials: (schema) =>
    schema
      .trim()
      .length(2)
      .regex(/^[A-Z][A-Z0-9]*$/),
  email: () => z.email().nonempty(),
  clubId: () => z.nanoid(),
});
export type Info = z.infer<typeof Info>;

export const fromEmail = zod(Info.shape.email, (email) => {
  return useTransaction(async (tx) => {
    const u = await tx
      .select()
      .from(user)
      .where(and(eq(user.email, email), eq(user.clubId, useWorkspace())))
      .then((rows) => rows.at(0));

    if (!u) return;

    const groups = await tx
      .select({ permissions: permissionGroup.permissions })
      .from(permissionGroupMember)
      .innerJoin(
        permissionGroup,
        eq(permissionGroupMember.groupId, permissionGroup.id)
      )
      .where(
        and(
          eq(permissionGroupMember.userId, u.id),
          isNull(permissionGroupMember.timeDeleted)
        )
      );

    const permissions = Array.from(
      groups
        .flatMap((group) => group.permissions)
        .reduce((set, p) => set.add(p), new Set<Permission>())
    );

    return {
      ...u,
      permissions,
    };
  });
});

export const CreateInput = Info.pick({
  id: true,
  email: true,
  timeCreated: true,
  timeUpdated: true,
})
  .partial({ id: true })
  .extend({ first: z.boolean().optional() });

export type CreateInput = z.infer<typeof CreateInput>;

export const create = withPermission(
  "add:user",
  zod(CreateInput, (input) =>
    useTransaction(async (tx) => {
      const initials = input.email
        .split("@")[0]!
        .substring(0, 2)
        .padEnd(2, "P")
        .toUpperCase();

      await tx
        .insert(user)
        .values({
          id: input.id ?? nanoid(),
          email: input.email,
          clubId: useWorkspace(),
          color: `#${colors[Math.floor(Math.random() * colors.length)]}`,
          initials,
          timeSeen: input.first ? Date.now() : undefined,
          creatorId: useActorId(),
          creatorType: useActor().type,
        })
        .onConflictDoUpdate({
          target: [user.email, user.clubId],
          set: {
            timeDeleted: null,
          },
        });

      const id = await tx
        .select({ id: user.id })
        .from(user)
        .where(
          and(eq(user.email, input.email), eq(user.clubId, useWorkspace()))
        )
        .execute()
        .then((rows) => rows[0]!.id);

      await createTransactionEffect(() =>
        bus.publish(Resource.Bus, Events.UserCreated, { userId: id })
      );

      return id;
    })
  )
);

export const remove = zod(Info.shape.id, (id) => {
  const actor = useActor();
  const isSelf = actor.type === "user" && actor.properties.userId === id;

  const canRemove = isSelf || hasPermission("delete:user");

  if (!canRemove) {
    throw new ForbiddenError();
  }

  return createTransaction(async (tx) => {
    await PermissionGroup.unassignUser({ userId: id });

    const u = await tx
      .update(user)
      .set({ timeUpdated: sql`now()`, timeDeleted: sql`now()` })
      .where(
        and(
          eq(user.id, id),
          eq(user.clubId, useWorkspace()),
          isNull(user.timeDeleted)
        )
      )
      .returning()
      .then((rows) => rows[0]);

    if (!u) return;

    return u.id;
  });
});

export const UpdateInput = Info.pick({
  id: true,
  color: true,
  initials: true,
  fullName: true,
  username: true,
});

export type UpdateInput = z.infer<typeof UpdateInput>;

export const update = zod(UpdateInput, (input) => {
  return useTransaction(async (tx) => {
    const u = await tx
      .select()
      .from(user)
      .where(
        and(
          eq(user.id, input.id),
          eq(user.clubId, useWorkspace()),
          isNull(user.timeDeleted)
        )
      )
      .then((rows) => rows[0]);

    if (!u) return;

    // auth
    const actor = useActor();
    const isAllowed =
      (actor.type === "user" && actor.properties.userId === u.id) ||
      hasPermission("update:user");

    if (!isAllowed) {
      throw new ForbiddenError();
    }

    const updatedUser = await tx
      .update(user)
      .set({
        color: input.color,
        initials: input.initials,
        fullName: input.fullName,
        username: input.username,
        timeUpdated: sql`now()`,
      })
      .where(
        and(
          eq(user.id, input.id),
          eq(user.clubId, useWorkspace()),
          isNull(user.timeDeleted)
        )
      )
      .returning()
      .then((rows) => rows[0]);

    return updatedUser;
  });
});
