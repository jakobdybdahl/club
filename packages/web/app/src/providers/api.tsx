import { useClub } from "@/features/club/context";
import type { ApiType } from "@club/backend/function/api";
import { hc } from "hono/client";
import React, { useContext, useMemo } from "react";
import { useAuth } from "./auth";

export type ApiClient = ReturnType<typeof hc<ApiType>>;

type ApiContextType = {
  client: ApiClient;
};

const ApiContext = React.createContext<ApiContextType>({} as ApiContextType);

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const club = useClub();
  const auth = useAuth();

  const client = useMemo(
    () =>
      hc<ApiType>(import.meta.env.VITE_API_URL, {
        async fetch(...args: Parameters<typeof fetch>): Promise<Response> {
          const [input, init] = args;
          const request =
            input instanceof Request ? input : new Request(input, init);
          const headers = new Headers(request.headers);
          if (auth.subject) {
            headers.set("authorization", `Bearer ${await auth.access()}`);
          }
          headers.set("x-club", club.id);

          return fetch(
            new Request(request, {
              ...init,
              headers,
            }),
          );
        },
      }),
    [club, auth],
  );

  return (
    <ApiContext.Provider value={{ client }}>{children}</ApiContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) throw new Error("No API context");
  return context;
};
