import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useClub } from "./club/context";

type ErrorScreenProps = {
  inset?: "none" | "header" | "header-tabs";
  message?: string;
  header?: boolean;
};

export function NotFound(props: ErrorScreenProps) {
  const { t } = useTranslation();
  const ws = useClub({ safe: false });
  const base = useMemo(() => {
    if (!ws) return "";
    return ws.slug;
  }, [ws?.slug]);

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col gap-4">
        <div className="text-lg">
          {props.message ?? t("error.notFound.defaultTitle")}
        </div>
        <Link to={"/" + base} className="underline underline-offset-4">
          {t("error.notFound.goBack")}
        </Link>
      </div>
    </div>
  );
}

export function NotAllowed(props: ErrorScreenProps) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col gap-4">
        <div className="text-lg">
          {props.message ?? t("error.notAllowed.defaultTitle")}
        </div>
        <div className="text-sm">
          {t("error.notAllowed.message1")}
          <Link to="/" className="underline underline-offset-4">
            {t("error.notAllowed.message2")}
          </Link>
        </div>
      </div>
    </div>
  );
}
