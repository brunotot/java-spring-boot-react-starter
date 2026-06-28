export function createCurrencyFormatter(locale: string, currency = "EUR"): Intl.NumberFormat {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}

export function formatCompactCurrency(value: number, currencyCode = "EUR"): string {
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M ${currencyCode}`;
  }

  if (absValue >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k ${currencyCode}`;
  }

  return `${Math.round(value)} ${currencyCode}`;
}
