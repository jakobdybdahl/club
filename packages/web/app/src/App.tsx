import {
  Button,
  cn,
  IconApp,
  Menu,
  MenuItem,
  MenuPopup,
  MenuPortal,
  MenuPositioner,
  MenuTrigger,
  Separator,
  Toaster,
} from "@club/ui";
import { queries } from "@club/zero/queries";
import { useQuery } from "@rocicorp/zero/react";
import dayjs from "dayjs";
import { EarthLockIcon, MoreHorizontalIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
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
import { AuthProvider, useAuth } from "./providers/auth";
import { LocaleProvider, useLocale } from "./providers/locale";
import { ZeroProvider } from "./providers/zero";

function EventList({ clubId }: { clubId: string }) {
  const { current: account } = useAccount();
  const user = useMemo(() => {
    if (!account) return null;
    return account.clubs.find((club) => club.id === clubId)?.user ?? null;
  }, [account, clubId]);
  const [events, { type }] = useQuery(
    queries.events(
      user
        ? {
            type: "user",
            properties: {
              userId: user.id,
              clubId: user.clubId,
              permissions: [],
            },
          }
        : account
        ? {
            type: "account",
            properties: { accountId: account.id, email: account.email },
          }
        : { type: "public" },
      { clubId }
    )
  );

  return (
    <div className="w-full h-fit rounded p-6 border bg-card flex flex-col gap-4">
      <div>Upcoming events</div>
      <Separator />
      <div className="text-sm w-full">
        {events.map((event) => (
          <div key={event.id} className="relative flex items-center">
            <Link
              to={event.id}
              key={event.id}
              className="h-10 px-1 hover:bg-muted/30 w-full rounded-sm flex items-center gap-4"
            >
              <div>{event.name}</div>
              {event.visibility === "public" && (
                <div className="text-[0.7rem] leading-none font-medium text-foreground/80 bg-muted/70 border rounded p-1">
                  PUBLIC
                </div>
              )}
            </Link>
            <Link
              to={event.club ? `/c/${event.club.slug}` : "#"}
              className="absolute right-0 text-muted-foreground underline-offset-4 hover:underline"
            >
              {event.club?.name}
            </Link>
          </div>
        ))}
      </div>
      {events.length === 0 && type === "complete" && (
        <div className="text-center text-muted-foreground text-sm">
          No events
        </div>
      )}
    </div>
  );
}

function CalendarDay({
  date,
  className,
  ...props
}: { date: number } & Omit<React.ComponentProps<"div">, "children">) {
  const { locale } = useLocale();
  const { month, day, weekday } = useMemo(() => {
    const d = dayjs(date).toDate();
    const month = Intl.DateTimeFormat(locale, { month: "short" }).format(d);
    const day = Intl.DateTimeFormat(locale, { day: "numeric" }).format(d);
    const weekday = Intl.DateTimeFormat(locale, { weekday: "short" }).format(d);
    return { month, day, weekday };
  }, [locale, date]);

  return (
    <div className={cn("w-[58px] rounded-md", className)} {...props}>
      <div className="text-center bg-foreground text-background rounded-t-md text-[0.7rem] font-medium leading-none py-1">
        {month}
      </div>
      <div className="border text-center py-1.5 rounded-b-md space-y-1">
        <div className="text-2xl leading-none tracking-wider">{day}</div>
        <div className="text-[0.7rem] leading-none text-muted-foreground font-medium">
          {weekday}
        </div>
      </div>
    </div>
  );
}

function EventPage() {
  const { id } = useParams();
  const { current: account } = useAccount();
  const { locale } = useLocale();

  const [event, { type }] = useQuery(
    queries.event(
      account
        ? {
            type: "account",
            properties: { accountId: account.id, email: account.email },
          }
        : { type: "public" },
      { id: id! }
    )
  );

  const date = dayjs("2025-11-17T07:00:00Z");

  const dateTime = useMemo(() => {
    return Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
    }).format(date.toDate());
  }, [date]);

  if (!id) return <Navigate to="/" />;

  return (
    <div className="flex justify-center pt-20">
      <div className="flex gap-8 w-11/12 max-w-6xl">
        <div className="flex-1 rounded-xl border bg-card relative">
          {event?.visibility === "private" && (
            <div className="absolute -top-3 right-8 bg-card flex gap-2.5 items-center p-1 border rounded h-fit w-fit">
              <EarthLockIcon size={16} className="text-muted-foreground" />
              <div className="text-[0.7rem] leading-none text-foreground/80 font-medium">
                PRIVATE EVENT
              </div>
            </div>
          )}
          <div className="p-8 flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <CalendarDay date={date.valueOf()} />
              <div className="flex flex-col gap-2 items-end">
                <div className="flex items-center -gap-2 *:not-last:-mr-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 border border-card bg-blue-700 rounded-full"
                    ></div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  Jakob and 22 others are going
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-4xl flex-1 font-semibold">{event?.name}</div>
              <div className="text-muted-foreground font-medium text-sm">
                {dateTime}
              </div>
            </div>
            <div className="flex gap-4">
              <Button>I'm going</Button>
              <Menu>
                <MenuTrigger
                  render={
                    <Button variant="outline">
                      <MoreHorizontalIcon />
                    </Button>
                  }
                />
                <MenuPortal>
                  <MenuPositioner align="start" sideOffset={4}>
                    <MenuPopup>
                      <MenuItem>Settings</MenuItem>
                    </MenuPopup>
                  </MenuPositioner>
                </MenuPortal>
              </Menu>
            </div>
          </div>
          <Separator />
          <div className="p-8 text-muted-foreground">Event details here..</div>
          <Separator />
          <div className="p-8 text-muted-foreground">Attendees</div>
        </div>
        <div className="py-8 flex-1 max-w-sm">
          <div className="flex flex-col gap-6">
            <div className="flex gap-6">
              <div className="size-24 flex items-center justify-center border bg-muted/20 rounded-xs">
                LOGO
              </div>
              <div className="flex flex-col gap-4">
                <Link
                  to={`/c/${event?.club?.slug}`}
                  className="text-lg hover:text-blue-600 underline-offset-4 hover:underline"
                >
                  {event?.club?.name}
                </Link>
                <div className="text-sm">Only good times</div>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-4">
              <div className="text-lg">Share & Invite</div>
              <div className="flex items-center gap-2.5">
                <div className="size-5 bg-green-300" />
                <div className="size-5 bg-green-300" />
                <div className="size-5 bg-green-300" />
                <div className="size-5 bg-green-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyClubsNav() {
  const { current: account } = useAccount();
  const [myClubs] = useQuery(
    queries.myClubs(
      account
        ? {
            type: "account",
            properties: { accountId: account.id, email: account.email },
          }
        : { type: "public" }
    )
  );

  useEffect(() => console.log({ myClubs }), [myClubs]);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* <div className="text-sm text-muted-foreground">Clubs</div> */}
      {myClubs.map((club) => (
        <Link
          to={`/c/${club.slug}`}
          className="text-sm text-foreground/80 font-medium py-2 px-1.5 rounded-lg bg-muted leading-none"
        >
          {club.name}
        </Link>
      ))}
    </div>
  );
}

function Home() {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <div className="flex justify-center p-8">
            <div className="w-11/12 max-w-xl flex flex-col gap-6">
              <MyClubsNav />
              <Outlet />
            </div>
          </div>
        }
      >
        <Route index element={<EventList clubId="NZHqw55YKDlrkTP4byzWF" />} />
        <Route path=":id" element={<EventPage />} />
      </Route>
    </Routes>
  );
}

function Navbar() {
  const auth = useAuth();
  const { current: account } = useAccount();
  return (
    <div className="flex items-center py-4 border-b bg-card px-8">
      <div className="flex-1">
        <Link to="/">
          <Button
            size="sm"
            variant="ghost"
            className="flex items-center gap-2.5"
          >
            <IconApp className="size-5" />
            <div className="font-bold tracking-widest">CLUB</div>
          </Button>
        </Link>
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
                <Route path="c/:slug/*" element={<ClubRoute />} />
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

export default App;
