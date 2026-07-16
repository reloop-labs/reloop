/** Compact relative time for tables (e.g. "20 min ago"). */
export function formatRelativeTime(date: string | Date): string {
	const target = new Date(date).getTime();
	if (Number.isNaN(target)) return "—";

	const diffSec = Math.max(0, Math.floor((Date.now() - target) / 1000));
	if (diffSec < 30) return "just now";
	if (diffSec < 60) return `${diffSec}s ago`;

	const diffMin = Math.floor(diffSec / 60);
	if (diffMin < 60) return `${diffMin} min ago`;

	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;

	const diffDay = Math.floor(diffHr / 24);
	if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;

	const diffMonth = Math.floor(diffDay / 30);
	if (diffMonth < 12)
		return `${diffMonth} month${diffMonth === 1 ? "" : "s"} ago`;

	const diffYear = Math.floor(diffMonth / 12);
	return `${diffYear} year${diffYear === 1 ? "" : "s"} ago`;
}
