import { sql } from "@club/core/drizzle/index";
import { createTransaction, Transaction } from "@club/core/util/transaction";
import {
  Database,
  TransactionProviderHooks,
  TransactionProviderInput,
} from "@rocicorp/zero/pg";

export class DrizzleDatabaseProvider implements Database<Transaction> {
  transaction<R>(
    callback: (
      tx: Transaction,
      transactionHooks: TransactionProviderHooks
    ) => Promise<R>,
    transactionInput?: TransactionProviderInput
  ): Promise<R> {
    const {
      upstreamSchema = "",
      clientGroupID = "",
      clientID = "",
      mutationID = 0,
    } = transactionInput ?? {};

    return createTransaction((tx) =>
      callback(tx, {
        async updateClientMutationID() {
          const query = sql.raw(`INSERT INTO ${upstreamSchema}.clients 
                  as current ("clientGroupID", "clientID", "lastMutationID")
                      VALUES ('${clientGroupID}', '${clientID}', ${1})
                  ON CONFLICT ("clientGroupID", "clientID")
                  DO UPDATE SET "lastMutationID" = current."lastMutationID" + 1
                  RETURNING "lastMutationID"`);

          const [{ lastMutationID }] = (await tx.execute(query)) as any;

          return { lastMutationID };
        },
        async writeMutationResult(result) {
          const query = sql`INSERT INTO ${sql.raw(upstreamSchema)}.mutations
                            ("clientGroupID", "clientID", "mutationID", "result")
                            VALUES (
                              '${sql.raw(clientGroupID)}',
                              '${sql.raw(result.id.clientID)}',
                              '${sql.raw(result.id.id.toString())}',
                              ${JSON.stringify(result.result)}
                            )`;
          await tx.execute(query);
        },
      })
    );
  }
}
