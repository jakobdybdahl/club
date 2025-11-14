import {
  createBuilder,
  createSchema,
  definePermissions,
  number,
  string,
  table,
} from "@rocicorp/zero";

export const timestamps = {
  timeCreated: number().from("time_created"),
  timeUpdated: number().from("time_updated"),
  timeDeleted: number().from("time_deleted").optional(),
};

export const workspaceIds = {
  id: string(),
  // workspaceId: string().from("workspace_id"),
};

const message = table("message")
  .columns({
    ...workspaceIds,
    ...timestamps,
    sender: string(),
    content: string(),
  })
  .primaryKey("id");

export const schema = createSchema({
  tables: [message],
  enableLegacyMutators: false,
  enableLegacyQueries: false,
});

export const builder = createBuilder(schema);

export const permissions: ReturnType<typeof definePermissions> =
  definePermissions<unknown, Schema>(schema, () => ({}));

export type Schema = typeof schema;
