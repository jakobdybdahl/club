import { z } from "zod";

export const ALL_PERMISSIONS = [
  /**
   * WORKSPACE ADMIN
   */
  "admin",
] as const;

export const PermissionSchema = z.enum(ALL_PERMISSIONS);

export type Permission = (typeof ALL_PERMISSIONS)[number];
