import { SidebarInset, SidebarProvider } from "@club/ui/components/sidebar";
import { Toaster } from "@club/ui/components/sonner";
import { ThemeProvider } from "@club/ui/providers/theme-provider";
import { queries } from "@club/zero/queries";
import { useQuery } from "@rocicorp/zero/react";
import { useMemo } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { AppSidebar } from "./components/sidebar";
import { Code, Email } from "./features/auth";
import { CmsPage } from "./features/cms";
import { NotFound } from "./features/error-pages";
import { ExploreClubsPage } from "./features/explore/clubs";
import { ClubPage } from "./features/my-space";
import { OverviewPage } from "./features/my-space/pages/overview";
import "./i18n/config";
import { AccountProvider } from "./providers/account";
import { AuthProvider } from "./providers/auth";
import { LocaleProvider } from "./providers/locale";
import { ZeroProvider } from "./providers/zero";

const APP_DOMAIN = import.meta.env.DEV
  ? "app.localhost"
  : import.meta.env.VITE_DOMAIN;

const HOSTED_CMS_DOMAIN = import.meta.env.DEV
  ? "cms.localhost"
  : `cms.${import.meta.env.VITE_DOMAIN}`;

function CmsRoute() {
  const hostname = window.location.hostname;
  const { type, value } = useMemo(() => {
    if (hostname.endsWith(HOSTED_CMS_DOMAIN)) {
      const splits = hostname.split(HOSTED_CMS_DOMAIN);
      if (splits.length !== 2) {
        throw new Error("Expected two parts of hostname");
      }
      const slug = splits[0]?.slice(0, -1); // remove trailing '.'
      if (!slug) {
        throw new Error("Expected slug to be defined");
      }
      return {
        value: slug,
        type: "slug" as const,
      };
    } else {
      return {
        value: hostname,
        type: "custom-domain" as const,
      };
    }
  }, [hostname]);

  const [club, clubResult] = useQuery(queries.cms({ type, value }));

  if (clubResult.type === "unknown") return null;
  if (!club) {
    return <NotFound />;
  }
  if (clubResult.type !== "complete") return null;

  return <CmsPage config={club} />;
}

function AppRoute() {
  return (
    <Routes>
      <Route
        element={
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <Outlet />
            </SidebarInset>
          </SidebarProvider>
        }
      >
        <Route path="/" element={<OverviewPage />} />
        <Route path="/events" element={<div>Events</div>} />
        <Route path="/inbox" element={<div>Inbox</div>} />
        <Route path="/explore/clubs" element={<ExploreClubsPage />} />
        <Route path="/c/:slug/*" element={<ClubPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function AppContextPicker() {
  const isCms = window.location.hostname !== APP_DOMAIN;

  if (isCms) {
    return <CmsRoute />;
  }

  return <AppRoute />;
}

function App() {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="auth/email" element={<Email />} />
              <Route path="auth/code" element={<Code />} />
              <Route
                path="*"
                element={
                  <AccountProvider>
                    <ZeroProvider>
                      <AppContextPicker />
                    </ZeroProvider>
                  </AccountProvider>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}

export default App;
