import { database } from "./database";
import { domain } from "./dns";
import { vpc } from "./network";

const router = new sst.aws.Router("ApiRouter", {
  domain: "api." + domain,
});

export const api = new sst.aws.Function("Api", {
  handler: "packages/backend/src/functions/api.handler",
  timeout: "3 minutes",
  permissions: [{ actions: ["ses:*", "ssm:*"], resources: ["*"] }],
  vpc,
  link: [database],
  url: {
    route: {
      router,
    },
    cors: {
      allowCredentials: true,
      allowHeaders: ["*"],
      allowMethods: ["*"],
      allowOrigins: ["*"],
    },
  },
});
