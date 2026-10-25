import { describe, expect, it } from "vitest";
import { formatMoney, formatPrice, formatPricePeriod, formatRelative, parseApiDate } from "@/lib/format";

describe("money", () => {
  it("formats whole and fractional amounts", () => {
    expect(formatMoney(2000)).toBe("GHS 2,000");
    expect(formatMoney(682.5, "USD")).toBe("USD 682.50");
  });

  it("appends the price period", () => {
    expect(formatPrice(2000, "GHS", "PerMonth")).toBe("GHS 2,000 / month");
    expect(formatPrice(450, "GHS", "PerNight")).toBe("GHS 450 / night");
    expect(formatPrice(900000, "GHS", "Total")).toBe("GHS 900,000");
    expect(formatPricePeriod(null)).toBe("");
  });
});

describe("dates", () => {
  it("treats API timestamps without an offset as UTC", () => {
    expect(parseApiDate("2026-11-03T14:00:00").toISOString()).toBe("2026-11-03T14:00:00.000Z");
    expect(parseApiDate("2026-11-03T14:00:00Z").toISOString()).toBe("2026-11-03T14:00:00.000Z");
  });

  it("keeps date-only values on the same calendar day", () => {
    const date = parseApiDate("2026-12-01");
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 11, 1]);
  });

  it("describes relative time", () => {
    const now = new Date("2026-11-03T14:00:00Z");
    expect(formatRelative("2026-11-03T13:59:30Z", now)).toBe("just now");
    expect(formatRelative("2026-11-03T13:30:00Z", now)).toBe("30m");
    expect(formatRelative("2026-11-03T10:00:00Z", now)).toBe("4h");
    expect(formatRelative("2026-11-01T14:00:00Z", now)).toBe("2d");
  });
});
