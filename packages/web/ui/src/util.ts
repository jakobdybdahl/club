import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type OS = "windows" | "macos" | "unknown";

export const getOS = (): OS => {
  if (window.navigator.userAgent.includes("Mac")) return "macos";
  if (window.navigator.userAgent.includes("Win")) return "windows";
  return "unknown";
};
