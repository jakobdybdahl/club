/* eslint-disable react-refresh/only-export-components */
import { useClub } from "@/features/club/context";
import { NotAllowed } from "@/features/error-pages";
import type { Permission } from "@club/core/permission/index";
import { queries } from "@club/zero/queries";
import { useQuery } from "@rocicorp/zero/react";
import React, { useContext, useEffect, useMemo } from "react";

type PermissionContextType = {
  permissions: Permission[];
};

const PermissionContext = React.createContext<PermissionContextType>({
  permissions: [],
});

const PermissionProvider = ({ children }: { children: React.ReactNode }) => {
  const { id: clubId, user } = useClub();

  const [groups] = useQuery(
    queries.permissionGroups(
      user
        ? {
            type: "user",
            properties: {
              clubId: clubId,
              userId: user.id,
              permissions: [],
            },
          }
        : { type: "public" },
      { clubId }
    ),
    { enabled: !!user }
  );

  const permissions = useMemo(() => {
    const all = groups.flatMap((group) => group.permissions);
    return Array.from(
      all.reduce((set, p) => set.add(p), new Set<Permission>())
    );
  }, [groups]);

  useEffect(() => console.log({ permissions }), [permissions]);

  return (
    <PermissionContext.Provider value={{ permissions }}>
      {children}
    </PermissionContext.Provider>
  );
};

type PolicyFn = (permissions: Permission[]) => boolean;

export type Policy = Permission | PolicyFn;

const and =
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

const or =
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

const usePermissions = () => {
  const ctx = useContext(PermissionContext);
  if (!ctx) {
    throw new Error("usePermissions must be used within an PermissionProvider");
  }
  return ctx.permissions;
};

const useHasPermission = (policy: Policy | Policy[]): boolean => {
  const ctx = useContext(PermissionContext);
  if (!ctx) {
    throw new Error(
      "useHasPermission must be used within an PermissionProvider"
    );
  }

  return useMemo(() => {
    const policies = Array.isArray(policy) ? policy : [policy];
    if (policies.length === 0) return true;
    return or("admin", ...policies)(ctx.permissions);
  }, [policy, ctx.permissions]);
};

function WithPermission({
  policy,
  children,
}: {
  policy: Policy | Policy[];
  children: React.ReactNode;
}) {
  const hasPermission = useHasPermission(policy);
  return hasPermission ? children : <NotAllowed />;
}

export {
  and,
  or,
  PermissionProvider,
  useHasPermission,
  usePermissions,
  WithPermission,
};
