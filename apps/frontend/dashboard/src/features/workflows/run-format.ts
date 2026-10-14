import dayjs from "dayjs";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Compact elapsed time: "10s", "4min", "2h 5m", "3d 4h". */
export function formatDuration(ms: number): string {
	if (ms < MINUTE) return `${Math.max(0, Math.round(ms / SECOND))}s`;
	if (ms < HOUR) return `${Math.round(ms / MINUTE)}min`;
	if (ms < DAY) {
		const h = Math.floor(ms / HOUR);
		const m = Math.round((ms % HOUR) / MINUTE);
		return m ? `${h}h ${m}m` : `${h}h`;
	}
	const d = Math.floor(ms / DAY);
	const h = Math.round((ms % DAY) / HOUR);
	return h ? `${d}d ${h}h` : `${d}d`;
}

/** "10s ago", "4min ago", "3d ago". */
export function formatAgo(iso: string, now = Date.now()): string {
	const ms = now - new Date(iso).getTime();
	if (ms < 5 * SECOND) return "just now";
	return `${formatDuration(ms).split(" ")[0]} ago`;
}

/** "Today at 11:38 AM", "Yesterday at 9:02 PM", "Mar 4 at 9:02 PM". */
export function formatMoment(iso: string): string {
	const at = dayjs(iso);
	const time = at.format("h:mm A");
	if (at.isSame(dayjs(), "day")) return `Today at ${time}`;
	if (at.isSame(dayjs().subtract(1, "day"), "day"))
		return `Yesterday at ${time}`;
	if (at.isSame(dayjs().add(1, "day"), "day")) return `Tomorrow at ${time}`;
	return at.isSame(dayjs(), "year")
		? `${at.format("MMM D")} at ${time}`
		: `${at.format("MMM D, YYYY")} at ${time}`;
}

/** Live countdown: "45s", "4m 32s", "3h 12m", "2d 4h". */
export function formatCountdown(ms: number): string {
	const total = Math.max(0, Math.ceil(ms / SECOND));
	const d = Math.floor(total / 86400);
	const h = Math.floor((total % 86400) / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	if (d) return h ? `${d}d ${h}h` : `${d}d`;
	if (h) return m ? `${h}h ${m}m` : `${h}h`;
	if (m) return `${m}m ${s}s`;
	return `${s}s`;
}
