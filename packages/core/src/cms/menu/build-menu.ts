import { menuSchema } from "../types";

export type ItemTree<T> = T & {
  parentId?: string;
  items: ItemTree<T>[];
  depth: number;
};

function buildTree<T extends { id: string; parentId?: string }>(
  items: T[],
  opts: { parentId?: string | null; depth?: number } = {}
): ItemTree<T>[] {
  const { parentId, depth = 0 } = opts;
  const withSubItems = items
    .filter((item) => item.parentId === parentId)
    .map((item) => {
      const subItems = buildTree(items, {
        parentId: item.id,
        depth: depth + 1,
      });
      return {
        ...item,
        depth,
        items: subItems,
      };
    });
  return withSubItems;
}

export function buildMenu(config: unknown) {
  const parseResult = menuSchema.safeParse(config);
  if (!parseResult.success) {
    console.log(parseResult.error);
    return null;
  }
  const data = parseResult.data;
  const items = buildTree(data.items);
  return items;
}
