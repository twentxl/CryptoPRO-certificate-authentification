export function parseRuDateTime(s: string) {
  const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})[ T](\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return null;

  const [, dd, mm, yyyy, HH, MM, SS] = m.map(Number);
  const d = new Date(yyyy, mm - 1, dd, HH, MM, SS);

  if (
    d.getFullYear() !== yyyy ||
    d.getMonth() !== (mm - 1) ||
    d.getDate() !== dd ||
    d.getHours() !== HH ||
    d.getMinutes() !== MM ||
    d.getSeconds() !== SS
  ) return null;

  return d;
}