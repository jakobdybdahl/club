import { PushProcessor } from "@rocicorp/zero/pg";
import { DrizzleDatabaseProvider } from "./database-provider";

export { mutators } from "./mutators";

export const processor = new PushProcessor(
  new DrizzleDatabaseProvider(),
  "info"
);
