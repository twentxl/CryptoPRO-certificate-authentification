export function parseRuDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ` +
         `${d.getHours()}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function toTimeMs(s?: string): number | null {
  if (!s) return null;
  const d = new Date(s);
  const t = d.getTime();
  return Number.isNaN(t) ? null : t;
}