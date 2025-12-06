import { ApiProvider } from "@/providers/api";
import { PermissionProvider } from "@/providers/permissions";
import { buildMenu } from "@club/core/cms/menu/build-menu";
import { queries } from "@club/zero/queries";
import { QueryResultType } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/react";
import { useMemo } from "react";
import { Outlet, Route, Routes } from "react-router";
import { ClubContext } from "../club/context";
import { NotFound } from "../error-pages";
import { Menu } from "./components/menu";
import { PageRouter } from "./components/page";

type CmsQuery = NonNullable<QueryResultType<typeof queries.cmsBySlug>>;

export function CmsPage({ config }: { config: CmsQuery }) {
  const menu = useMemo(() => {
    if (!config?.menu) return null;
    return buildMenu(config.menu.config);
  }, [config]);

  const [club, { type }] = useQuery(queries.club({ clubId: config.id }));

  if (!club && type === "complete") {
    return <NotFound />;
  }

  return (
    <Routes>
      <Route
        path="*"
        element={
          <div className="flex flex-col items-center justify-center bg-background">
            <div className="p-4 sticky top-0 bg-background/90 backdrop-blur-xl w-full flex justify-center">
              <Menu items={menu ?? []} />
            </div>
            {club && (
              <ClubContext.Provider value={club}>
                <PermissionProvider>
                  <ApiProvider>
                    <Outlet />
                  </ApiProvider>
                </PermissionProvider>
              </ClubContext.Provider>
            )}
          </div>
        }
      >
        <Route path="*" element={<PageRouter />} />
      </Route>
    </Routes>
  );
}
