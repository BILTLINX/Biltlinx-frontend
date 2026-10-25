const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const PERIOD_LABELS: Record<string, string> = {
  Total: "",
  PerNight: "night",
  PerDay: "day",
  PerWeek: "week",
  PerMonth: "month",
  PerYear: "year",
  PerJob: "job",
  PerHour: "hour",
  PerSqm: "sqm",
  PerUnit: "unit",
};

export function formatMoney(amount: number, currency = "GHS") {
  const hasFraction = !Number.isInteger(amount);
  return `${currency} ${amount.toLocaleString("en-GH", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPricePeriod(period: string | null | undefined) {
  if (!period) return "";
  const label = PERIOD_LABELS[period];
  return label ? `/ ${label}` : "";
}

export function formatPrice(amount: number, currency = "GHS", period?: string | null) {
  const suffix = formatPricePeriod(period);
  return suffix ? `${formatMoney(amount, currency)} ${suffix}` : formatMoney(amount, currency);
}

export function parseApiDate(value: string): Date {
  if (DATE_ONLY.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(/(Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`);
}

export function formatDate(value: string) {
  return parseApiDate(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(value: string) {
  return parseApiDate(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(value: string, now: Date = new Date()) {
  const seconds = Math.round((now.getTime() - parseApiDate(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return formatDate(value);
}
