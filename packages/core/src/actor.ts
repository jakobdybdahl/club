import { z } from "zod";
import { createContext } from "./context";
import { PermissionSchema } from "./permission";
import { KebabCase } from "./util/types";

export const ACTOR_TYPES = [
  "public",
  "account",
  "user",
  "system",
  "sysadmin",
] as const;

const ActorType: {
  [Type in (typeof ACTOR_TYPES)[number] as KebabCase<Type>]: Type;
} = {
  Account: "account",
  Public: "public",
  Sysadmin: "sysadmin",
  System: "system",
  User: "user",
} as const;

export const PublicActor = z.object({
  type: z.literal(ActorType.Public),
  properties: z.object({}),
});
export type PublicActor = z.infer<typeof PublicActor>;

export const AccountActor = z.object({
  type: z.literal(ActorType.Account),
  properties: z.object({
    accountId: z.string().nanoid(),
    email: z.string().nonempty(),
  }),
});
export type AccountActor = z.infer<typeof AccountActor>;

export const UserActor = z.object({
  type: z.literal(ActorType.User),
  properties: z.object({
    userId: z.string().nanoid(),
    workspaceId: z.string().nanoid(),
    permissions: z.array(PermissionSchema),
  }),
});
export type UserActor = z.infer<typeof UserActor>;

export const SystemActor = z.object({
  type: z.literal(ActorType.System),
  properties: z.object({
    workspaceId: z.string().nanoid(),
  }),
});
export type SystemActor = z.infer<typeof SystemActor>;

export const SysadminActor = z.object({
  type: z.literal(ActorType.Sysadmin),
  properties: z.object({
    accountId: z.string().nanoid(),
    workspaceId: z.string().nanoid(),
  }),
});
export type SysadminActor = z.infer<typeof SysadminActor>;

export const Actor = z.discriminatedUnion("type", [
  PublicActor,
  AccountActor,
  UserActor,
  SystemActor,
  SysadminActor,
]);
export type Actor = z.infer<typeof Actor>;

const ActorContext = createContext<Actor>("actor");

export const useActor = ActorContext.use;
export const withActor = ActorContext.with;

export function assertActor<T extends Actor["type"]>(type: T) {
  const actor = useActor();
  if (actor.type !== type) {
    throw new Error(`Expected actor type ${type}, got ${actor.type}`);
  }

  return actor as Extract<Actor, { type: T }>;
}

export function useWorkspace() {
  const actor = useActor();
  if ("workspaceId" in actor.properties) return actor.properties.workspaceId;
  throw new Error(`Expected actor to have workspace ID`);
}

export const useActorId = () => {
  const actor = useActor();
  switch (actor.type) {
    case "account":
    case "sysadmin":
      return actor.properties.accountId;
    case "public":
    case "system":
      return actor.type;
    case "user":
      return actor.properties.userId;
  }
};

export const useUserId = () => {
  const user = assertActor("user");
  return user.properties.userId;
};
