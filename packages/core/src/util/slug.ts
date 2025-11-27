export const toSlug = (str: string) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s\-_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};
