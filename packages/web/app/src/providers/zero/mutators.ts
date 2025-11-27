import type { Page } from "@club/core/cms/index";
import type { Event } from "@club/core/event/index";
import type { User } from "@club/core/user/index";
import { toSlug } from "@club/core/util/slug";
import type { WithId, WithRequired } from "@club/core/util/types";
import type { schema } from "@club/zero/schema";
import type { CustomMutatorDefs, Transaction } from "@rocicorp/zero";

export type MutatorTx = Transaction<typeof schema>;

type Populated<T extends { timeCreated?: number; timeUpdated?: number }> =
  WithRequired<T, "timeCreated" | "timeUpdated"> & {
    clubId: string;
    actorId: string;
  };

type Create<T extends { timeCreated?: number; timeUpdated?: number }> =
  Populated<T extends { id?: string | undefined | null } ? WithId<T> : T>;

type Populated2<T> = T & {
  clubId: string;
  actorId: string;
  timeCreated: number;
  timeUpdated: number;
};

type Create2<T> = Populated2<
  T extends { id?: string | undefined | null } ? WithId<T> : T
>;

type Update<T> = {
  clubId: string;
  actorId: string;
  timeUpdated: number;
} & (T extends { id?: string | undefined | null } ? WithId<T> : T);

export function createMutators() {
  return {
    user: {
      create: async (tx: MutatorTx, input: Create<User.CreateInput>) => {
        await tx.mutate.user.insert({
          timeCreated: input.timeCreated,
          timeUpdated: input.timeUpdated,
          id: input.id,
          email: input.email,
          color: "",
          initials: "",
          clubId: input.clubId,
          creatorId: input.actorId,
          creatorType: "user",
        });
      },
    },
    event: {
      create: async (tx: MutatorTx, input: Create<Event.CreateInput>) => {
        await tx.mutate.event.insert({
          id: input.id,
          clubId: input.clubId,
          creatorId: input.actorId,
          creatorType: "user",
          name: input.name,
          visibility: input.visibility ?? "private",
          timeCreated: input.timeCreated,
          timeUpdated: input.timeUpdated,
        });
      },
    },
    page: {
      create: async (tx: MutatorTx, input: Create2<Page.CreateInput>) => {
        await tx.mutate.page.insert({
          id: input.id,
          clubId: input.clubId,
          creatorId: input.actorId,
          creatorType: "user",
          body: input.body,
          slug: toSlug(input.slug ?? input.title),
          timeCreated: input.timeCreated,
          timeUpdated: input.timeUpdated,
          title: input.title,
          visibility: input.visibility ?? "public",
          parentId: input.parentId,
        });
      },
      update: async (tx: MutatorTx, input: Update<Page.UpdateInput>) => {
        await tx.mutate.page.update({
          id: input.id,
          clubId: input.clubId,
          timeUpdated: input.timeUpdated,
          body: input.body,
          title: input.title,
        });
      },
    },
  } satisfies CustomMutatorDefs;
}
