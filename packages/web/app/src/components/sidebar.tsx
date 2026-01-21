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
import { Link as BaseLink } from "react-router";

function Link({ className, ...props }: React.ComponentProps<typeof BaseLink>) {
  return <BaseLink className={cn("cursor-default", className)} {...props} />;
}

function PersonalNav() {
  const [showSearchDialog, setShowSearchDialog] = useState(false);

  useHotkeys("mod+k", () => {
    if (showSearchDialog) return;
    setShowSearchDialog(true);
  });

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Personal</SidebarGroupLabel> */}
      <SidebarMenu>
        <SidebarMenuItem onClick={() => setShowSearchDialog(true)}>
          {/* <SidebarMenuButton className="border border-sidebar-accent bg-sidebar-accent/40 -m-px"> */}
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
              <Link to="/">
                <HomeIcon />
                <span>Home</span>
              </Link>
            }
          />
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={
              <Link to="/events">
                <CalendarIcon />
                <span>Events</span>
              </Link>
            }
          />
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={
              <Link to="/inbox">
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
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Favorites</SidebarGroupLabel>
      <SidebarMenu>
        {Array.from({ length: 3 }).map((_, i) => (
          <SidebarMenuItem key={i}>
            <SidebarMenuButton
              render={
                <Link to="/c/odder-cykel-klub" className="truncate">
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
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Explore</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={
              <Link to="/explore/clubs">
                <Building2Icon />
                <span>Clubs</span>
              </Link>
            }
          />
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={
              <Link to="/explore/events">
                <CalendarSearchIcon />
                <span>Events</span>
              </Link>
            }
          />
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={
              <Link to="/explore/users">
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

function Search() {
  const [showDialog, setShowDialog] = useState(false);

  useHotkeys("mod+k", () => {
    if (showDialog) return;
    setShowDialog(true);
  });

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="relative">
            <button
              onClick={() => setShowDialog(true)}
              className="dark:bg-input/30 flex items-center text-muted-foreground border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              Search
            </button>
            <div className="absolute top-2 right-2.5 flex items-center gap-1">
              <Mod mod="mod" />
              <Kbd className="aspect-square">K</Kbd>
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="p-8">
          <div>Search todo..</div>
        </DialogContent>
      </Dialog>
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
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground gap-3"
              >
                <div className="rounded-lg size-8 flex items-center justify-center bg-white/80 aspect-square">
                  <LogInIcon className="size-5 text-background" />
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
        {/* <Search /> */}
        <PersonalNav />
        <FavoritesNav />
        <div className="flex-1" />
        <ExploreNav />
      </SidebarContent>
      <SidebarFooter className="border-t">
        {/* <Button>Sign in</Button> */}
        <SignInItem />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
