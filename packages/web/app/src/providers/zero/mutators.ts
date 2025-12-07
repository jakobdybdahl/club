import { Page } from "@club/core/cms/index";
import { Event } from "@club/core/event/index";
import type { User } from "@club/core/user/index";
import { toSlug } from "@club/core/util/slug";
import type { WithId } from "@club/core/util/types";
import type { schema } from "@club/zero/schema";
import {
  defineMutator,
  defineMutators,
  type Transaction,
} from "@rocicorp/zero";

export type MutatorTx = Transaction<typeof schema>;

type Populated<T> = T & {
  clubId: string;
  actorId: string;
  timeCreated: number;
  timeUpdated: number;
};

type Create<T> = Populated<
  T extends { id?: string | undefined | null } ? WithId<T> : T
>;

type Update<T> = {
  clubId: string;
  actorId: string;
  timeUpdated: number;
} & (T extends { id?: string | undefined | null } ? WithId<T> : T);

export const mutators = defineMutators({
  user: {
    create: defineMutator<Create<User.CreateInput>>(async ({ tx, args }) => {
      await tx.mutate.user.insert({
        timeCreated: args.timeCreated,
        timeUpdated: args.timeUpdated,
        id: args.id,
        email: args.email,
        color: "",
        initials: "",
        clubId: args.clubId,
        creatorId: args.actorId,
        creatorType: "user",
      });
    }),
  },
  event: {
    create: defineMutator<Create<Event.CreateInput>>(async ({ tx, args }) => {
      await tx.mutate.event.insert({
        id: args.id,
        clubId: args.clubId,
        creatorId: args.actorId,
        creatorType: "user",
        name: args.name,
        visibility: args.visibility ?? "private",
        timeCreated: args.timeCreated,
        timeUpdated: args.timeUpdated,
      });
    }),
  },
  page: {
    create: defineMutator<Create<Page.CreateInput>>(async ({ tx, args }) => {
      await tx.mutate.page.insert({
        id: args.id,
        clubId: args.clubId,
        creatorId: args.actorId,
        creatorType: "user",
        body: args.body,
        slug: toSlug(args.slug ?? args.title),
        timeCreated: args.timeCreated,
        timeUpdated: args.timeUpdated,
        title: args.title,
        visibility: args.visibility ?? "public",
        parentId: args.parentId,
      });
    }),
    update: defineMutator<Update<Page.UpdateInput>>(async ({ tx, args }) => {
      await tx.mutate.page.update({
        id: args.id,
        clubId: args.clubId,
        timeUpdated: args.timeUpdated,
        body: args.body,
        title: args.title,
      });
    }),
  },
});
