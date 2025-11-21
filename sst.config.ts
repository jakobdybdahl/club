/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "club",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: { command: "1.1.3", random: "4.18.4" },
    };
  },
  async run() {
    await import("./infra/dns");
    await import("./infra/auth");
    await import("./infra/database");
    await import("./infra/email");
    await import("./infra/bus");
    await import("./infra/event");
    await import("./infra/api");
    await import("./infra/web");
    await import("./infra/cluster");
    await import("./infra/storage");
  },
});
