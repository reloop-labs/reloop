import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.extend(duration);

// Customize the relative time locale for better formatting
dayjs.updateLocale("en", {
	relativeTime: {
		future: "in %s",
		past: "%s ago",
		s: "a few seconds",
		m: "1 min",
		mm: "%d min",
		h: "1 hour",
		hh: "%d hours",
		d: "1 day",
		dd: "%d days",
		M: "1 month",
		MM: "%d months",
		y: "1 year",
		yy: "%d years",
	},
});

/**
 * Format a date string or Date object to relative time (e.g., "20 min ago", "10 days ago", "2 months ago")
 * @param date - The date to format (string, Date, or dayjs object)
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (
	date: string | Date | dayjs.Dayjs,
): string => {
	return dayjs(date).fromNow();
};

/**
 * Format a date string or Date object to relative time with custom options
 * @param date - The date to format (string, Date, or dayjs object)
 * @param options - Options for formatting
 * @returns Formatted relative time string
 */
export const formatRelativeTimeWithOptions = (
	date: string | Date | dayjs.Dayjs,
	options: {
		/** Whether to show "just now" for very recent times */
		showJustNow?: boolean;
		/** Threshold in seconds for "just now" (default: 30) */
		justNowThreshold?: number;
		/** Whether to show "today" for same day */
		showToday?: boolean;
	} = {},
): string => {
	const {
		showJustNow = true,
		justNowThreshold = 30,
		showToday = false,
	} = options;

	const now = dayjs();
	const targetDate = dayjs(date);
	const diffInSeconds = now.diff(targetDate, "second");

	// Show "just now" for very recent times
	if (showJustNow && diffInSeconds < justNowThreshold) {
		return "just now";
	}

	// Show "today" for same day
	if (showToday && targetDate.isSame(now, "day")) {
		return "today";
	}

	return targetDate.fromNow();
};

/**
 * Get a more human-readable relative time format
 * @param date - The date to format
 * @returns Human-readable relative time string
 */
export const formatHumanRelativeTime = (
	date: string | Date | dayjs.Dayjs,
): string => {
	const targetDate = dayjs(date);
	const now = dayjs();
	const diffInMinutes = now.diff(targetDate, "minute");
	const diffInHours = now.diff(targetDate, "hour");
	const diffInDays = now.diff(targetDate, "day");
	const diffInMonths = now.diff(targetDate, "month");
	const diffInYears = now.diff(targetDate, "year");

	if (diffInMinutes < 1) {
		return "just now";
	}
	if (diffInMinutes < 60) {
		return `${diffInMinutes} min ago`;
	}
	if (diffInHours < 24) {
		return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
	}
	if (diffInDays < 30) {
		return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
	}
	if (diffInMonths < 12) {
		return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
	}
	return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
};

/**
 * Check if a date is within a certain time range
 * @param date - The date to check
 * @param range - The time range (e.g., "1 hour", "2 days", "1 week")
 * @returns Whether the date is within the range
 */
export const isWithinTimeRange = (
	date: string | Date | dayjs.Dayjs,
	range: string,
): boolean => {
	const targetDate = dayjs(date);
	const now = dayjs();
	const rangeDate = now.subtract(dayjs.duration(range));
	return targetDate.isAfter(rangeDate);
};
