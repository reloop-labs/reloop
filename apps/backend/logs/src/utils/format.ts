export function escapeString(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

export function safeJsonParse(value: string, fallback: unknown): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function formatClickHouseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  return `${dateStr.replace(" ", "T")}Z`;
}

export function toClickHouseDate(date: Date | string): string {
  const iso = typeof date === "string" ? date : date.toISOString();
  return iso.replace("Z", "").replace("T", " ");
}
