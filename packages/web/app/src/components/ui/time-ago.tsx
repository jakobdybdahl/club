import { getDateStringWithTime, getRelativeFromNow } from "@/lib/time";
import { useLocale } from "@/providers/locale";
import { useEffect, useMemo, useState } from "react";

export function TimeAgo({
  children: date,
  as,
  ...props
}: Omit<React.ComponentProps<"div">, "children" | "title"> & {
  children: string | number;
  as?: "div" | "span";
}) {
  const Comp = as ?? "div";
  const { locale } = useLocale();
  const [relativeTime, setRelativeTime] = useState(
    getRelativeFromNow(date, { locale })
  );

  const pretty = useMemo(
    () => getDateStringWithTime(date, { locale }),
    [date, locale]
  );

  useEffect(
    () => setRelativeTime(getRelativeFromNow(date, { locale })),
    [date, locale]
  );

  useEffect(() => {
    const interval = setInterval(
      () => setRelativeTime(getRelativeFromNow(date, { locale })),
      60_000
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <Comp title={pretty} {...props}>
      {relativeTime}
    </Comp>
  );
}
