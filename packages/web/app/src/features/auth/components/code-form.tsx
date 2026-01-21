import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  cn,
  IconApp,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
  Spinner,
} from "../../../../../ui-1/src";

export const CodeForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => {
  const { t } = useTranslation("auth");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useRef<React.ComponentRef<"form">>(null);

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <form
        ref={form}
        method="post"
        action={`${import.meta.env.VITE_AUTH_URL}/email/authorize`}
        onSubmit={() => setIsSubmitting(true)}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <IconApp size={24} />
              <span className="sr-only">Club</span>
            </a>
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-xl font-bold">{t("code.title")}</h1>
              <div className="text-center text-sm text-muted-foreground">
                {t("code.subtitle")}
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center relative">
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              onComplete={() => {
                form.current?.submit();
              }}
              name="code"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {isSubmitting && (
              <Spinner variant="primary" className="absolute -bottom-12" />
            )}
          </div>
          <input type="hidden" name="action" value="verify" />
        </div>
      </form>
    </div>
  );
};
