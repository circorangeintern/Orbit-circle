const CURRENCY_SYMBOLS: Record<string, string> = { NGN: "₦", USD: "$" };

function formatMoney(amount: number, symbol: string): string {
  if (amount >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (amount >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(0)}K`;
  }
  return `${symbol}${amount}`;
}

export function formatSalaryRange(
  min: number | null,
  max: number | null,
  currency: string
): string {
  if (min == null || max == null) return "Not available";
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  return `${formatMoney(min, symbol)} - ${formatMoney(max, symbol)}`;
}