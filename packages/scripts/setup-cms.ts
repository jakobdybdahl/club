import { withActor } from "@club/core/actor";
import { menu } from "@club/core/cms/cms.sql";
import { Item, Menu } from "@club/core/cms/types";
import { db } from "@club/core/drizzle/index";
import { createTransaction } from "@club/core/util/transaction";
import { select } from "@inquirer/prompts";
import { nanoid } from "nanoid";

function buildMenu() {
  const sportsMenu: Item = {
    type: "group",
    id: nanoid(),
    label: "Sportsgrene",
    layout: "two-columns",
    order: "b",
  };

  const football: Item[] = (() => {
    const section: Item = {
      type: "section",
      label: "Fodbold",
      id: nanoid(),
      order: "a",
      parentId: sportsMenu.id,
    };

    return [
      section,
      {
        type: "link",
        parentId: section.id,
        href: "/football/u13-piger",
        label: "U13 Piger",
        id: nanoid(),
        order: "a",
      },
      {
        type: "link",
        parentId: section.id,
        href: "/football/u15-drenge",
        label: "U15 Drenge",
        id: nanoid(),
        order: "b",
      },
    ];
  })();

  const handball: Item[] = (() => {
    const section: Item = {
      type: "section",
      label: "Håndbold",
      id: nanoid(),
      order: "b",
      parentId: sportsMenu.id,
    };

    return [
      section,
      {
        type: "link",
        parentId: section.id,
        href: "/handball/elite",
        label: "Herre Elite",
        id: nanoid(),
        order: "a",
      },
      {
        type: "link",
        parentId: section.id,
        href: "/handball/seniorbold",
        label: "Seniorbold",
        id: nanoid(),
        order: "c",
      },
      {
        type: "link",
        parentId: section.id,
        href: "/handball/elite",
        label: "Kvinde Elite",
        id: nanoid(),
        order: "b",
      },
    ];
  })();

  const others: Item[] = (() => {
    const section: Item = {
      type: "section",
      label: "Øvrige",
      id: nanoid(),
      order: "c",
      parentId: sportsMenu.id,
    };

    return [
      section,
      {
        type: "link",
        parentId: section.id,
        href: "/cykelklub",
        label: "Cykelklub",
        id: nanoid(),
        order: "a",
      },
      {
        type: "link",
        parentId: section.id,
        href: "/tennis",
        label: "Tennis",
        id: nanoid(),
        order: "b",
      },
    ];
  })();

  const aboutMenu: Item = {
    type: "group",
    id: nanoid(),
    label: "Om Odder Cykel Klub",
    layout: "list",
    order: "c",
  };

  const subAboutItems: Item[] = [
    {
      type: "link",
      parentId: aboutMenu.id,
      id: nanoid(),
      label: "Om OCK",
      href: "/about",
      order: "a",
      description: "Læs om OCK's formål og historie.",
    },
    {
      type: "link",
      parentId: aboutMenu.id,
      id: nanoid(),
      label: "Kontakt",
      href: "/contact",
      order: "a",
      description: "Find kontaktoplysninger og åbningstider.",
    },
    {
      type: "link",
      parentId: aboutMenu.id,
      id: nanoid(),
      label: "Bestyrrelse",
      href: "/board",
      order: "a",
      description: "Se medlemmerne af bestyrelsen.",
    },
    {
      type: "link",
      parentId: aboutMenu.id,
      id: nanoid(),
      label: "Frivillige",
      href: "/members",
      order: "a",
      description: "Information for og om vores frivillige.",
    },
  ];

  const menu: Menu = {
    items: [
      {
        type: "link",
        label: "Forside",
        href: "/",
        id: nanoid(),
        order: "a",
      },
      sportsMenu,
      ...football,
      ...handball,
      ...others,
      aboutMenu,
      ...subAboutItems,
    ],
  };

  return menu;
}

const clubs = await db.query.club.findMany({
  where: (table, { isNull }) => isNull(table.timeDeleted),
});
const c = await select<{ id: string; name: string }>({
  message: "Club:",
  choices: clubs.map((club) => ({ value: club, name: club.name })),
});

await withActor({ type: "system", properties: { clubId: c.id } }, async () => {
  const menuConfig = buildMenu();
  await createTransaction(async (tx) => {
    await tx
      .insert(menu)
      .values({
        clubId: c.id,
        config: menuConfig,
      })
      .onConflictDoUpdate({
        target: menu.clubId,
        set: {
          config: menuConfig,
          timeUpdated: Date.now(),
        },
      });
  });
});

process.exit(0);
