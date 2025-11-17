import { KebabCase } from "../util/types";

export const FILE_STATES = ["pending-upload", "uploaded", "removing"] as const;
export type FileState = (typeof FILE_STATES)[number];
export const FileState: {
  [State in FileState as KebabCase<State>]: State;
} = {
  PendingUpload: "pending-upload",
  Uploaded: "uploaded",
  Removing: "removing",
};
