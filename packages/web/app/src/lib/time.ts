import dayjs from "dayjs";

export function getRelativeFromNow(
  date: string | number,
  opts: { locale?: string } = {}
) {
  const asDate = dayjs(date);
  if (!asDate.isValid()) {
    return null;
  }
  const now = dayjs();
  return opts.locale ? now.locale(opts.locale).to(asDate) : now.to(asDate);
}

export function getDateStringWithTime(
  date: string | number,
  opts: { locale?: string } = {}
) {
  const parsed = dayjs(date).toDate();
  return new Intl.DateTimeFormat(opts.locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    minute: "2-digit",
    hour: "2-digit",
  }).format(parsed);
}
