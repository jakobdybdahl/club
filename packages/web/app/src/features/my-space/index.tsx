import { queries } from "@club/zero/queries";
import { useQuery } from "@rocicorp/zero/react";
import { Route, Routes, useParams } from "react-router";
import { ClubContext, useClub } from "../club/context";
import { NotFound } from "../error-pages";
import { OverviewPage } from "./pages/overview";

function TopbarItem() {}

function ClubTopbar() {
  const club = useClub();
  return <div></div>;
}

export function ClubPage() {
  const { slug = "" } = useParams();
  const [club, { type }] = useQuery(queries.clubBySlug({ slug }));

  if (!club && type === "complete") {
    return <NotFound />;
  }

  if (!club) return null;

  return (
    <ClubContext.Provider value={club}>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
      </Routes>
      ;
    </ClubContext.Provider>
  );
}
