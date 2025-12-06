import { Actor } from "@club/core/actor";
import { schema } from "./schema";

declare module "@rocicorp/zero" {
  interface DefaultTypes {
    context: Actor;
    schema: typeof schema;
  }
}

export {};
