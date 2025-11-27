import {
  ForbiddenError,
  VersionMismatchError,
  VisibleError,
} from "@club/core/util/error";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { AccountRoute } from "../api/account";
import { auth } from "../api/auth";
import { MediaRoute } from "../api/media";
import { ZeroRoute } from "../api/sync";

export const api = new Hono()
  .use((c, next) => {
    c.header("Cache-Control", "no-store");
    return next();
  })
  .use(auth)
  .onError((error, c) => {
    if (error instanceof ForbiddenError) {
      return c.json(
        {
          message: error.message,
        },
        403
      );
    }
    if (error instanceof VersionMismatchError) {
      return c.json(
        {
          message: error.message,
        },
        409
      );
    }
    if (error instanceof VisibleError) {
      const { code, message, detail } = error;
      return c.json(
        {
          code,
          message,
          detail,
        },
        400
      );
    }
    if (error instanceof HTTPException) {
      return c.json(
        {
          message: error.message,
        },
        error.status
      );
    }
    console.error(error);
    if (error instanceof ZodError) {
      return c.json(
        {
          code: "validation_error",
          message: error.message,
          detail: {
            issues: error.issues.map((issue) => ({
              code: issue.code,
              message: issue.message,
            })),
          },
        },
        400
      );
    }
    return c.json(
      {
        code: "internal",
        message: "Internal server error",
      },
      500
    );
  })
  .get("/", (c) => c.text("ok"))
  .route("/account", AccountRoute)
  .route("/sync", ZeroRoute)
  .route("/media", MediaRoute);

export const handler = handle(api);

export type ApiType = typeof api;
