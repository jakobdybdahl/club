import { type Schema, schema } from "@club/zero/schema";
import { Zero } from "@rocicorp/zero";
import {
  ZeroProvider as BaseZeroProvider,
  createUseZero,
} from "@rocicorp/zero/react";
import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { createMutators } from "./mutators";

export const ZeroProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  const [z, setZ] = useState<Zero<Schema> | null>(null);

  useEffect(() => {
    console.log("setting zero");
    const userId = auth.subject?.id ?? "anon";
    if (z?.userID === userId) return;
    setZ(
      new Zero({
        schema: schema,
        auth: () => auth.access(),
        userID: userId,
        server: import.meta.env.VITE_ZERO_URL,
        mutators: createMutators(),
      })
    );
  }, [auth.subject?.id]);

  useEffect(() => {
    return () => {
      void z?.close();
    };
  }, [z]);

  return z && <BaseZeroProvider zero={z}>{children}</BaseZeroProvider>;
};

export const useZero = createUseZero<
  Schema,
  ReturnType<typeof createMutators>
>();
