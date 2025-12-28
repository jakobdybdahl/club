/* eslint-disable */

import { createClient } from "@openauthjs/openauth/client";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Storage = {
  subjects: Record<string, SubjectInfo>;
  current?: string;
};

export type Context = {
  all: Record<string, SubjectInfo>;
  subject?: SubjectInfo;
  switch(id: string): void;
  logout(id?: string): void;
  access(id?: string): Promise<string | undefined>;
  authorize(redirectPath?: string): void;
};

type SubjectInfo = {
  id: string;
  refresh: string;
};

type AuthContextOpts = {
  children: ReactNode;
};

const AuthContext = createContext<Context | undefined>(undefined);

const STORAGE_PREFIX = "app.auth";

function usePersistedState<T>(
  key: string,
  initialState: T
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialState;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialState;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }, [key, state]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setState(JSON.parse(event.newValue));
        } catch (error) {
          console.error("Error parsing storage value:", error);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [state, setState];
}

const issuer = import.meta.env.VITE_AUTH_URL;
const clientId = "webapp";

export function AuthProvider(props: AuthContextOpts) {
  const client = useMemo(() => {
    return createClient({
      issuer,
      clientID: clientId,
    });
  }, []);

  const storageKey = `${issuer}.auth`;
  const [storage, setStorage] = usePersistedState<Storage>(storageKey, {
    subjects: {},
  });

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const handleCode = async () => {
      const hash = new URLSearchParams(window.location.search.substring(1));
      const code = hash.get("code");
      const state = hash.get("state");
      if (code && state) {
        const oldState = sessionStorage.getItem(`${STORAGE_PREFIX}.state`);
        const verifier = sessionStorage.getItem(`${STORAGE_PREFIX}.verifier`);
        const redirect = sessionStorage.getItem(`${STORAGE_PREFIX}.redirect`);
        if (redirect && verifier && oldState === state) {
          const result = await client.exchange(code, redirect, verifier);
          if (!result.err) {
            const id = result.tokens.refresh.split(":").slice(0, -1).join(":");
            setStorage((prevStorage) => ({
              ...prevStorage,
              subjects: {
                ...prevStorage.subjects,
                [id]: {
                  id: id,
                  refresh: result.tokens.refresh,
                },
              },
              current: id,
            }));
          }
        }
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        url.searchParams.delete("state");
        window.history.replaceState({}, "", url);
      }
      setInitialized(true);
    };

    void handleCode();
  }, [client]);

  const authorize = useCallback(
    async (redirectPath?: string) => {
      const redirect = new URL(
        window.location.origin + (redirectPath ?? "/")
      ).toString();
      const authorize = await client.authorize(redirect, "code", {
        pkce: true,
      });
      sessionStorage.setItem(
        `${STORAGE_PREFIX}.state`,
        authorize.challenge.state
      );
      sessionStorage.setItem(`${STORAGE_PREFIX}.redirect`, redirect);
      if (authorize.challenge.verifier)
        sessionStorage.setItem(
          `${STORAGE_PREFIX}.verifier`,
          authorize.challenge.verifier
        );
      window.location.href = authorize.url;
    },
    [client]
  );

  const accessCache = useMemo(() => new Map<string, string>(), []);
  const pendingRequests = useMemo(() => new Map<string, Promise<any>>(), []);
  const getAccess = useCallback(
    async (id: string) => {
      console.log("getting access token for", id);
      const existingRequest = pendingRequests.get(id);
      if (existingRequest) {
        console.log("reusing request", id);
        return existingRequest;
      }
      const request = (async () => {
        try {
          const subject = storage.subjects[id];
          const existing = accessCache.get(id);
          const access = await client.refresh(subject.refresh, {
            access: existing,
          });
          if (access.err) {
            ctx.logout(id);
            console.error("error when refetching tokens", access.err);
            // authorize();
            return;
          }
          if (access.tokens) {
            const tokens = access.tokens;
            setStorage((prev) => ({
              ...prev,
              subjects: {
                ...prev.subjects,
                [id]: {
                  ...prev.subjects[id],
                  refresh: tokens.refresh,
                },
              },
            }));
            accessCache.set(id, tokens.access);
            return tokens.access;
          }
          return existing!;
        } finally {
          pendingRequests.delete(id);
        }
      })();
      pendingRequests.set(id, request);
      return request;
    },
    [client, storage.subjects, accessCache, pendingRequests]
  );

  const ctx: Context = {
    get all() {
      return storage.subjects;
    },
    get subject() {
      if (!storage.current) return undefined;
      return storage.subjects[storage.current];
    },
    switch(id: string) {
      if (!storage.subjects[id]) return;
      setStorage((prev) => ({
        ...prev,
        current: id,
      }));
    },
    authorize,
    logout(id?: string) {
      id = id ?? storage.current;
      if (!id) return;
      if (!storage.subjects[id]) return;
      setStorage((prev) => {
        const newSubjects = { ...prev.subjects };
        delete newSubjects[id];

        return {
          ...prev,
          subjects: newSubjects,
          current:
            prev.current === id ? Object.keys(newSubjects)[0] : prev.current,
        };
      });
    },
    async access(id?: string) {
      const targetId = id || storage.current;
      if (!targetId) return undefined;
      return getAccess(targetId);
    },
  };

  useEffect(() => {
    if (!initialized) return;
    if (storage.current) return;
    const subjects = Object.keys(storage.subjects);
    if (subjects.length > 0) {
      setStorage((prev) => ({
        ...prev,
        current: subjects[0],
      }));
      return;
    }
  }, [initialized, storage.current, storage.subjects]);

  if (!initialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={ctx}>{props.children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
