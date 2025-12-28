import { queries } from "@club/zero/queries";
import { useQuery } from "@rocicorp/zero/react";
import { Link } from "react-router";

export function ExploreClubsPage() {
  const [clubs] = useQuery(queries.clubs());

  return (
    <div className="flex flex-col">
      {clubs.map((club) => (
        <Link
          to={`/c/${club.slug}`}
          key={club.id}
          className="flex items-center gap-4 py-3 px-4"
        >
          {club.name}
        </Link>
      ))}
    </div>
  );
}
