import { useAuth } from "@/providers/auth";
import { Dialog, DialogContent } from "@club/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@club/ui/components/dropdown-menu";
import { Kbd, Mod } from "@club/ui/components/kbd";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@club/ui/components/sidebar";
import { cn } from "@club/ui/lib/utils";
import {
  Building2Icon,
  CalendarIcon,
  CalendarSearchIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  HomeIcon,
  InboxIcon,
  LogInIcon,
  SearchIcon,
  StarIcon,
  UserCircleIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Link as BaseLink, useLocation } from "react-router";

function Link({
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  active,
  ...props
}: React.ComponentProps<typeof BaseLink> & { active: boolean }) {
  return <BaseLink className={cn("cursor-default", className)} {...props} />;
}

function PersonalNav() {
  const { pathname } = useLocation();
  const [showSearchDialog, setShowSearchDialog] = useState(false);

  useHotkeys("mod+k", () => {
    if (showSearchDialog) return;
    setShowSearchDialog(true);
  });

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem onClick={() => setShowSearchDialog(true)}>
          <SidebarMenuButton>
            <SearchIcon />
            <div className="flex-1 flex items-center">
              <span className="flex-1">Search</span>
              <span className="flex items-center gap-1">
                <Mod mod="mod" />
                <Kbd className="aspect-square">K</Kbd>
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={
              <Link to="/" active={pathname === "/"}>
                <HomeIcon />
                <span>Home</span>
              </Link>
            }
          />
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={
              <Link to="/events" active={pathname.startsWith("/events")}>
                <CalendarIcon />
                <span>Events</span>
              </Link>
            }
          />
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={
              <Link to="/inbox" active={pathname.startsWith("/inbox")}>
                <InboxIcon />
                <span>Inbox</span>
              </Link>
            }
          />
        </SidebarMenuItem>
      </SidebarMenu>
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="p-8">
          <div>Search todo..</div>
        </DialogContent>
      </Dialog>
    </SidebarGroup>
  );
}

function FavoritesNav() {
  const { pathname } = useLocation();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Favorites</SidebarGroupLabel>
      <SidebarMenu>
        {Array.from({ length: 3 }).map((_, i) => (
          <SidebarMenuItem key={i}>
            <SidebarMenuButton
              render={
                <Link
                  to="/c/odder-cykel-klub"
                  className="truncate"
                  active={pathname.startsWith("/c/odder-cykel-klub")}
                >
                  <StarIcon />
                  Odder Cykel Klub
                </Link>
              }
            />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function ExploreNav() {
  const { pathname } = useLocation();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Explore</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={
              <Link to="/explore/clubs" active={pathname === "/explore/clubs"}>
                <Building2Icon />
                <span>Clubs</span>
              </Link>
            }
          />
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={
              <Link
                to="/explore/events"
                active={pathname === "/explore/events"}
              >
                <CalendarSearchIcon />
                <span>Events</span>
              </Link>
            }
          />
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={
              <Link to="/explore/users" active={pathname === "/explore/users"}>
                <UsersIcon />
                <span>Users</span>
              </Link>
            }
          />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

function AccountSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-blue-700/20 data-[state=open]:text-sidebar-accent-foreground border border-blue-800/40 bg-blue-700/10 gap-3 hover:bg-blue-700/20!"
              >
                <div className="rounded-lg size-8 flex items-center justify-center bg-blue-700 aspect-square">
                  <UserCircleIcon className="size-5" />
                </div>
                <div className="flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">My account</span>
                </div>
                <ChevronsUpDownIcon className="text-muted-foreground" />
              </SidebarMenuButton>
            }
          />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function SignInItem() {
  const { pathname } = useLocation();
  const { authorize } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground gap-3"
                onClick={() => {
                  if (isLoading) return;
                  setIsLoading(true);
                  authorize(pathname);
                }}
              >
                <div className="rounded-lg size-7 flex items-center justify-center bg-white/80 aspect-square">
                  <LogInIcon className="size-4 text-background" />
                </div>
                <div className="flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Sign in</span>
                </div>
                <ChevronRightIcon />
              </SidebarMenuButton>
            }
          />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AccountSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <PersonalNav />
        <FavoritesNav />
        <div className="flex-1" />
        <ExploreNav />
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SignInItem />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
