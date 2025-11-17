import { bus } from "./bus";
import { database } from "./database";
import { vpc } from "./network";

bus.subscribe(
  "EventSubscriber",
  {
    handler: "packages/backend/src/function/events/event.handler",
    vpc,
    link: [database, bus],
  },
  {
    pattern: {
      source: [`${$app.name}.${$app.stage}`],
    },
  }
);
