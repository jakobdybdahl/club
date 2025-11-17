/* eslint-disable react-hooks/rules-of-hooks */
import { useAccount } from "@/providers/account";
import { PermissionProvider } from "@/providers/permissions";
import { queries } from "@club/zero/queries";
import { useQuery } from "@rocicorp/zero/react";
import { useEffect } from "react";
import { Navigate, Route, Routes, useParams } from "react-router";
import { NotFound } from "../error-pages";
import { ClubContext, useClub } from "./context";

const ClubPage = () => {
  const club = useClub();
  return (
    <div className="p-8 m-8 bg-card border rounded-lg">
      Welcome to {club.name}
    </div>
  );
};

export const ClubRoute = () => {
  const { slug } = useParams();
  const account = useAccount();

  if (!slug) return <Navigate to="/" />;

  const [club, { type }] = useQuery(
    queries.club(
      account.current
        ? {
            type: "account",
            properties: {
              accountId: account.current.id,
              email: account.current.email,
            },
          }
        : { type: "public" },
      { slug }
    )
  );

  useEffect(() => console.log(club), [club]);

  if (!club && type === "unknown") return null;
  if (!club && type === "complete") {
    return <NotFound />;
  }
  if (!club) return null;

  return (
    <ClubContext.Provider value={club}>
      <PermissionProvider>
        <Routes>
          <Route path="/" element={<ClubPage />} />
        </Routes>
      </PermissionProvider>
    </ClubContext.Provider>
  );
};
