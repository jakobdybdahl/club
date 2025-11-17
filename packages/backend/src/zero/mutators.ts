import { Event } from "@club/core/event/index";
import { User } from "@club/core/user/index";

import { Transaction } from "@club/core/util/transaction";
import { CustomMutatorDefs } from "@rocicorp/zero/pg";
import { z } from "zod";

const wrapped = <Schema extends z.ZodSchema<any, any, any>, Return extends any>(
  fn: ((input: z.input<Schema>) => Return) & {
    schema: Schema;
  }
) => {
  return async (tx: Transaction, input: z.input<Schema>) => {
    await fn(input);
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
