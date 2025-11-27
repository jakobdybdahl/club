import { Storage } from "@club/core/storage/index";
import { Hono } from "hono";
import { Resource } from "sst";
import { notPublic } from "./auth";

export const MediaRoute = new Hono()
  .use(notPublic)
  .post("/upload", async (c) => {
    const upload = await Storage.getUpload({
      type: "public",
      contentType: { startsWith: "image/" },
      ttl: 60 * 60 * 24 * 365, // 1 year
    });
    return c.json({
      postUploadUrl: `${Resource.Cdn.url}/${upload.key}`,
      upload: {
        url: upload.url,
        fields: upload.fields,
      },
    });
  });
