import {
  AccountActor,
  PublicActor,
  useActor,
  UserActor,
} from "@club/core/actor";
import { db } from "@club/core/drizzle/index";
import { Permission } from "@club/core/permission/index";
import { user } from "@club/core/user/user.sql";
import { assert } from "@club/core/util/asserts";
import { clubSchema, queries } from "@club/zero/queries";
import { schema } from "@club/zero/schema";
import {
  mustGetMutator,
  mustGetQuery,
  ReadonlyJSONValue,
} from "@rocicorp/zero";
import { handleMutateRequest, handleQueryRequest } from "@rocicorp/zero/server";
import { Hono } from "hono";
import z from "zod";
import { dbProvider, mutators } from "../zero";

const idOrSlugSchema = z.union([
  clubSchema,
  z.object({ slug: z.string().trim().nonempty() }),
]);

const prepareActor = async () => {
  const actor = useActor();
  if (actor.type !== "public" && actor.type !== "account") {
    throw new Error(`Did not expected actor of type ${actor.type}`);
  }

  const userClubs = await (async () => {
    if (actor.type === "public") return null;

    const clubsResult = await db.query.club.findMany({
      where: (_, { exists, eq }) =>
        exists(
          db.select().from(user).where(eq(user.email, actor.properties.email)),
        ),
      with: {
        users: {
          limit: 1,
          where: (table, { eq }) => eq(table.email, actor.properties.email),
          columns: {
            id: true,
            email: true,
          },
          with: {
            permissionGroupMemberships: {
              columns: {},
              with: {
                group: {
                  columns: { permissions: true },
                },
              },
            },
          },
        },
      },
    });

    return new Map(
      clubsResult.map((club) => {
        const { users, ...rest } = club;
        const user = users.at(0);
        assert(user, "Expected user to be defiend");
        const permissions = Array.from(
          user.permissionGroupMemberships
            .flatMap(({ group }) => group.permissions)
            .reduce((set, p) => set.add(p), new Set<Permission>()),
        );
        return [
          club.id,
          { ...rest, user: { id: user.id, email: user.email }, permissions },
        ];
      }),
    );
  })();

  const fromId = (id: string): PublicActor | AccountActor | UserActor => {
    const club = userClubs?.get(id);
    if (!club) return actor;
    return {
      type: "user",
      properties: {
        clubId: club.id,
        userId: club.user.id,
        permissions: club.permissions,
      },
    };
  };

  const fromSlug = (slug: string): PublicActor | AccountActor | UserActor => {
    const allClubs = Array.from(userClubs?.values() ?? []);
    const club = allClubs.find((c) => c.slug === slug);
    if (!club) return actor;
    return {
      type: "user",
      properties: {
        clubId: club.id,
        userId: club.user.id,
        permissions: club.permissions,
      },
    };
  };

  const byArgs = (
    args: ReadonlyJSONValue | undefined,
  ): PublicActor | AccountActor | UserActor => {
    if (!args) return actor;
    if (actor.type === "public") return actor;
    const parseResult = idOrSlugSchema.safeParse(args);
    if (!parseResult.success) return actor;
    if ("clubId" in parseResult.data) {
      return fromId(parseResult.data.clubId);
    } else {
      return fromSlug(parseResult.data.slug);
    }
  };

  return {
    fromId,
    fromSlug,
    byArgs,
  };
};

export const ZeroRoute = new Hono()
  .post("/mutate", async (c) => {
    const actor = await prepareActor();
    const response = await handleMutateRequest(
      dbProvider,
      (transact) =>
        transact((_, name, args) => {
          const mutator = mustGetMutator(mutators, name);
          return mutator.fn({
            args,
            ctx: actor.byArgs(args),
            tx: {} as any,
          });
        }),
      c.req.raw,
      "info",
    );
    return c.json(response);
  })
  .post("/query", async (c) => {
    const actor = await prepareActor();
    const res = await handleQueryRequest(
      (name, args) => {
        const query = mustGetQuery(queries, name);
        const ctx = actor.byArgs(args);
        console.log(
          JSON.stringify({
            query: name,
            args,
            ctx,
          }),
        );
        return query.fn({ args, ctx });
      },
      schema,
      c.req.raw,
      "info",
    );
    return c.json(res);
  });
