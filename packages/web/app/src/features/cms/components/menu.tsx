import { useAccount } from "@/providers/account";
import { useAuth } from "@/providers/auth";
import { ItemTree } from "@club/core/cms/menu/build-menu";
import { Item, ItemType } from "@club/core/cms/types";
import {
  ButtonIdle,
  ButtonLoader,
  ButtonLoading,
  cn,
  NavigationMenuArrow,
  NavigationMenuContent,
  NavigationMenuIcon,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuPopup,
  NavigationMenuPortal,
  NavigationMenuPositioner,
  NavigationMenuRoot,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
  Spinner,
} from "@club/ui";
import { useState } from "react";
import { Link } from "react-router";

const linkCardClassName =
  "data-[active]:focus:bg-accent data-[active]:hover:bg-accent data-[active]:bg-accent/50 data-[active]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus:ring-0 focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4";

function ListItem({
  title,
  children,
  href,
  active,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string; active?: boolean }) {
  return (
    <li {...props}>
      <NavigationMenuLink
        closeOnClick
        active={active}
        render={
          <Link to={href} className={linkCardClassName}>
            <div className="text-sm leading-none font-medium">{title}</div>
            {children && (
              <p className="mt-1 text-muted-foreground line-clamp-2 text-sm leading-snug">
                {children}
              </p>
            )}
          </Link>
        }
      />
    </li>
  );
}

type GroupItem = Extract<Item, { type: typeof ItemType.Group }> & {
  items: ItemTree<Item>[];
};

type ItemWithType<T extends Item["type"]> = Extract<
  ItemTree<Item>,
  { type: T }
>;

function MenuGroup({ item }: { item: GroupItem }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        {item.label}
        <NavigationMenuIcon />
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul
          className={cn("list-none", item.layout === "list" ? "" : "columns-2")}
        >
          {item.items.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function MenuSection({ item }: { item: ItemWithType<"section"> }) {
  return (
    <li className="first:mt-2 not-first:mt-5">
      <ul>
        <li className="mb-2 px-2 text-xs text-muted-foreground font-semibold cursor-default">
          {item.label}
        </li>
        {item.items.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            className="break-inside-avoid-column"
          />
        ))}
      </ul>
    </li>
  );
}

function MenuItem({
  item,
  className,
}: {
  item: ItemTree<Item>;
  className?: string;
}) {
  if (item.type === "group") {
    return <MenuGroup item={item} />;
  }

  if (item.type === "section") {
    return <MenuSection item={item} />;
  }

  if (item.type === "link") {
    if (item.depth === 0) {
      return (
        <NavigationMenuItem>
          <NavigationMenuLink
            render={
              <Link
                className={navigationMenuTriggerStyle({ className })}
                to={item.href}
              >
                {item.label}
              </Link>
            }
          />
        </NavigationMenuItem>
      );
    } else {
      return (
        <ListItem title={item.label} href={item.href} className={className}>
          {item.description}
        </ListItem>
      );
    }
  }

  return null;
}

function SignInButton() {
  const { current: acc } = useAccount();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (acc) return;

  return (
    <NavigationMenuItem>
      <ButtonLoader
        isLoading={isLoading}
        variant="outline"
        className="ml-2"
        onClick={() => {
          if (isLoading) return;
          setIsLoading(true);
          auth.authorize();
        }}
      >
        <ButtonIdle>Sign in</ButtonIdle>
        <ButtonLoading>
          <Spinner size="sm" />
        </ButtonLoading>
      </ButtonLoader>
    </NavigationMenuItem>
  );
}

export function Menu({ items }: { items: ItemTree<Item>[] }) {
  return (
    <NavigationMenuRoot className="max-w-max p-1 rounded-lg">
      <NavigationMenuList className="relative flex items-center gap-1">
        {items.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
        <SignInButton />
      </NavigationMenuList>
      <NavigationMenuPortal>
        <NavigationMenuPositioner>
          <NavigationMenuPopup>
            <NavigationMenuArrow />
            <NavigationMenuViewport />
          </NavigationMenuPopup>
        </NavigationMenuPositioner>
      </NavigationMenuPortal>
    </NavigationMenuRoot>
  );
}
