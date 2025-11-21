import { Actor } from "@club/core/actor";
import { syncedQueryWithContext } from "@rocicorp/zero";
import z from "zod";
import { builder } from "./schema";

type AuthContext = Actor;

export const clubSchema = z.object({
  clubId: z.nanoid(),
});

export const queries = {
  permissionGroups: syncedQueryWithContext(
    "permissionGroups",
    z.tuple([clubSchema]),
    (actor: AuthContext, _args) => {
      if (actor.type !== "user") {
        return builder.permissionGroup.where(({ or }) => or());
      }

      return builder.permissionGroup
        .where("clubId", actor.properties.clubId)
        .whereExists("members", (q) => q.where("id", actor.properties.userId));
    }
  ),
  events: syncedQueryWithContext(
    "events",
    z.tuple([clubSchema]),
    (actor: AuthContext, args) => {
      let q = builder.event.where("clubId", args.clubId);
      if (actor.type === "public" || actor.type === "account") {
        q = q.where("visibility", "=", "public");
      }
      return q.related("club").limit(20);
    }
  ),
  event: syncedQueryWithContext(
    "event",
    z.tuple([z.object({ id: z.string() })]),
    (actor: AuthContext, { id }) => {
      let q = builder.event
        .where("id", id)
        .where(({ or, cmp, exists }) =>
          or(
            cmp("visibility", "=", "public"),
            actor.type === "account"
              ? exists("users", (q) => q.where("email", actor.properties.email))
              : undefined
          )
        );
      return q.related("club").one();
    }
  ),
  myClubs: syncedQueryWithContext(
    "myClubs",
    z.tuple([]),
    (actor: AuthContext) => {
      if (actor.type !== "account") {
        return builder.club.where(({ or }) => or());
      }
      return builder.club
        .where("timeDeleted", "IS", null)
        .whereExists("users", (q) => q.where("email", actor.properties.email))
        .related("users");
    }
  ),
  club: syncedQueryWithContext(
    "club",
    z.tuple([z.object({ slug: z.string().trim().nonempty() })]),
    (actor: AuthContext, args) => {
      return builder.club
        .where("slug", args.slug)
        .where("timeDeleted", "IS", null)
        .related("users")
        .related("events", (q) => q.where("timeDeleted", "IS", null))
        .one();
    }
  ),
};
