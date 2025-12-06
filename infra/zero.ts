import { readFileSync } from "fs";
import { api } from "./api";
import { cluster } from "./cluster";
import { database } from "./database";
import { domain } from "./dns";
import { storage } from "./storage";

const conn = $interpolate`postgresql://${database.username}:${database.password}@${database.host}:${database.port}/${database.database}`;

const tag = JSON.parse(
  readFileSync(
    "./packages/zero/node_modules/@rocicorp/zero/package.json"
  ).toString()
).version.replace("+", "-");

const image = `registry.hub.docker.com/rocicorp/zero:${tag}`;

const zeroEnv = {
  ZERO_LOG_LEVEL: "info",
  ZERO_LITESTREAM_LOG_LEVEL: "info",
  ZERO_UPSTREAM_DB: conn,
  ZERO_CVR_DB: conn,
  ZERO_CHANGE_DB: conn,
  ZERO_REPLICA_FILE: "sync-replica.db",
  ZERO_APP_ID: $app.stage,
  ZERO_ADMIN_PASSWORD: "somepassword",
  // ZERO_AUTH_JWKS_URL: $interpolate`${auth.url}/.well-known/jwks.json`,
  // ZERO_INITIAL_SYNC_ROW_BATCH_SIZE: "30000",
  ZERO_MUTATE_URL: $interpolate`${api.url}/sync/mutate`,
  ZERO_QUERY_URL: $interpolate`${api.url}/sync/query`,
  ...($dev
    ? {}
    : {
        ZERO_LITESTREAM_BACKUP_URL: $interpolate`s3://${storage.name}/zero/1`,
      }),
};

const replication = !$dev
  ? new sst.aws.Service("ZeroReplication", {
      cluster,
      architecture: "arm64",
      image,
      link: [database, storage],
      wait: true,
      health: {
        command: ["CMD-SHELL", "curl -f http://localhost:4849/ || exit 1"],
        interval: "5 seconds",
        retries: 3,
        startPeriod: "300 seconds",
      },
      environment: {
        ...zeroEnv,
        ZERO_CHANGE_MAX_CONNS: "3",
        ZERO_NUM_SYNC_WORKERS: "0",
      },
      loadBalancer: {
        public: false,
        rules: [
          {
            listen: "80/http",
            forward: "4849/http",
          },
        ],
      },
      transform: {
        service: {
          healthCheckGracePeriodSeconds: 900000,
        },
        loadBalancer: {
          idleTimeout: 3600,
        },
        target: {
          healthCheck: {
            enabled: true,
            path: "/keepalive",
            protocol: "HTTP",
            interval: 5,
            healthyThreshold: 2,
            timeout: 3,
          },
        },
      },
    })
  : undefined;

export const zero = new sst.aws.Service("Zero", {
  cluster,
  ...($app.stage === "production"
    ? {
        cpu: "1 vCPU",
        memory: "2 GB",
      }
    : {}),
  architecture: "arm64",
  image,
  link: [database, storage],
  health: {
    command: ["CMD-SHELL", "curl -f http://localhost:4848/ || exit 1"],
    interval: "5 seconds",
    retries: 3,
    startPeriod: "300 seconds",
  },
  environment: {
    ...zeroEnv,
    ...($dev
      ? {
          ZERO_NUM_SYNC_WORKERS: "1",
        }
      : {
          ZERO_CHANGE_STREAMER_URI: replication!.url.apply((val) =>
            val.replace("http://", "ws://")
          ),
          ZERO_UPSTREAM_MAX_CONNS: "10",
          ZERO_CVR_MAX_CONNS: "10",
        }),
  },
  logging: {
    retention: "1 month",
  },
  loadBalancer: {
    domain: "sync." + domain,
    rules: [
      { listen: "443/https", forward: "4848/http" },
      { listen: "80/http", forward: "4848/http" },
    ],
  },
  transform: {
    service: {
      healthCheckGracePeriodSeconds: 900000,
    },
    target: {
      healthCheck: {
        enabled: true,
        path: "/keepalive",
        protocol: "HTTP",
        interval: 5,
        healthyThreshold: 2,
        timeout: 3,
      },
      stickiness: {
        enabled: true,
        type: "lb_cookie",
        cookieDuration: 120,
      },
    },
  },
  dev: {
    command: "bun dev",
    directory: "packages/zero",
    url: "http://localhost:4848",
  },
});
