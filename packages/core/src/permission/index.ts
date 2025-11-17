import { z } from "zod";

export const ALL_PERMISSIONS = [
  "admin",
  "add:user",
  "update:user",
  "delete:user",
] as const;

export const PermissionSchema = z.enum(ALL_PERMISSIONS);

export type Permission = (typeof ALL_PERMISSIONS)[number];
