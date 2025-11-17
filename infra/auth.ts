import { database } from "./database";
import { domain } from "./dns";
import { email } from "./email";
import { vpc } from "./network";

export const auth = new sst.aws.Auth("Auth", {
  domain: "auth." + domain,
  issuer: {
    vpc,
    link: [database, email],
    handler: "packages/backend/src/function/auth/issuer.handler",
    environment: {
      AUTH_FRONTEND_URL: $dev
        ? "http://localhost:5173"
        : "https://" + "app." + domain,
    },
  },
});
