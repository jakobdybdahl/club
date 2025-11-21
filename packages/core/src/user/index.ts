export * as User from "./";

import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { InviteEmail } from "@club/mail/emails/templates/invite";
import { and, eq, isNull } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { render } from "jsx-email";
import { nanoid } from "nanoid";
import { Resource } from "sst";
import { z } from "zod";
import { useActor, useActorId, useWorkspace } from "../actor";
import { bus } from "../bus";
import { db } from "../drizzle";
import { createEvent } from "../event";
import { Permission } from "../permission";
import {
  permissionGroup,
  permissionGroupMember,
} from "../permission/permission.sql";
import { withPermission } from "../util/auth";
import { colors } from "../util/color";
import { createTransactionEffect, useTransaction } from "../util/transaction";
import { zod } from "../util/zod";
import { user } from "./user.sql";

const ses = new SESv2Client({});

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
  .partial({ id: true, timeCreated: true, timeUpdated: true })
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

      const existing = await tx.query.user.findFirst({
        where: and(
          eq(user.email, input.email),
          eq(user.clubId, useWorkspace())
        ),
      });

      if (existing?.timeDeleted === null) {
        throw new Error("User already exists");
      }

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

export const UpdateInput = Info.pick({
  id: true,
  color: true,
  initials: true,
  fullName: true,
  username: true,
});

export type UpdateInput = z.infer<typeof UpdateInput>;

export const sendEmailInvite = zod(Info.pick({ id: true }), async ({ id }) => {
  // const actor = useActor();
  // if (actor.type !== "user") return;
  // user created by another user -> send invite
  const data = await db.query.user.findFirst({
    where: (table, { eq }) => eq(table.id, id),
    with: { club: true },
  });
  if (!data) return;
  const subject = `Join ${data.club.name}`;
  const html = await render(
    InviteEmail({
      appUrl: Resource.WebApp.url,
      club: {
        name: data.club.name,
        slug: data.club.slug,
      },
      assetsUrl: process.env.SST_DEV
        ? undefined
        : `${Resource.WebApp.url}/email`,
    })
  );
  try {
    await ses.send(
      new SendEmailCommand({
        Destination: {
          ToAddresses: [data.email],
        },
        ReplyToAddresses: [`invite@${Resource.Email.sender}`],
        FromEmailAddress: `Club <invite@${Resource.Email.sender}>`,
        Content: {
          Simple: {
            Body: {
              Html: {
                Data: html,
              },
              Text: {
                Data: html,
              },
            },
            Subject: {
              Data: subject,
            },
          },
        },
      })
    );
  } catch (ex) {
    console.error(ex);
  }
});
