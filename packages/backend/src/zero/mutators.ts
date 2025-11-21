import { Actor, UserActor, withActor } from "@club/core/actor";
import { Club } from "@club/core/club/index";
import { createContext } from "@club/core/context";
import { Event } from "@club/core/event/index";
import { User } from "@club/core/user/index";
import { assert } from "@club/core/util/asserts";

import { Transaction } from "@club/core/util/transaction";
import { clubSchema } from "@club/zero/queries";
import { CustomMutatorDefs } from "@rocicorp/zero/pg";
import { z } from "zod";

type MutatorAuth = {
  actor: Actor;
  requests: Map<string, Promise<Actor>>;
};

const MutatorAuthContext = createContext<MutatorAuth>("mutator-auth");

const IdOrSlugSchema = z.union([
  clubSchema,
  z.object({ slug: z.string().trim().nonempty() }),
]);

export const withAuthContext = MutatorAuthContext.with;
const useCtx = MutatorAuthContext.use;

const wrapped = <Schema extends z.ZodSchema<any, any, any>, Return extends any>(
  fn: ((input: z.input<Schema>) => Return) & {
    schema: Schema;
  }
) => {
  return async (tx: Transaction, input: z.input<Schema>) => {
    const ctx = useCtx();
    const actor = await (async (): Promise<Actor> => {
      if (ctx.actor.type !== "account") {
        return ctx.actor;
      }
      const parseResult = IdOrSlugSchema.safeParse(input);
      console.log({ parseResult: parseResult.data, actor: ctx.actor });
      if (!parseResult.success) return ctx.actor;

      const key =
        "clubId" in parseResult.data
          ? parseResult.data.clubId
          : parseResult.data.slug;

      const existingRequest = ctx.requests.get(key);
      if (existingRequest) {
        return existingRequest;
      }

      const request = (async () => {
        assert(
          ctx.actor.type === "account",
          "Did not expect actor type other than account"
        );

        const account = ctx.actor;

        const clubId = await (async () => {
          if ("clubId" in parseResult.data) return parseResult.data.clubId;
          const bySlug = await Club.fromSlug(parseResult.data.slug);
          return bySlug?.id;
        })();

        if (!clubId) return account;

        return withActor(
          { type: "system", properties: { clubId } },
          async () => {
            const user = await User.fromEmail(account.properties.email);
            console.log({ clubId, user });
            if (!user || user.timeDeleted) {
              return account;
            }
            return {
              type: "user",
              properties: {
                clubId,
                userId: user.id,
                permissions: user.permissions,
              },
            } satisfies UserActor;
          }
        );
      })();

      ctx.requests.set(key, request);
      return request;
    })();

    console.log("executing mutation with actor", actor);

    return withActor(actor, async () => {
      await fn(input);
    });
  };
};

export const mutators = {
  user: {
    create: wrapped(User.create),
    remove: wrapped(User.remove),
  },
  event: {
    create: wrapped(Event.create),
  },
} satisfies CustomMutatorDefs<Transaction>;

export type ZeroServer = typeof mutators;
