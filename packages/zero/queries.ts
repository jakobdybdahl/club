import { defineQueries, defineQuery } from "@rocicorp/zero";
import z from "zod";
import { builder } from "./schema";

export const clubSchema = z.object({
  clubId: z.nanoid(),
});

export const clubSlugSchema = z.object({
  slug: z.string().trim().nonempty(),
});

export const queries = defineQueries({
  permissionGroups: defineQuery(clubSchema, ({ args, ctx }) => {
    if (ctx.type === "public") {
      return builder.permissionGroup.where(({ or }) => or());
    }
    return builder.permissionGroup
      .where("clubId", args.clubId)
      .whereExists("members", (q) =>
        ctx.type === "account"
          ? q.where("email", ctx.properties.email)
          : q.where("id", ctx.properties.userId)
      );
  }),
  cms: defineQuery(
    z.object({
      type: z.enum(["slug", "custom-domain"]),
      value: z.string().trim().nonempty(),
    }),
    ({ args }) => {
      let q = builder.club.related("menu").related("pages");
      if (args.type === "custom-domain") {
        q = q.whereExists("customDomain", (q) => q.where("domain", args.value));
      } else {
        q = q.where("slug", args.value);
      }
      return q.one();
    }
  ),
  pages: defineQuery(clubSchema, ({ args, ctx }) => {
    let q = builder.page.where("clubId", args.clubId);
    if (ctx.type !== "user") {
      q = q.where("visibility", "=", "public");
    }
    return q;
  }),
  page: defineQuery(
    clubSchema.extend({ pageSlug: z.string().trim() }),
    ({ args, ctx }) => {
      let q = builder.page
        .where("clubId", args.clubId)
        .where("slug", args.pageSlug);
      if (ctx.type !== "user") {
        q = q.where("visibility", "=", "public");
      }
      return q.one();
    }
  ),
  clubs: defineQuery(() => {
    return builder.club
      .where("timeDeleted", "IS", null)
      .related("users", (q) => q.orderBy("timeCreated", "desc").limit(100))
      .related("events", (q) => q.orderBy("timeCreated", "desc").limit(10))
      .limit(100);
  }),
  club: defineQuery(clubSchema, ({ args }) => {
    return builder.club
      .where("id", args.clubId)
      .where("timeDeleted", "IS", null)
      .related("users")
      .related("events", (q) => q.where("timeDeleted", "IS", null))
      .one();
  }),
  clubBySlug: defineQuery(clubSlugSchema, ({ args }) => {
    return builder.club
      .where("slug", args.slug)
      .where("timeDeleted", "IS", null)
      .related("users")
      .related("events", (q) => q.where("timeDeleted", "IS", null))
      .one();
  }),
  events: defineQuery(clubSchema, ({ args, ctx }) => {
    let q = builder.event.where("clubId", args.clubId);
    if (ctx.type === "public" || ctx.type === "account") {
      q = q.where("visibility", "=", "public");
    }
    return q.related("club").limit(20);
  }),
  event: defineQuery(z.object({ id: z.string() }), ({ args, ctx }) => {
    let q = builder.event
      .where("id", args.id)
      .where(({ or, cmp, exists }) =>
        or(
          cmp("visibility", "=", "public"),
          ctx.type === "account"
            ? exists("users", (q) => q.where("email", ctx.properties.email))
            : undefined,
          ctx.type === "user"
            ? exists("users", (q) => q.where("id", ctx.properties.userId))
            : undefined
        )
      );
    return q.related("club").one();
  }),
});
