import { api } from "./api";
import { domain } from "./dns";
import { zero } from "./zero";

const appDomain = "chat." + domain;

export const web = new sst.aws.StaticSite("WebApp", {
  path: "packages/web/app",
  build: {
    output: "dist",
    command: "bun run build",
  },
  domain: {
    name: appDomain,
  },
  environment: {
    VITE_API_URL: api.url,
    VITE_ZERO_URL: zero.url,
    VITE_DOMAIN: appDomain,
    VITE_STAGE: $app.stage,
  },
});
