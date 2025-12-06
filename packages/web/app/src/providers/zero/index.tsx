import { schema } from "@club/zero/schema";
import { ZeroProvider as BaseZeroProvider } from "@rocicorp/zero/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "../account";
import { useAuth } from "../auth";
import { mutators } from "./mutators";

const ANONYMOUS_USER_ID = "anon";

export const ZeroProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  const { current: account } = useAccount();

  const userId = auth.subject?.id ?? ANONYMOUS_USER_ID;

  const context = useMemo(() => {
    return account
      ? {
          type: "account",
          properties: { accountId: account.id, email: account.email },
        }
      : { type: "public" };
  }, [account?.id]);

  const [isInitialized, setIsInitialized] = useState(false);
  const token = useRef<string>(null);
  useEffect(() => {
    const get = async () => {
      const access = await auth.access();
      token.current = access ?? null;
      setIsInitialized(true);
    };
    void get();
  }, [userId]);

  useEffect(() => console.log("zero token", token.current), [token.current]);
  useEffect(() => console.log("zero context", context), [context]);

  return (
    isInitialized && (
      <BaseZeroProvider
        {...{
          schema,
          userID: userId,
          auth: token.current,
          mutators,
          context,
          server: import.meta.env.VITE_ZERO_URL,
        }}
      >
        {children}
      </BaseZeroProvider>
    )
  );
};
