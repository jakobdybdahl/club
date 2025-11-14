import { ReadonlyJSONValue, withValidation } from "@rocicorp/zero";
import { handleGetQueriesRequest } from "@rocicorp/zero/server";
import { messageList } from "@zero-template/zero/queries";
import { schema } from "@zero-template/zero/schema";
import { Hono } from "hono";
import { mutators, processor } from "../zero";

export const ZeroRoute = new Hono()
  .post("/mutate", async (c) => {
    const body = await c.req.json();
    console.log(JSON.stringify(body, null, 2));
    const response = await processor.process(mutators, c.req.query(), body);
    console.log(JSON.stringify(response, null, 2));
    return c.json(response);
  })
  .post("/get-queries", async (c) => {
    const res = await handleGetQueriesRequest(getQuery, schema, c.req.raw);
    console.log(JSON.stringify(res, null, 2));
    return c.json(res);
  });

const validated = Object.fromEntries(
  [messageList].map((q) => [q.queryName, withValidation(q)])
);

function getQuery(name: string, args: readonly ReadonlyJSONValue[]) {
  const q = validated[name];
  if (!q) {
    throw new Error(`No such query: ${name}`);
  }
  return {
    query: q(undefined, ...args),
  };
}
