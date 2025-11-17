import { Account } from "@club/core/account/index";
import { assertActor } from "@club/core/actor";
import { Hono } from "hono";
import { notPublic } from "./auth";

export const AccountRoute = new Hono().use(notPublic).get("/", async (c) => {
  const actor = assertActor("account");
  return c.json({
    id: actor.properties.accountId,
    email: actor.properties.email,
    clubs: await Account.clubs(),
  });
});
