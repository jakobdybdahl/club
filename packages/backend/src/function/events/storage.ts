import { withActor } from "@club/core/actor";
import { File } from "@club/core/file/index";
import { Resource } from "sst";
import z, { ZodType } from "zod";

export const parseJson = <T extends ZodType>(schema: T) =>
  z
    .string()
    .transform((str, ctx) => {
      try {
        return JSON.parse(str);
      } catch (error) {
        ctx.addIssue({
          code: "custom",
          message: `Invalid JSON - ${(error as Error).message}`,
          fatal: true,
        });
      }
    })
    .pipe(schema);

export const stringifyJson = <TInputSchema extends ZodType>(
  inputSchema: TInputSchema
) => {
  return inputSchema.transform((s) => JSON.stringify(s));
};

const eventSchema = z.object({
  Records: z.array(
    z.object({
      body: parseJson(
        z.object({
          Records: z.array(
            z.object({
              eventVersion: z.literal("2.1"),
              eventSource: z.literal("aws:s3"),
              eventTime: z.string(),
              eventName: z.string(),
              s3: z.object({
                s3SchemaVersion: z.string(),
                configurationId: z.string(),
                bucket: z.object({
                  name: z.string(),
                  arn: z.string(),
                }),
                object: z.object({
                  key: z.string(),
                  size: z.number().optional(),
                  eTag: z.string().optional(),
                  sequencer: z.string(),
                }),
              }),
            })
          ),
        })
      ),
    })
  ),
});

const OBJECT_CREATED_PUT = "ObjectCreated:Put" as const;
const OBJECT_CREATED_POST = "ObjectCreated:Post" as const;
const OBJECT_DELETED = "ObjectRemoved:Delete" as const;

export const handler = async (raw: unknown) => {
  const parseResult = eventSchema.safeParse(raw);
  if (!parseResult.success) {
    console.error("Failed to parse S3 event");
    console.log(JSON.stringify(parseResult.error, null, 2));
    return;
  }

  const event = parseResult.data;
  const records = event.Records.flatMap((record) => record.body.Records);

  for (const record of records) {
    if (
      record.eventName !== OBJECT_CREATED_PUT &&
      record.eventName !== OBJECT_CREATED_POST &&
      record.eventName !== OBJECT_DELETED
    ) {
      continue;
    }

    const key = record.s3.object.key;
    const splits = key.split("/");

    // ignore non-restricted files (they have no workspace-id)
    if (splits[0] !== Resource.Cdn.prefixes.restricted) {
      continue;
    }

    const wsParseResult = z.nanoid().safeParse(splits[1]);
    if (!wsParseResult.success) {
      console.error("Invalid workspace id");
      continue;
    }
    const ws = wsParseResult.data;

    await withActor(
      { type: "system", properties: { workspaceId: ws } },
      async () => {
        const id = splits.at(-1);
        if (!id) return;

        const file = await File.fromId({ id });
        if (!file) return;

        switch (record.eventName) {
          case OBJECT_CREATED_POST:
          case OBJECT_CREATED_PUT: {
            await File.setState({ id: file.id, state: "uploaded" });
            return;
          }
          case OBJECT_DELETED: {
            await File.onRemoved({ id: file.id });
            return;
          }
        }
      }
    );
  }
};
