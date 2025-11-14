import { vpc } from "./network";

export const database = new sst.aws.Postgres("Database", {
  vpc,
  version: "17.6",
  dev: {
    username: "user",
    password: "password",
    database: "zero-template",
    port: 6430,
  },
});
