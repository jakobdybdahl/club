import { Toaster } from "@club/ui";
import { ThemeProvider } from "@club/ui/providers";
import { queries } from "@club/zero/queries";
import { useQuery } from "@rocicorp/zero/react";
import { useEffect, useMemo } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { Code, Email } from "./features/auth";
import { CmsPage } from "./features/cms";
import { NotFound } from "./features/error-pages";
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
      const slug = splits[0].slice(0, -1); // remove trailing '.'
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

  useEffect(() => console.log({ type, value }), [type, value]);

  const [club, clubResult] = useQuery(
    type === "custom-domain"
      ? queries.cmsByDomain({ domain: value })
      : queries.cmsBySlug({ slug: value })
  );

  if (clubResult.type === "unknown") return null;
  if (!club) {
    return <NotFound />;
  }
  if (clubResult.type !== "complete") return null;

  return <CmsPage config={club} />;
}

function AppContextPicker() {
  const hostname = window.location.hostname;
  const isCms = useMemo(() => hostname !== APP_DOMAIN, [hostname]);

  useEffect(() => console.log("app context picker"), []);

  console.log({ isCms });

  if (isCms) {
    return <CmsRoute />;
  }

  return <div className="p-8 text-xl">App</div>;
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
