import { defineQueries, defineQuery, escapeLike } from "@rocicorp/zero";
import z from "zod";
import { zql } from "./schema";

const clubQueryParams = z.object({
  member: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(["timeCreated", "timeUpdated", "name"]),
  sortDirection: z.enum(["asc", "desc"]),
});

export type ClubQueryParams = z.infer<typeof clubQueryParams>;

const clubRowSort = z.object({
  id: z.string(),
  timeCreated: z.number(),
  timeUpdated: z.number(),
});

type ClubRowSort = z.infer<typeof clubRowSort>;

export const clubSchema = z.object({
  clubId: z.nanoid(),
});

export const clubSlugSchema = z.object({
  slug: z.string().trim().nonempty(),
});

export const queries = defineQueries({
  permissionGroups: defineQuery(clubSchema, ({ args, ctx }) => {
    if (ctx.type === "public") {
      return zql.permissionGroup.where(({ or }) => or());
    }
    return zql.permissionGroup
      .where("clubId", args.clubId)
      .whereExists("members", (q) =>
        ctx.type === "account"
          ? q.where("email", ctx.properties.email)
          : q.where("id", ctx.properties.userId),
      );
  }),
  cms: defineQuery(
    z.object({
      type: z.enum(["slug", "custom-domain"]),
      value: z.string().trim().nonempty(),
    }),
    ({ args }) => {
      let q = zql.club.related("menu").related("pages");
      if (args.type === "custom-domain") {
        q = q.whereExists("customDomain", (q) => q.where("domain", args.value));
      } else {
        q = q.where("slug", args.value);
      }
      return q.one();
    },
  ),
  pages: defineQuery(clubSchema, ({ args, ctx }) => {
    let q = zql.page.where("clubId", args.clubId);
    if (ctx.type !== "user") {
      q = q.where("visibility", "=", "public");
    }
    return q;
  }),
  page: defineQuery(
    clubSchema.extend({ pageSlug: z.string().trim() }),
    ({ args, ctx }) => {
      let q = zql.page
        .where("clubId", args.clubId)
        .where("slug", args.pageSlug);
      if (ctx.type !== "user") {
        q = q.where("visibility", "=", "public");
      }
      return q.one();
    },
  ),
  clubs: defineQuery(
    z.object({
      query: clubQueryParams,
      limit: z.number().default(100),
      start: clubRowSort.nullable(),
      dir: z.enum(["forward", "backward"]),
    }),
    ({ args: { dir, limit, query, start } }) => {
      // let q = zql.club
      //   .limit(100)
      //   .where("timeDeleted", "IS", null)
      //   .related("users", (q) => q.orderBy("timeCreated", "desc").limit(100))
      //   .related("events", (q) => q.orderBy("timeCreated", "desc").limit(10));

      // return q;

      let q = zql.club
        .related("users", (q) => q.orderBy("timeCreated", "desc").limit(100))
        .related("events", (q) => q.orderBy("timeCreated", "desc").limit(10));

      // order by
      const { sort: sortField, sortDirection } = query;
      const orderByDir =
        dir === "forward"
          ? sortDirection
          : sortDirection === "asc"
            ? "desc"
            : "asc";
      q = q.orderBy(sortField, orderByDir).orderBy("id", orderByDir);

      // pagination
      if (start) {
        q = q.start(start);
      }
      if (limit) {
        q = q.limit(limit);
      }

      // query
      const { member, search } = query;
      q = q.where(({ and, cmp, exists, or }) =>
        and(
          member ? exists("users", (q) => q.where("email", member)) : undefined,
          search
            ? or(cmp("name", "ILIKE", `%${escapeLike(search)}%`))
            : undefined,
        ),
      );

      q = q.where("timeDeleted", "IS", null);

      return q;
    },
  ),
  club: defineQuery(clubSchema, ({ args }) => {
    return zql.club
      .where("id", args.clubId)
      .where("timeDeleted", "IS", null)
      .related("users")
      .related("events", (q) => q.where("timeDeleted", "IS", null))
      .one();
  }),
  clubBySlug: defineQuery(clubSlugSchema, ({ args }) => {
    return zql.club
      .where("slug", args.slug)
      .where("timeDeleted", "IS", null)
      .related("users")
      .related("events", (q) => q.where("timeDeleted", "IS", null))
      .one();
  }),
  events: defineQuery(clubSchema, ({ args, ctx }) => {
    let q = zql.event.where("clubId", args.clubId);
    if (ctx.type === "public" || ctx.type === "account") {
      q = q.where("visibility", "=", "public");
    }
    return q.related("club").limit(20);
  }),
  event: defineQuery(z.object({ id: z.string() }), ({ args, ctx }) => {
    let q = zql.event
      .where("id", args.id)
      .where(({ or, cmp, exists }) =>
        or(
          cmp("visibility", "=", "public"),
          ctx.type === "account"
            ? exists("users", (q) => q.where("email", ctx.properties.email))
            : undefined,
          ctx.type === "user"
            ? exists("users", (q) => q.where("id", ctx.properties.userId))
            : undefined,
        ),
      );
    return q.related("club").one();
  }),
});
