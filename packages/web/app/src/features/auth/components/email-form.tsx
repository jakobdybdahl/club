import { Button, cn, IconApp, Input, Label } from "@club/ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function EmailForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation("auth");

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <form
        method="post"
        action={import.meta.env.VITE_AUTH_URL + "/email/authorize"}
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
            <h1 className="text-xl font-bold">{t("login.title")}</h1>
            <div className="text-center text-sm">{t("login.subtitle")}</div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">
                {t("label.email", { ns: "common" })}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("login.placeholder.email")}
                name="email"
                autoFocus
                required
              />
            </div>
            <input type="hidden" name="action" value="request" />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? t("login.button.submitting")
                : t("login.button.submit")}
            </Button>
          </div>
        </div>
      </form>
      <div className="text-balance text-center text-xs text-muted-foreground">
        {t("login.messages.pinCode")}
      </div>
      <div className="flex justify-between text-balance text-xs text-muted-foreground hover:[&_a]:text-primary pt-8">
        <a href="#">{t("login.links.terms")}</a>
        <a href="#">{t("login.links.privacy")}</a>
      </div>
    </div>
  );
}
