import { useActor, withActor } from "@club/core/actor";
import { User } from "@club/core/user/index";
import { or, Policy } from "@club/core/util/auth";
import { VisibleError } from "@club/core/util/error";
import { createClient } from "@openauthjs/openauth/client";
import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { Resource } from "sst";
import { subjects } from "../subjects";

const client = createClient({
  issuer: Resource.Auth.url,
  clientID: "club",
});

export const notPublic: MiddlewareHandler = async (c, next) => {
  const actor = useActor();
  if (actor.type === "public")
    throw new HTTPException(401, { message: "Unauthorized" });
  return next();
};

export const hasPermission: (policy: Policy | Policy) => MiddlewareHandler =
  (policy) => async (_, next) => {
    const actor = useActor();
    if (actor.type === "system") {
      return next();
    }

    if (actor.type !== "user") {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const policies = Array.isArray(policy) ? policy : [policy];
    const allowed = or("admin", ...policies)(actor.properties.permissions);
    if (!allowed) {
      throw new HTTPException(403, { message: "Forbidden" });
    }

    return next();
  };

export const auth: MiddlewareHandler = async (c, next) => {
  const authHeader =
    c.req.query("authorization") ?? c.req.header("authorization");
  if (!authHeader) return withActor({ type: "public" }, next);
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    throw new VisibleError(
      "auth.token",
      "Bearer token not found or improperly formatted"
    );
  }
  const bearerToken = match[1];
  let result = await client.verify(subjects, bearerToken!);
  if (result.err) {
    console.error(result.err);
    throw new HTTPException(401, {
      message: "Unauthorized: " + result.err.message,
    });
  }

  if (result.subject.type === "account") {
    const clubId = c.req.header("x-club") || c.req.query("clubId");

    if (!clubId) return withActor(result.subject as any, next);
    const email = result.subject.properties.email;
    return withActor(
      {
        type: "system",
        properties: {
          clubId,
        },
      },
      async () => {
        const user = await User.fromEmail(email);
        if (!user || user.timeDeleted) {
          c.status(401);
          return c.text("Unauthorized: User not found");
        }
        return withActor(
          {
            type: "user",
            properties: {
              userId: user.id,
              clubId: user.clubId,
              permissions: user.permissions,
            },
          },
          next
        );
      }
    );
  }
};
