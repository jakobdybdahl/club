/* eslint-disable react-refresh/only-export-components */
import { useAccount } from "@/providers/account";
import type { Club } from "@club/core/club/index";
import type { User } from "@club/core/user/index";
import React from "react";

type ClubContextType = Club.Info & { users: readonly User.Info[] };

export const ClubContext = React.createContext<ClubContextType>(
  {} as ClubContextType
);

export const useClub = (opts: { safe?: boolean } = { safe: true }) => {
  const { current: account } = useAccount();
  const context = React.useContext(ClubContext);
  if (!context && opts.safe) throw new Error("No workspace context");

  const user = account
    ? context?.users.find((u) => u.email === account.email)
    : undefined;

  return { ...context, user };
};

export const useUser = () => {
  const { user } = useClub();
  return user;
};

// export const useUsers = (opts: { withDeleted?: boolean } = {}) => {
//   const club = useClub();
//   return useQuery(
//     queries.users(
//       {
//         clubId: club.id,
//         userId: club.user.id,
//       },
//       { includeDeleted: opts.withDeleted }
//     )
//   );
// };

// export type ApiClient = ReturnType<typeof hc<ApiType>>;

// type ApiContextType = {
//   client: ApiClient;
// };

// const ApiContext = React.createContext<ApiContextType>({} as ApiContextType);

// export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
//   const club = useClub();
//   const auth = useAuth();

//   const client = useMemo(
//     () =>
//       hc<ApiType>(import.meta.env.VITE_API_URL, {
//         async fetch(...args: Parameters<typeof fetch>): Promise<Response> {
//           const [input, init] = args;
//           const request =
//             input instanceof Request ? input : new Request(input, init);
//           const headers = new Headers(request.headers);
//           headers.set("authorization", `Bearer ${await auth.access()}`);
//           headers.set("x-club", club.id);

//           return fetch(
//             new Request(request, {
//               ...init,
//               headers,
//             })
//           );
//         },
//       }),
//     [club, auth]
//   );

//   return (
//     <ApiContext.Provider value={{ client }}>{children}</ApiContext.Provider>
//   );
// };

// export const useApi = () => {
//   const context = useContext(ApiContext);
//   if (!context) throw new Error("No API context");
//   return context;
// };
