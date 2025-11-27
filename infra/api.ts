import { auth } from "./auth";
import { bus } from "./bus";
import { cdn } from "./cdn";
import { database } from "./database";
import { domain } from "./dns";
import { email } from "./email";
import { vpc } from "./network";
import { storage } from "./storage";

const router = new sst.aws.Router("ApiRouter", {
  domain: "api." + domain,
});

export const api = new sst.aws.Function("Api", {
  handler: "packages/backend/src/function/api.handler",
  timeout: "3 minutes",
  permissions: [{ actions: ["ses:*", "ssm:*"], resources: ["*"] }],
  vpc,
  link: [auth, database, email, bus, storage, cdn],
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
