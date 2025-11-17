import { Button, IconApp, Separator, Toaster } from "@club/ui";
import { queries } from "@club/zero/queries";
import { useQuery } from "@rocicorp/zero/react";
import { AuthProvider, useAuth } from "./providers/auth";
import { LocaleProvider } from "./providers/locale";
import { ZeroProvider } from "./providers/zero";

import { useEffect } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useParams,
} from "react-router";
import { Code, Email } from "./features/auth";
import { ClubRoute } from "./features/club";
import "./i18n/config";
import { AccountProvider, useAccount } from "./providers/account";

function EventList() {
  const [events, { type }] = useQuery(
    queries.events({ type: "public" }, { clubId: "NZHqw55YKDlrkTP4byzWF" })
  );

  useEffect(() => console.log("list", events, type), [type]);

  return (
    <div className="flex h-screen justify-center p-32">
      <div className="w-11/12 max-w-xl h-fit p-8 rounded-xl border bg-card flex flex-col gap-4">
        <div>Upcoming events</div>
        <Separator />
        <div className="text-sm w-full">
          {events.map((event) => (
            <div className="relative flex items-center">
              <Link
                to={event.id}
                key={event.id}
                className="py-2.5 px-1 hover:bg-muted/30 w-full rounded-sm flex items-center gap-4"
              >
                <div className="flex-1">{event.name}</div>
              </Link>
              <Link
                to={event.club ? `/c/${event.club.slug}` : "#"}
                className="absolute right-0 text-muted-foreground"
              >
                {event.club?.name}
              </Link>
            </div>
          ))}
        </div>
        {events.length === 0 && type === "complete" && (
          <div className="text-center text-muted-foreground text-sm">
            No events...
          </div>
        )}
      </div>
    </div>
  );
}

function EventPage() {
  const { id } = useParams();

  const [event, { type }] = useQuery(
    queries.event({ type: "public" }, { id: id! })
  );

  useEffect(() => console.log("event detail", event, type), [event, type]);

  if (!id) return <Navigate to="/" />;

  return (
    <div className="flex h-screen justify-center p-32">
      <div className="w-11/12 max-w-xl p-8 rounded-xl border bg-card">
        {event?.name}
      </div>
    </div>
  );
}

function Home() {
  const { current } = useAccount();

  const [clubs] = useQuery(
    queries.myClubs({
      type: "account",
      properties: { accountId: "123", email: "dybdahl@smukand.dk" },
    })
  );

  useEffect(() => console.log("clubs", clubs), [clubs]);

  useEffect(() => console.log({ account: current }), [current]);

  return (
    <Routes>
      <Route path="/" element={<EventList />} />
      <Route path="/:id" element={<EventPage />} />
    </Routes>
  );
}

function Navbar() {
  const auth = useAuth();
  const { current: account } = useAccount();
  return (
    <div className="flex items-center py-4 border-b bg-card px-8">
      <div className="flex-1">
        <IconApp size={22} />
      </div>
      {!account ? (
        <Button size="sm" variant="ghost" onClick={() => auth.authorize()}>
          Sign in
        </Button>
      ) : (
        <div className="text-sm font-semibold">{account.email}</div>
      )}
    </div>
  );
}

function App() {
  return (
    <LocaleProvider>
      <AuthProvider>
        <ZeroProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="auth/email" element={<Email />} />
              <Route path="auth/code" element={<Code />} />
              <Route
                path="*"
                element={
                  <AccountProvider>
                    <div className="flex flex-col">
                      <Navbar />
                      <Outlet />
                    </div>
                  </AccountProvider>
                }
              >
                <Route path="c/:slug" element={<ClubRoute />} />
                <Route path="*" element={<Home />} />
                {/* <Route path="*" element={<NotFound />} /> */}
              </Route>
            </Routes>
          </BrowserRouter>
        </ZeroProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}

{
  /* <Route path="workspace" element={<CreateWorkspace />} />
<Route
  path=":workspaceSlug/*"
  element={<WorkspaceRoute />}
/>
<Route path="" element={<PickWorkspace />} />
<Route path="*" element={<NotFound />} /> */
}

export default App;
