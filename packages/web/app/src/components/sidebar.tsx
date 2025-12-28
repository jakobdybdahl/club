import {
  Dialog,
  DialogContent,
  DropdownMenu,
  DropdownMenuTrigger,
  Kbd,
  Mod,
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
} from "@club/ui";
import {
  Building2Icon,
  CalendarIcon,
  CalendarSearchIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  HomeIcon,
  InboxIcon,
  LogInIcon,
  UserCircleIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Link } from "react-router";

function PersonalNav() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Personal</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to="/">
              <HomeIcon />
              <span>Overview</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to="/events">
              <CalendarIcon />
              <span>My events</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to="/inbox">
              <InboxIcon />
              <span>Inbox</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
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
          <SidebarMenuButton asChild>
            <Link to="/explore/clubs">
              <Building2Icon />
              <span>Clubs</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to="/explore/events">
              <CalendarSearchIcon />
              <span>Events</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to="/explore/users">
              <UsersIcon />
              <span>Users</span>
            </Link>
          </SidebarMenuButton>
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
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-blue-700/20 data-[state=open]:text-sidebar-accent-foreground border border-blue-800/40 bg-blue-700/10 gap-3 hover:bg-blue-700/20"
            >
              <div className="rounded-lg size-8 flex items-center justify-center bg-blue-700 aspect-square">
                <UserCircleIcon className="size-5" />
              </div>
              <div className="flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">My account</span>
              </div>
              <ChevronsUpDownIcon />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
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
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground gap-3"
            >
              <div className="rounded-lg size-8 flex items-center justify-center bg-white aspect-square">
                <LogInIcon className="size-5 text-background" />
              </div>
              <div className="flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Sign in</span>
              </div>
              <ChevronRightIcon />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
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
        <ExploreNav />
        <Search />
      </SidebarContent>
      <SidebarFooter className="border-t">
        {/* <Button>Sign in</Button> */}
        <SignInItem />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
