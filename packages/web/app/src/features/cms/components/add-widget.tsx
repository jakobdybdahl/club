import { useClub } from "@/features/club/context";
import { useApi } from "@/providers/api";
import { Widget, WidgetOfType, WidgetType } from "@club/core/cms/page/schema";
import { MaybePromise, Prettify } from "@club/core/util/types";
import {
  Button,
  ButtonIdle,
  ButtonLoader,
  ButtonLoading,
  cn,
  Menu,
  MenuItem,
  MenuPopup,
  MenuPortal,
  MenuPositioner,
  MenuTrigger,
  Spinner,
  toast,
} from "@club/ui";
import { Editor, SerializedEditorState } from "@club/ui/editor";
import { generateKeyBetween } from "fractional-indexing";
import { PlusIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { JSX, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";

type Input<T extends WidgetType> = Prettify<
  Omit<Extract<Widget, { type: T }>, "id" | "order" | "type">
>;

const creator = (ctx: {
  clubId: string;
  widgets: Widget[];
}): {
  [Type in WidgetType]: (input: Input<Type>) => WidgetOfType<Type>;
} => {
  // assumes widgets are sorted
  const nextOrder = () => generateKeyBetween(ctx.widgets.at(-1)?.order, null);
  return {
    "rich-text": (input) => ({
      type: "rich-text",
      id: nanoid(),
      order: nextOrder(),
      body: input.body,
      backgroundColor: input.backgroundColor,
    }),
    events: (input) => ({
      type: "events",
      filter: input.filter,
      id: nanoid(),
      order: nextOrder(),
      display: input.display,
    }),
    image: (input) => ({
      type: "image",
      align: input.align,
      id: nanoid(),
      order: nextOrder(),
      url: input.url,
    }),
  };
};

function RichTextWidget(props: WidgetComponentProps<"rich-text">) {
  const [state, setState] = useState<SerializedEditorState | null>(null);
  return (
    <div className="flex flex-col gap-4">
      <Editor onChange={(input) => setState(input.toJSON())} />
      <div className="flex gap-4 justify-center">
        <Button variant="ghost" onClick={() => props.onCancel()}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (state === null) return;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            props.onSubmit({ body: state as any });
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

function ImageWidget(props: WidgetComponentProps<"image">) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alignment] = useState<WidgetOfType<"image">["align"]>("center");
  const [imageUrl, setImageUrl] = useState("");

  const api = useApi();

  const handleSubmit = async () => {
    if (isLoading) return;
    const imageInput = fileInputRef.current?.files?.[0];
    if (!imageInput) {
      toast.info("Please select image");
      return;
    }
    try {
      setIsLoading(true);
      const response = await api.client.media.upload.$post();
      if (response.status !== 200) {
        throw new Error("Failed to get logo upload info");
      }
      const { postUploadUrl, upload } = await response.json();

      const formData = new FormData();
      Object.entries(upload.fields).forEach(([k, v]) => formData.append(k, v));
      formData.append("Content-Type", imageInput.type);
      formData.append("file", imageInput); // must be the last one

      const uploadResponse = await fetch(upload.url, {
        method: "post",
        body: formData,
      });

      if (uploadResponse.status !== 204) {
        throw new Error("Failed to upload logo");
      }

      props.onSubmit({
        align: alignment,
        url: postUploadUrl,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border rounded p-4">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") {
                setImageUrl(reader.result);
              }
            };
            reader.onerror = () => toast.error("Fail reading file");
            reader.readAsDataURL(file);
          }}
        />
        {imageUrl ? (
          <div className="flex justify-center">
            <img src={imageUrl} className="max-h-full max-w-full" />
          </div>
        ) : (
          <div className="flex justify-center items-center h-[200px]">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Pick image
            </Button>
          </div>
        )}
      </div>
      <div className="flex justify-center gap-4">
        <Button variant="ghost" onClick={() => props.onCancel()}>
          Cancel
        </Button>
        <ButtonLoader isLoading={isLoading} onClick={() => void handleSubmit()}>
          <ButtonIdle>Add</ButtonIdle>
          <ButtonLoading>
            <Spinner size="sm" />
          </ButtonLoading>
        </ButtonLoader>
      </div>
    </div>
  );
}

function Noop({ onCancel: cancel }: { onCancel: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div>No implementation</div>
      <Button onClick={() => cancel()}>Cancel</Button>
    </div>
  );
}

type WidgetComponentProps<T extends WidgetType> = {
  onSubmit: (widget: Input<T>) => void;
  onCancel: () => void;
};

type WidgetComponent<T extends WidgetType> = (
  props: WidgetComponentProps<T>
) => JSX.Element;

const WidgetMap: {
  [Type in WidgetType]: WidgetComponent<Type>;
} = {
  "rich-text": RichTextWidget,
  events: Noop,
  image: ImageWidget,
};

function NewWidgetWrapper({
  type,
  existing,
  onSubmit,
  onCancel,
}: {
  type: WidgetType;
  existing: Widget[];
  onSubmit: (widget: Widget) => void;
  onCancel: () => void;
}) {
  const club = useClub();
  const Comp = WidgetMap[type];
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView();
  }, []);
  return (
    <div ref={ref}>
      <Comp
        onCancel={onCancel}
        onSubmit={(widget) => {
          const create = creator({ clubId: club.id, widgets: existing });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newWidget = create[type](widget as any);
          onSubmit(newWidget);
        }}
      />
    </div>
  );
}

export function AddWidget({
  className,
  ...props
}: {
  className?: string;
  widgets?: Widget[];
  onAdd: (widget: Widget) => MaybePromise<void>;
}) {
  const club = useClub();
  const { pathname } = useLocation();

  const [newWidgetContext, setNewWidgetContext] = useState<{
    type: WidgetType;
  } | null>(null);

  useEffect(() => setNewWidgetContext(null), [pathname]);

  const handleSubmit = (widget: Widget) => props.onAdd(widget);

  const initAdd = (type: WidgetType) => {
    if (type === "events") {
      const widget = creator({
        clubId: club.id,
        widgets: props.widgets ?? [],
      }).events({ filter: { clubId: club.id } });
      return handleSubmit(widget);
    }
    setNewWidgetContext({ type });
  };

  if (newWidgetContext) {
    return (
      <NewWidgetWrapper
        type={newWidgetContext.type}
        existing={props.widgets ?? []}
        onCancel={() => setNewWidgetContext(null)}
        onSubmit={(widget) => {
          try {
            handleSubmit(widget);
          } finally {
            setNewWidgetContext(null);
          }
        }}
      />
    );
  }

  return (
    <div className={cn("w-full flex justify-center", className)}>
      <Menu>
        <MenuTrigger
          render={
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <PlusIcon />
              Add section
            </Button>
          }
        />
        <MenuPortal>
          <MenuPositioner sideOffset={4}>
            <MenuPopup>
              <MenuItem onClick={() => initAdd("rich-text")}>
                Rich text
              </MenuItem>
              <MenuItem onClick={() => initAdd("image")}>Image</MenuItem>
              <MenuItem onClick={() => initAdd("events")}>Event list</MenuItem>
            </MenuPopup>
          </MenuPositioner>
        </MenuPortal>
      </Menu>
    </div>
  );
}
