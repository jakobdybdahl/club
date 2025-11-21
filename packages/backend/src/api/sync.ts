import { Actor, useActor, UserActor, withActor } from "@club/core/actor";
import { Club } from "@club/core/club/index";
import { User } from "@club/core/user/index";
import { assert } from "@club/core/util/asserts";
import { clubSchema, queries } from "@club/zero/queries";
import { schema } from "@club/zero/schema";
import { ReadonlyJSONValue, withValidation } from "@rocicorp/zero";
import { handleGetQueriesRequest } from "@rocicorp/zero/server";
import { Hono } from "hono";
import z from "zod";
import { mutators, processor } from "../zero";
import { withAuthContext } from "../zero/mutators";

export const ZeroRoute = new Hono()
  .post("/mutate", async (c) => {
    const body = await c.req.json();
    console.log(JSON.stringify(body, null, 2));
    return withAuthContext(
      { actor: useActor(), requests: new Map() },
      async () => {
        const response = await processor.process(mutators, c.req.query(), body);
        console.log(JSON.stringify(response, null, 2));
        return c.json(response);
      }
    );
  })
  .post("/get-queries", async (c) => {
    const actor = useActor();
    if (actor.type !== "public" && actor.type !== "account") {
      throw new Error(`Did not expected actor of type ${actor.type}`);
    }

    const actorRequests = new Map<string, Promise<Actor>>();

    const IdOrSlugSchema = z.union([
      clubSchema,
      z.object({ slug: z.string().trim().nonempty() }),
    ]);

    async function getAuthContext(args: readonly ReadonlyJSONValue[]) {
      if (actor.type === "public") return actor;

      const parseResult = IdOrSlugSchema.safeParse(args[0]);
      if (!parseResult.success) return actor;

      const key =
        "clubId" in parseResult.data
          ? parseResult.data.clubId
          : parseResult.data.slug;

      const existingRequest = actorRequests.get(key);
      if (existingRequest) {
        return existingRequest;
      }

      const request = (async () => {
        assert(
          actor.type === "account",
          "Did not expect actor type other than account"
        );

        const clubId = await (async () => {
          if ("clubId" in parseResult.data) return parseResult.data.clubId;
          const bySlug = await Club.fromSlug(parseResult.data.slug);
          return bySlug?.id;
        })();

        if (!clubId) return actor;

        return withActor(
          { type: "system", properties: { clubId } },
          async () => {
            const user = await User.fromEmail(actor.properties.email);
            if (!user || user.timeDeleted) {
              return actor;
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

      actorRequests.set(key, request);

      return request;
    }

    function getQuery(
      actor: Actor,
      name: string,
      args: readonly ReadonlyJSONValue[]
    ) {
      const q = validated[name];
      if (!q) {
        throw new Error(`No such query: ${name}`);
      }
      return {
        query: q(actor, ...args),
      };
    }

    const res = await handleGetQueriesRequest(
      async (name, args) => {
        const authContext = await getAuthContext(args);
        console.log({ name, authContext, args });
        return getQuery(authContext, name, args);
      },
      schema,
      c.req.raw
    );

    // console.log(JSON.stringify(res, null, 2));

    return c.json<any>(res);
  });

const validated = Object.fromEntries(
  Object.values(queries).map((q) => [q.queryName, withValidation(q)])
);
