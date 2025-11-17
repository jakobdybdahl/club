import { bus } from "sst/aws/bus";

export const handler = bus.subscriber([], async (evt) => {
  console.log("TODO");
});
