import type { CustomMutatorDefs, Transaction } from "@rocicorp/zero";
import type { Message } from "@zero-template/core/message/index";
import type { WithId } from "@zero-template/core/util/types";
import type { schema } from "@zero-template/zero/schema";

export type MutatorTx = Transaction<typeof schema>;

export const mutators = {
  message: {
    create: async (tx: MutatorTx, input: WithId<Message.CreateInput>) => {
      await tx.mutate.message.insert({
        id: input.id,
        content: input.content,
        sender: input.sender,
        timeCreated: input.timeCreated,
        timeUpdated: input.timeUpdated,
      });
    },
    remove: async (tx: MutatorTx, input: Message.RemoveInput) => {
      await tx.mutate.message.delete({ id: input.id });
    },
  },
} satisfies CustomMutatorDefs;
