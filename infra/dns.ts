const PRODUCTION = "club.jakobdybdahl.com";
const DEV = "dev.club.jakobdybdahl.com";

export const { zone, domain } = (() => {
  if ($app.stage === "production") {
    return {
      zone: new aws.route53.Zone(
        "Zone",
        { name: PRODUCTION },
        {
          retainOnDelete: true,
          import: "Z0732866K2E5R11G138C",
          ignoreChanges: ["*"],
        }
      ),
      domain: PRODUCTION,
    };
  }

  if ($app.stage === "dev") {
    return {
      zone: new aws.route53.Zone(
        "Zone",
        { name: DEV },
        {
          retainOnDelete: true,
          import: "Z0732866K2E5R11G138C",
          ignoreChanges: ["*"],
        }
      ),
      domain: DEV,
    };
  }

  return {
    zone: aws.route53.Zone.get("Zone", "Z0732866K2E5R11G138C"),
    domain: `${$app.stage}.${DEV}`,
  };
})();
