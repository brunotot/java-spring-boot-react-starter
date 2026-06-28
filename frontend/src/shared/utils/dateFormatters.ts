export function createMonthFormatter(locale: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
  });
}

export function createMonthYearFormatter(locale: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  });
}
