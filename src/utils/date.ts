/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss
 * 后端返回的 datetime 格式如 2026-07-11T09:38:46.000+00:00
 */
export function formatDateTime(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
