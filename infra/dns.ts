const PRODUCTION = "palmer.jakobdybdahl.com";
const DEV = "dev.palmer.jakobdybdahl.com";

export const { zone, domain } = (() => {
  if ($app.stage === "production") {
    return {
      zone: new aws.route53.Zone(
        "Zone",
        { name: PRODUCTION },
        {
          retainOnDelete: true,
          import: "Z08691642ZO6KVVYJ3A5D",
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
          import: "Z08691642ZO6KVVYJ3A5D",
          ignoreChanges: ["*"],
        }
      ),
      domain: DEV,
    };
  }

  return {
    zone: aws.route53.Zone.get("Zone", "Z08691642ZO6KVVYJ3A5D"),
    domain: `${$app.stage}.${DEV}`,
  };
})();
