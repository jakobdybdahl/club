export * as Storage from "./index";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { Conditions } from "@aws-sdk/s3-presigned-post/dist-types/types";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { Resource } from "sst";
import { useWorkspace } from "../actor";
import { assert } from "../util/asserts";

const s3 = new S3Client();
const workspaceTagKey = "app:club" as const;

const temporaryPath = {
  "1d": "daily",
  "1w": "weekly",
  "1m": "monthly",
} as const;

type Options = {
  key?: string;
  ttl?: keyof typeof temporaryPath;
};

const getPath = (
  postfix: string,
  opts: { ttl?: keyof typeof temporaryPath } = {}
): string => {
  let path = [useWorkspace(), postfix];
  if (opts.ttl) {
    path = ["temporary", temporaryPath[opts.ttl], ...path];
  } else {
    path = [Resource.Cdn.prefixes.restricted, ...path];
  }
  return path.join("/");
};

export async function put(
  data: string | Uint8Array | Buffer,
  { key, ...opts }: Options = {}
) {
  const path = getPath(key ?? nanoid(), opts);
  await s3.send(
    new PutObjectCommand({
      Bucket: Resource.Storage.name,
      Key: path,
      Body: data,
      Tagging: `${workspaceTagKey}=${useWorkspace()}`,
    })
  );

  const url = getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: Resource.Storage.name, Key: path }),
    { expiresIn: 60 }
  );

  return url;
}

export async function remove(key: string) {
  await s3.send(
    new DeleteObjectCommand({ Bucket: Resource.Storage.name, Key: key })
  );
}

export function keyFromUrl(url: string) {
  return new URL(url).pathname.substring(1);
}

type GetUploadOptions = {
  /**
   * The id of the file
   */
  id?: string;
  /**
   * Set the type of content. The type affects the key of the S3 object
   *
   * @default 'restricted'
   */
  type?: "public" | "restricted";
  /**
   * Max allowed size of the uploaded file. Defined in bytes.
   * @example
   * // allow file up to 2 MB
   * await Storage.getUploade({ size: 2_000_000 })
   *
   * @default 6_000_000
   */
  size?: number;
  /**
   * Define the context of the file. Affects the key of the S3 object
   *
   * @example
   * // key = /restricted/<workspace-id>/billing/<id>
   * await Storage.getUpload({ context: 'billing' })
   *
   * @default 'global'
   */
  context?: string;
  /**
   * Set the content type
   * @example
   * await Storage.getUpload({ contentType: 'image/png' })
   * await Storage.getUpload({ contentType: { startsWith: 'image/' }})
   */
  contentType?: string | { startsWith: string };
  /**
   * Number in seconds before the upload URL expires.
   *
   * Note that if the upload is initiated before the expiration limit the full upload will suceed eventhough it may takes longer than the expiration of the URL.
   *
   * @default 60
   */
  uploadExpiration?: number;
  /**
   * Time-to-live in seconds. Sets the Cache-Control key on the object
   */
  ttl?: number;
};

export function restrictedKey({
  id,
  context,
}: {
  id: string;
  context: string;
}): string {
  return getPath(`${context}/${id}`);
}

export async function getUpload(opts: GetUploadOptions = {}) {
  const {
    id = nanoid(),
    type = "restricted",
    size = 6_000_000, // 6 MB
    context = "global",
    uploadExpiration = 60,
  } = opts;

  const key =
    type === "restricted"
      ? restrictedKey({ context, id })
      : `${Resource.Cdn.prefixes.public}/${id}`;

  const extraFields: Record<string, string> = {
    tagging: `<Tagging><TagSet><Tag><Key>${workspaceTagKey}</Key><Value>${useWorkspace()}</Value></Tag></TagSet></Tagging>`,
  };

  if (opts.ttl) {
    extraFields["Cache-Control"] = `max-age=${opts.ttl}`;
  }

  const conditions: Conditions[] = [
    { bucket: Resource.Storage.name },
    ["content-length-range", 10, size],
  ];

  if (opts.contentType) {
    conditions.push(
      typeof opts.contentType === "string"
        ? { "Content-Type": opts.contentType }
        : ["starts-with", "$Content-Type", opts.contentType.startsWith]
    );
  }

  const { url, fields } = await createPresignedPost(s3, {
    Bucket: Resource.Storage.name,
    Key: key,
    Expires: uploadExpiration,
    Fields: extraFields,
    Conditions: conditions,
  });

  return {
    key,
    url,
    fields,
  };
}

type GetDownloadOptions = {
  /**
   * The id of the file
   */
  id: string;
  /**
   * Set the type of content. The type affects the key of the S3 object
   *
   * @default 'restricted'
   */
  type?: "restricted";
  /**
   * Define the context of the file. Affects the key of the S3 object
   *
   * @example
   * // key = /restricted/<workspace-id>/billing/<id>
   * await Storage.getUpload({ context: 'billing' })
   *
   * @default 'global'
   */
  context?: string;
  /**
   * Override the filename of the downloaded file
   *
   */
  filename?: string;
};

export async function getDownload(opts: GetDownloadOptions) {
  const { id, type = "restricted", context = "global" } = opts;
  assert(type === "restricted", "Only download of restricted files supported.");

  const expiresIn = 60; // seconds
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: Resource.Storage.name,
      Key: restrictedKey({ context, id }),
      ResponseContentDisposition: opts.filename
        ? `attachment;filename*=UTF-8''${encodeURIComponent(opts.filename)}`
        : undefined,
    }),
    { expiresIn }
  );

  return { url, expiresIn };
}
