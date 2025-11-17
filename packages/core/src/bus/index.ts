import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { Resource } from "sst";
import { event } from "sst/event";

const eb = new EventBridgeClient({});

export module bus {
  export async function publish<Definition extends event.Definition>(
    name: string | { name: string },
    def: Definition | string,
    properties: Definition["$input"],
    options?: {
      metadata?: Definition["$metadata"];
      aws?: any;
    }
  ): Promise<any> {
    const evt =
      typeof def === "string"
        ? { type: def, properties, metadata: options?.metadata || {} }
        : await def.create(properties, options?.metadata);

    await eb.send(
      new PutEventsCommand({
        Entries: [
          {
            Source: [Resource.App.name, Resource.App.stage].join("."),
            EventBusName: typeof name === "string" ? name : name.name,
            DetailType: evt.type,
            Detail: JSON.stringify({
              metadata: evt.metadata,
              properties: evt.properties,
            }),
          },
        ],
      })
    );
  }
}
