import dayjs from "dayjs";

/**
 * Formats a timestamp matching mockups:
 * - If today: "Today, 10:44 AM"
 * - If yesterday: "Yesterday, 4:00 PM"
 * - Otherwise: "Mon, 2:10 PM"
 */
export const formatMessageTimestamp = (dateStr: string): string => {
	const date = dayjs(dateStr);
	const now = dayjs();

	if (date.isSame(now, "day")) {
		return `Today, ${date.format("h:mm A")}`;
	}

	if (date.isSame(now.subtract(1, "day"), "day")) {
		return `Yesterday, ${date.format("h:mm A")}`;
	}

	return date.format("ddd, h:mm A");
};

/** Zero-style compact time: "5:19 PM" today, "Jul 07" otherwise */
export const formatZeroMessageTime = (dateStr: string): string => {
	const date = dayjs(dateStr);
	const now = dayjs();

	if (date.isSame(now, "day")) {
		return date.format("h:mm A");
	}

	if (date.isSame(now, "year")) {
		return date.format("MMM DD");
	}

	return date.format("MMM DD, YYYY");
};
