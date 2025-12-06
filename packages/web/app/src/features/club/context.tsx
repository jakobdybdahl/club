/* eslint-disable react-refresh/only-export-components */
import { useAccount } from "@/providers/account";
import type { Club } from "@club/core/club/index";
import type { User } from "@club/core/user/index";
import React from "react";

type ClubContextType = Club.Info & { users: readonly User.Info[] };

export const ClubContext = React.createContext<ClubContextType | null>(null);

type UseClubReturn = ClubContextType & { user?: User.Info };

export function useClub(): UseClubReturn;
export function useClub(opts: { safe: true }): UseClubReturn;
export function useClub(opts?: { safe?: false }): UseClubReturn | undefined;
export function useClub(
  opts: {
    safe?: boolean;
  } = { safe: true }
): UseClubReturn | undefined {
  const { current: account } = useAccount();
  const context = React.useContext(ClubContext);
  if (!context && opts.safe) throw new Error("No club context");
  if (!context) return;
  const user = account
    ? context?.users.find((u) => u.email === account.email)
    : undefined;
  return { ...context, user };
}

export const useUser = () => {
  const { user } = useClub();
  return user;
};
