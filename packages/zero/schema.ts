import {
  boolean,
  createBuilder,
  createSchema,
  enumeration,
  json,
  number,
  relationships,
  string,
  table,
} from "@rocicorp/zero";

import type {
  AccountActor,
  Actor,
  PublicActor,
  UserActor,
} from "@club/core/actor";
import type { Permission } from "@club/core/permission/index";

// COMMON
export const timestamps = {
  timeCreated: number().from("time_created"),
  timeUpdated: number().from("time_updated"),
  timeDeleted: number().from("time_deleted").optional(),
};

export const clubIds = {
  id: string(),
  clubId: string().from("club_id"),
};

export const creator = {
  creatorId: string().from("creator_id"),
  creatorType: enumeration<Actor["type"]>().from("creator_type"),
};

export const club = table("club")
  .columns({
    ...timestamps,
    id: string(),
    slug: string(),
    oldSlug: string().from("old_slug").optional(),
    name: string(),
    shortCode: string().from("short_code"),
  })
  .primaryKey("id");

export const user = table("user")
  .columns({
    ...clubIds,
    ...timestamps,
    ...creator,
    username: string().optional(),
    fullName: string().from("full_name").optional(),
    email: string(),
    initials: string(),
    color: string(),
    timeSeen: number().from("time_seen").optional(),
  })
  .primaryKey("id", "clubId");

// PERMISSION GROUP
export const permissionGroup = table("permissionGroup")
  .from("permission_group")
  .columns({
    ...clubIds,
    ...timestamps,
    ...creator,
    name: string(),
    permissions: json<Permission[]>(),
    immutable: boolean().optional(),
  })
  .primaryKey("id", "clubId");

export const permissionGroupMember = table("permissionGroupMember")
  .from("permission_group_member")
  .columns({
    clubId: string().from("club_id"),
    ...timestamps,
    ...creator,
    userId: string().from("user_id"),
    groupId: string().from("group_id"),
  })
  .primaryKey("clubId", "groupId", "userId");

// EVENT
export const event = table("event")
  .columns({
    ...clubIds,
    ...timestamps,
    ...creator,
    name: string(),
    visibility: enumeration<"public" | "private">(),
  })
  .primaryKey("clubId", "id");

// CMS
export const page = table("page")
  .from("cms_page")
  .columns({
    ...clubIds,
    ...timestamps,
    ...creator,
    title: string(),
    visibility: enumeration<"public" | "private">(),
    slug: string(),
    body: json(),
    parentId: string().from("parent_id").optional(),
  })
  .primaryKey("clubId", "id");

export const menu = table("menu")
  .from("cms_menu")
  .columns({
    clubId: clubIds.clubId,
    config: json(),
    timeUpdated: timestamps.timeUpdated,
  })
  .primaryKey("clubId");

export const customDomain = table("customDomain")
  .from("cms_custom_domain")
  .columns({
    ...creator,
    clubId: clubIds.clubId,
    timeCreated: timestamps.timeCreated,
    timeUpdated: timestamps.timeUpdated,
    domain: string(),
  })
  .primaryKey("clubId");

// RELATIONSHIPS
export const eventRelationships = relationships(event, (r) => ({
  club: r.one({
    sourceField: ["clubId"],
    destSchema: club,
    destField: ["id"],
  }),
  users: r.many({
    sourceField: ["clubId"],
    destSchema: user,
    destField: ["clubId"],
  }),
}));

export const clubRelationships = relationships(club, (r) => ({
  users: r.many({
    sourceField: ["id"],
    destSchema: user,
    destField: ["clubId"],
  }),
  events: r.many({
    sourceField: ["id"],
    destSchema: event,
    destField: ["clubId"],
  }),
  menu: r.one({
    sourceField: ["id"],
    destSchema: menu,
    destField: ["clubId"],
  }),
  pages: r.many({
    sourceField: ["id"],
    destSchema: page,
    destField: ["clubId"],
  }),
  customDomain: r.one({
    sourceField: ["id"],
    destSchema: customDomain,
    destField: ["clubId"],
  }),
}));

export const permissionGroupRelationships = relationships(
  permissionGroup,
  (r) => ({
    members: r.many(
      {
        sourceField: ["clubId", "id"],
        destSchema: permissionGroupMember,
        destField: ["clubId", "groupId"],
      },
      {
        sourceField: ["clubId", "userId"],
        destSchema: user,
        destField: ["clubId", "id"],
      },
    ),
  }),
);

export const schema = createSchema({
  tables: [
    club,
    user,
    permissionGroup,
    permissionGroupMember,
    event,
    page,
    customDomain,
    menu,
  ],
  relationships: [
    clubRelationships,
    permissionGroupRelationships,
    eventRelationships,
  ],
  enableLegacyMutators: false,
  enableLegacyQueries: false,
});

export const zql = createBuilder(schema);

export type Schema = typeof schema;

declare module "@rocicorp/zero" {
  interface DefaultTypes {
    schema: typeof schema;
    context: PublicActor | UserActor | AccountActor;
  }
}
