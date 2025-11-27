import { db } from "@club/core/drizzle/index";
import { select } from "@inquirer/prompts";

export const selectClub = async () => {
  const clubs = await db.query.club.findMany({
    where: (table, { isNull }) => isNull(table.timeDeleted),
  });
  return select<{ id: string; name: string }>({
    message: "Club:",
    choices: clubs.map((club) => ({ value: club, name: club.name })),
  });
};
