import { domain } from "./dns";
import { secret } from "./secret";
import { storage } from "./storage";

const RESTRICTED_PREFIX = "restricted" as const;
const PUBLIC_PREFIX = "public" as const;

const headersConfig = new aws.cloudfront.ResponseHeadersPolicy(
  "CdnResponseHeadersPolicy",
  {
    corsConfig: {
      originOverride: true,
      accessControlAllowCredentials: true,
      accessControlAllowHeaders: {
        items: ["Content-Type", "Range"],
      },
      accessControlAllowMethods: {
        items: ["GET", "HEAD", "OPTIONS"],
      },
      accessControlAllowOrigins: {
        items: $dev ? [`*.${domain}`, "localhost:5173"] : [`*.${domain}`],
      },
      accessControlExposeHeaders: {
        items: ["Content-Range", "Content-Type"],
      },
      accessControlMaxAgeSec: 600,
    },
    name: `${$app.stage}CdnCORSResponseHeadersPolicy`,
  }
);

const publicKey = new aws.cloudfront.PublicKey("CdnCloudfrontPublicKey", {
  encodedKey: secret.CdnPublicKey.value,
  comment: "Public key for signed cookies",
});

const keyGroup = new aws.cloudfront.KeyGroup("CdnCloudfrontKeyGroup", {
  items: [publicKey.id],
});

const cdnRouter = new sst.aws.Router("CdnRouter", {
  domain: {
    name: `cdn.${domain}`,
  },
  transform: {
    cdn: (args) => {
      args.defaultCacheBehavior = {
        ...args.defaultCacheBehavior,
        responseHeadersPolicyId: headersConfig.id,
      };
      args.orderedCacheBehaviors = [
        {
          compress: true,
          pathPattern: `/${RESTRICTED_PREFIX}/*`,
          targetOriginId: "default",
          trustedKeyGroups: [keyGroup.id],
          viewerProtocolPolicy: "redirect-to-https",
          allowedMethods: ["GET", "HEAD", "OPTIONS"],
          cachedMethods: ["GET", "HEAD", "OPTIONS"],
          responseHeadersPolicyId: headersConfig.id,
          // @ts-expect-error not typed
          cachePolicyId: args.defaultCacheBehavior.cachePolicyId,
          // @ts-expect-error not typed
          functionAssociations: args.defaultCacheBehavior.functionAssociations,
        },
      ];
    },
  },
});

cdnRouter.routeBucket(`/${RESTRICTED_PREFIX}`, storage);
cdnRouter.routeBucket(`/${PUBLIC_PREFIX}`, storage);

export const cdn = new sst.Linkable("Cdn", {
  properties: {
    url: cdnRouter.url,
    publicKeyId: publicKey.id,
    prefixes: $output({
      public: PUBLIC_PREFIX,
      restricted: RESTRICTED_PREFIX,
    }),
  },
});
