import { syncedQuery } from "@rocicorp/zero";
import z from "zod";
import { builder } from "./schema";

export const messageList = syncedQuery("messageList", z.any(), () =>
  builder.message.orderBy("timeCreated", "desc").limit(20)
);
