import { useAccount } from "@/providers/account";
import { Button } from "@club/ui/components/button.js";
import { queries } from "@club/zero/queries";
import { useQuery } from "@rocicorp/zero/react";
import { useEffect } from "react";

export function OverviewPage() {
  const { current: account } = useAccount();
  const [myClubs] = useQuery(
    queries.clubs({
      dir: "forward",
      limit: 100,
      start: null,
      query: {
        sort: "name",
        sortDirection: "asc",
        member: account?.email,
      },
    }),
  );

  useEffect(() => console.log(myClubs), [myClubs]);

  useEffect(() => console.log("account", account), [account]);

  return (
    <div className="flex flex-col gap-14">
      <div className="flex gap-4">
        <Button variant="ghost">Cancel</Button>
        <Button>Save</Button>
      </div>
      <div>Overview</div>
      <div className="h-[300px]" />
      <div>Overview</div>
      <div className="h-[300px]" />
      <div>Overview</div>
      <div className="h-[300px]" />
      <div>Overview</div>
      <div className="h-[300px]" />
      <div>Overview</div>
      <div className="h-[300px]" />
    </div>
  );
}
