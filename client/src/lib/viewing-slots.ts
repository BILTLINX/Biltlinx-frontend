export function slotStart(time: string): { hours: number; minutes: number } {
  const match = /^(\d{1,2}):(\d{2})\s*(am|pm)/i.exec(time.trim());
  if (!match) return { hours: 9, minutes: 0 };
  let hours = Number(match[1]) % 12;
  if (match[3].toLowerCase() === "pm") hours += 12;
  return { hours, minutes: Number(match[2]) };
}

export function slotToIso(date: string, time: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const { hours, minutes } = slotStart(time);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}
