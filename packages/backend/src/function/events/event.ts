import { withActor } from "@club/core/actor";
import { User } from "@club/core/user/index";
import { bus } from "sst/aws/bus";

export const handler = bus.subscriber(
  [User.Events.UserCreated],
  async (evt) => {
    console.log(JSON.stringify(evt));
    const now = Date.now();
    withActor(evt.metadata.actor, async () => {
      switch (evt.type) {
        case User.Events.UserCreated.type:
          await User.sendEmailInvite({ id: evt.properties.userId });
          break;
      }
    });
    const duration = Date.now() - now;
    console.log(
      JSON.stringify({
        _aws: {
          Timestamp: new Date().getTime(),
          CloudWatchMetrics: [
            {
              Namespace: "club",
              Dimensions: [["type"]],
              Metrics: [
                {
                  Name: "event_duration",
                  Unit: "Milliseconds",
                },
              ],
            },
          ],
        },
        type: evt.type,
        event_duration: duration,
      })
    );
  }
);
