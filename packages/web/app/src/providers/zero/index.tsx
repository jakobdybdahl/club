import { Zero } from "@rocicorp/zero";
import {
  ZeroProvider as BaseZeroProvider,
  createUseZero,
} from "@rocicorp/zero/react";
import { type Schema, schema } from "@zero-template/zero/schema";
import { useEffect, useState } from "react";
import { mutators } from "./mutators";

export const ZeroProvider = ({ children }: { children: React.ReactNode }) => {
  const [z, setZ] = useState<Zero<Schema> | null>(null);

  useEffect(() => {
    console.log("setting zero");
    setZ(
      new Zero({
        schema: schema,
        userID: "anon",
        server: import.meta.env.VITE_ZERO_URL,
        mutators,
      })
    );
  }, []);

  useEffect(() => {
    return () => {
      void z?.close();
    };
  }, [z]);

  return z && <BaseZeroProvider zero={z}>{children}</BaseZeroProvider>;
};

export const useZero = createUseZero<Schema, typeof mutators>();
