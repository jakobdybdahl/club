import { z } from "zod";
import { createContext } from "./context";
import { PermissionSchema } from "./permission";
import { KebabCase } from "./util/types";

export const ACTOR_TYPES = ["public", "account", "user", "system"] as const;

const ActorType: {
  [Type in (typeof ACTOR_TYPES)[number] as KebabCase<Type>]: Type;
} = {
  Account: "account",
  Public: "public",
  System: "system",
  User: "user",
} as const;

export const PublicActor = z.object({
  type: z.literal(ActorType.Public),
  // properties: z.object({}),
});
export type PublicActor = z.infer<typeof PublicActor>;

export const AccountActor = z.object({
  type: z.literal(ActorType.Account),
  properties: z.object({
    accountId: z.nanoid(),
    email: z.string().nonempty(),
  }),
});
export type AccountActor = z.infer<typeof AccountActor>;

export const UserActor = z.object({
  type: z.literal(ActorType.User),
  properties: z.object({
    userId: z.nanoid(),
    clubId: z.nanoid(),
    permissions: z.array(PermissionSchema),
  }),
});
export type UserActor = z.infer<typeof UserActor>;

export const SystemActor = z.object({
  type: z.literal(ActorType.System),
  properties: z.object({
    clubId: z.nanoid(),
  }),
});
export type SystemActor = z.infer<typeof SystemActor>;

export const Actor = z.discriminatedUnion("type", [
  PublicActor,
  AccountActor,
  UserActor,
  SystemActor,
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
  if (actor.type !== "public" && "clubId" in actor.properties) {
    return actor.properties.clubId;
  }
  throw new Error(`Expected actor to have workspace ID`);
}

export const useActorId = () => {
  const actor = useActor();
  switch (actor.type) {
    case "account":
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
