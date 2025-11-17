import type { Event } from "@club/core/event/index";
import type { User } from "@club/core/user/index";
import type { WithId, WithRequired } from "@club/core/util/types";
import type { schema } from "@club/zero/schema";
import type { CustomMutatorDefs, Transaction } from "@rocicorp/zero";

export type MutatorTx = Transaction<typeof schema>;

type Populated<T extends { timeCreated?: number; timeUpdated?: number }> =
  WithRequired<T, "timeCreated" | "timeUpdated"> & {
    clubId: string;
    userId: string;
  };

type Create<T extends { timeCreated?: number; timeUpdated?: number }> =
  Populated<T extends { id?: string | undefined | null } ? WithId<T> : T>;

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
          creatorId: input.userId,
          creatorType: "user",
        });
      },
    },
    event: {
      create: async (tx: MutatorTx, input: Create<Event.CreateInput>) => {
        await tx.mutate.event.insert({
          id: input.id,
          clubId: input.clubId,
          creatorId: input.userId,
          creatorType: "user",
          name: input.name,
          visibility: input.visibility ?? "private",
          timeCreated: input.timeCreated,
          timeUpdated: input.timeUpdated,
        });
      },
    },
  } satisfies CustomMutatorDefs;
}
