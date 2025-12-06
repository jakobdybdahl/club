import type { Club } from "@club/core/club/index";
import type { User } from "@club/core/user/index";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuth } from "./auth";

type ClubWithUser = Club.Info & { user: User.Info };

type Account = {
  id: string;
  email: string;
  clubs: ClubWithUser[];
};

type AccountState = {
  accounts: Record<string, Account | undefined>;
  setAccount: (
    id: string,
    val: { id: string; email: string; clubs: ClubWithUser[] }
  ) => void;
};

const useStore = create<AccountState>()(
  persist(
    (set) => ({
      accounts: {},
      setAccount: (id, account) =>
        set((state) => ({
          ...state,
          accounts: {
            ...state.accounts,
            [id]: {
              id: account.id,
              email: account.email,
              clubs: account.clubs,
            },
          },
        })),
    }),
    { name: "app.account" }
  )
);

type AccountContextType = {
  all: Account[];
  current: Account | undefined;
  refresh: (id: string) => Promise<void>;
};

const AccountContext = React.createContext({} as AccountContextType);

export const AccountProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const auth = useAuth();
  const store = useStore();

  const [prev, setPrev] = useState<string[]>([]);

  const pendingRequests = useMemo(() => new Map<string, Promise<void>>(), []);
  const refresh = useCallback(
    async (id: string) => {
      const existingRequest = pendingRequests.get(id);
      if (existingRequest) {
        return existingRequest;
      }
      const request = (async () => {
        try {
          const access = await auth.access(id).catch((e) => {
            console.log(e);
            return undefined;
          });
          if (!access) {
            // auth.authorize();
            return;
          }
          return await fetch(import.meta.env.VITE_API_URL + "/account", {
            headers: {
              authorization: `Bearer ${access}`,
            },
          })
            .then((val) => val.json())
            .then((val) => {
              if (val.id) store.setAccount(id, val);
            });
        } finally {
          pendingRequests.delete(id);
        }
      })();
      pendingRequests.set(id, request);
      return request;
    },
    [pendingRequests, auth, store]
  );

  useEffect(() => {
    if (Object.values(auth.all).length === 0) {
      console.log("no auth subjects...");
      // auth.authorize();
      setPrev([]);
      return;
    }

    for (const item of Object.values(auth.all)) {
      if (prev.includes(item.id)) continue;
      void refresh(item.id);
    }

    setPrev(Object.keys(auth.all));
  }, []);

  const ctx = useMemo(() => {
    return {
      get all() {
        return Object.keys(auth.all).map((id) => store.accounts[id]!);
      },
      get current() {
        return auth.subject ? store.accounts[auth.subject.id] : undefined;
      },
      refresh,
    };
  }, [auth.all, store.accounts, refresh]);

  return (
    <AccountContext.Provider value={ctx}>{children}</AccountContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAccount() {
  const context = useContext(AccountContext);
  if (!context)
    throw new Error("useAccount must be added within an AccountProvider");
  return context;
}
