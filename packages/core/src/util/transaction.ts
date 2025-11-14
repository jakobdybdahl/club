import { ExtractTablesWithRelations } from "drizzle-orm";
import { PgTransaction, PgTransactionConfig } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { createContext } from "../context";
import { db, schema } from "../drizzle";

export type Transaction = PgTransaction<
  PostgresJsQueryResultHKT,
  Record<string, unknown>,
  ExtractTablesWithRelations<typeof schema>
>;

export type TxOrDb = Transaction | typeof db;

const TransactionContext = createContext<{
  tx: Transaction;
  effects: (() => void | Promise<void>)[];
}>("TransactionContext");

export async function useTransaction<T>(callback: (trx: TxOrDb) => Promise<T>) {
  try {
    const { tx } = TransactionContext.use();
    return callback(tx);
  } catch {
    return callback(db);
  }
}

export async function createTransactionEffect(
  effect: () => any | Promise<any>
) {
  try {
    const { effects } = TransactionContext.use();
    effects.push(effect);
  } catch {
    await effect();
  }
}

export async function createTransaction<T>(
  callback: (tx: Transaction) => Promise<T>,
  config?: PgTransactionConfig
) {
  try {
    const { tx } = TransactionContext.use();
    return callback(tx);
  } catch {
    const effects: (() => void | Promise<void>)[] = [];
    const result = await db.transaction(
      async (tx) => {
        const result = await TransactionContext.with(
          { tx, effects },
          async () => {
            return callback(tx);
          }
        );
        return result;
      },
      {
        isolationLevel: "repeatable read",
        ...config,
      }
    );
    await Promise.all(effects.map((x) => x()));
    return result;
  }
}
