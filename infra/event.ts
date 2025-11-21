import { bus } from "./bus";
import { database } from "./database";
import { email } from "./email";
import { vpc } from "./network";
import { web } from "./web";

bus.subscribe(
  "EventSubscriber",
  {
    handler: "packages/backend/src/function/events/event.handler",
    vpc,
    link: [database, bus, web, email],
  },
  {
    pattern: {
      source: [`${$app.name}.${$app.stage}`],
    },
  }
);
