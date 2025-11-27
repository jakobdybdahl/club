import { WidgetOfType } from "@club/core/cms/page/schema";

export function ImageWidget({ data }: { data: WidgetOfType<"image"> }) {
  return (
    <div className="flex justify-center">
      <img src={data.url} className="max-h-full max-w-full" />
    </div>
  );
}
