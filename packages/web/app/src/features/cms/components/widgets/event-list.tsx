import { useClub } from "@/features/club/context";
import { WidgetOfType } from "@club/core/cms/page/schema";
import { queries } from "@club/zero/queries";
import { useQuery } from "@rocicorp/zero/react";

export function EventListWidget({ data }: { data: WidgetOfType<"events"> }) {
  const { id: clubId } = useClub();
  const [events, { type }] = useQuery(
    queries.events({ type: "public" }, { clubId })
  );

  return (
    <div className="flex flex-col gap-4">
      {events.map((event) => (
        <div className="text-sm px-2.5 py-4 hover:bg-muted/50 rounded">
          <div className="font-semibold">{event.name}</div>
        </div>
      ))}
      {events.length === 0 && type === "complete" && (
        <div className="p-6 text-center text-sm text-muted-foreground">
          No events
        </div>
      )}
    </div>
  );
}
