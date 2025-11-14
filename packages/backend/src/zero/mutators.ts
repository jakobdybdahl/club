import { CustomMutatorDefs } from "@rocicorp/zero/pg";
import { Message } from "@zero-template/core/message/index";
import { Transaction } from "@zero-template/core/util/transaction";
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
  message: {
    create: wrapped(Message.create),
    remove: wrapped(Message.remove),
  },
} satisfies CustomMutatorDefs<Transaction>;

export type ZeroServer = typeof mutators;
