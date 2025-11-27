/* eslint-disable react-refresh/only-export-components */
import { useClub } from "@/features/club/context";
import { useZero } from "@/providers/zero";
import { pageSchema, Widget } from "@club/core/cms/page/schema";
import { queries } from "@club/zero/queries";
import { schema } from "@club/zero/schema";
import { Row } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/react";
import { nanoid } from "nanoid";
import React, { useMemo } from "react";
import { useLocation } from "react-router";
import { prop, sortBy } from "remeda";
import z from "zod";
import { AddWidget } from "./add-widget";
import { WidgetRenderer } from "./widgets";

type ParsedPageBody = z.infer<typeof pageSchema>;
export type PageType = Omit<Row<typeof schema.tables.page>, "body"> & {
  body: ParsedPageBody;
};
type PageContextType = PageType;
const PageContext = React.createContext<PageContextType | null>(null);

export const usePage = () => {
  const context = React.useContext(PageContext);
  if (!context) throw new Error("No page context");
  return context;
};

export function PageRouter() {
  const club = useClub();
  const z = useZero();
  const { pathname } = useLocation();

  const [page, { type }] = useQuery(
    queries.page(
      { type: "public" },
      { clubId: club.id, pageSlug: pathname.substring(1) }
    )
  );

  const parseResult = useMemo(() => {
    if (!page) return { body: undefined, success: false as const };
    const parseResult = pageSchema.safeParse(page.body);
    if (parseResult.success) {
      const sortedWidgets = sortBy(parseResult.data.widgets, prop("order"));
      return {
        body: {
          ...parseResult.data,
          widgets: sortedWidgets,
        },
        success: true as const,
      };
    }
    return {
      body: undefined,
      success: false as const,
    };
  }, [page]);

  const handleOnAdd = (widget: Widget) => {
    const now = Date.now();
    if (!page) {
      z.mutate.page.create({
        actorId: "anon",
        body: {
          widgets: [widget],
        },
        clubId: club.id,
        id: nanoid(),
        parentId: null,
        timeCreated: now,
        timeUpdated: now,
        title: pathname,
        slug: pathname,
        visibility: "public",
      });
    } else {
      const pageBody = parseResult.body
        ? {
            ...parseResult.body,
            widgets: [...parseResult.body.widgets, widget],
          }
        : {
            widgets: [widget],
          };

      console.log("updating page", page.title, pageBody);

      z.mutate.page.update({
        actorId: "anon",
        body: pageBody,
        clubId: club.id,
        id: page.id,
        timeUpdated: now,
        title: page.title,
      });
    }
  };

  if (!page && type === "complete") {
    return (
      <div className="w-11/12 max-w-2xl py-10">
        <AddWidget onAdd={handleOnAdd} />
      </div>
    );
  }

  if (!page) return null;
  if (!parseResult.success) {
    return <div className="p-6">Failed to parse page</div>;
  }

  return (
    <PageContext.Provider value={{ ...page, body: parseResult.body }}>
      <div className="w-11/12 max-w-2xl py-10">
        {parseResult.body.widgets.map((widget) => (
          <div key={widget.id} className="py-8">
            <WidgetRenderer data={widget} />
          </div>
        ))}
        <AddWidget
          widgets={parseResult.body.widgets}
          onAdd={handleOnAdd}
          className="pt-10"
        />
      </div>
    </PageContext.Provider>
  );
}
