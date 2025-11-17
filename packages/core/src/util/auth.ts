import { z } from "zod";
import { useActor } from "../actor";
import { Permission } from "../permission";
import { ForbiddenError } from "./error";
import { zod } from "./zod";

type PolicyFn = (permissions: Permission[]) => boolean;

export type Policy = Permission | PolicyFn;

export const and =
  (...policies: Policy[]) =>
  (permissions: Permission[]) => {
    for (const policy of policies) {
      const fulfilled =
        typeof policy === "function"
          ? policy(permissions)
          : permissions.includes(policy);
      if (!fulfilled) {
        return false;
      }
    }
    return true;
  };

export const or =
  (...policies: Policy[]) =>
  (permissions: Permission[]) => {
    for (const policy of policies) {
      const fulfilled =
        typeof policy === "function"
          ? policy(permissions)
          : permissions.includes(policy);
      if (fulfilled) {
        return true;
      }
    }
    return false;
  };

export const withPermission = <
  Schema extends z.ZodSchema<any, any, any>,
  Return
>(
  policy: Policy | Policy[],
  fn: ReturnType<typeof zod<Schema, Return>>
) => {
  const result = (input: z.input<Schema>) => {
    const hasAccess = hasPermission(policy);

    if (!hasAccess) {
      throw new ForbiddenError();
    }

    return fn(input);
  };
  result.schema = fn.schema;
  return result;
};

export const hasPermission = (policy: Policy | Policy[]): boolean => {
  const actor = useActor();

  // allow system to do everyting
  if (actor.type === "system") return true;

  if (actor.type !== "user") {
    throw new Error(`Did not expect actor type of '${actor.type}'`);
  }

  const policies = Array.isArray(policy) ? policy : [policy];
  return or("admin", ...policies)(actor.properties.permissions);
};
