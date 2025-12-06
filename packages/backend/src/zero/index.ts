import { withActor } from "@club/core/actor";
import { Page } from "@club/core/cms/index";
import { Event } from "@club/core/event/index";
import { User } from "@club/core/user/index";
import { defineMutator, defineMutators } from "@rocicorp/zero";
import z from "zod";
import { DrizzleDatabaseProvider } from "./database-provider";

export const dbProvider = new DrizzleDatabaseProvider();

const mutator = <Schema extends z.ZodSchema<any, any, any>, Return extends any>(
  fn: ((input: z.input<Schema>) => Return) & {
    schema: Schema;
  }
) => {
  return defineMutator(async ({ args, ctx }) => {
    return withActor(ctx, async () => {
      await fn(args as z.input<Schema>);
    });
  });
};

export const mutators = defineMutators({
  user: {
    create: mutator(User.create),
  },
  event: {
    create: mutator(Event.create),
  },
  page: {
    create: mutator(Page.create),
    update: mutator(Page.update),
  },
});

export type ZeroServer = typeof mutators;
