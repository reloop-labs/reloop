export interface EmailStatsResponse {
	dates: string[];
	sent: number[];
	delivered: number[];
	bounced: number[];
	complaint: number[];
	opened?: number[];
	unsubscribed?: number[];
	rate: number[];
	bounceBreakdown?: {
		transient: number[];
		permanent: number[];
		undetermined: number[];
	};
}

// The stats API buckets by UTC day, so every day key, step and label below
// works in UTC. Mixing in local dates shifts or drops days west/east of UTC.

const utcMonthShort = (date: Date): string =>
	date
		.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
		.toLowerCase();

/** `YYYY-MM-DD` key for a chart day, using its UTC date. */
export const getYearMonthDayKey = (date: Date): string =>
	date.toISOString().slice(0, 10);

/**
 * Day key for a stats bucket. The stats API buckets by UTC day
 * (`YYYY-MM-DDT00:00:00.000Z`), so the key must use the UTC date; the local
 * date shifts every bucket back a day for viewers west of UTC.
 */
export const getBucketDayKey = (dStr: string): string => {
	const d = new Date(dStr);
	if (Number.isNaN(d.getTime())) return "";
	return d.toISOString().slice(0, 10);
};

/** Chart label for one UTC day, e.g. `5 nov`. */
export const formatDateLabel = (date: Date): string =>
	`${date.getUTCDate()} ${utcMonthShort(date)}`;

/**
 * Every UTC day from the range start to its end (each at 12:00 UTC), so days
 * with no sends still appear on the chart.
 */
export const generateContinuousDateList = (
	data: EmailStatsResponse | undefined,
	startDate: string,
	endDate: string,
): Date[] => {
	const resolvedEndDate = endDate ? new Date(endDate) : new Date();
	let resolvedStartDate: Date;

	if (startDate) {
		resolvedStartDate = new Date(startDate);
	} else if (data && data.dates[0] !== undefined) {
		resolvedStartDate = new Date(data.dates[0]);
	} else {
		resolvedStartDate = new Date(resolvedEndDate);
		resolvedStartDate.setUTCDate(resolvedStartDate.getUTCDate() - 14);
	}

	const datesList: Date[] = [];
	const current = new Date(resolvedStartDate);
	current.setUTCHours(12, 0, 0, 0);

	const targetEnd = new Date(resolvedEndDate);
	targetEnd.setUTCHours(12, 0, 0, 0);

	while (current <= targetEnd) {
		datesList.push(new Date(current));
		current.setUTCDate(current.getUTCDate() + 1);
	}

	return datesList;
};

/** Days per chart bar: 1 for short ranges, 3 or 6 for longer ones. */
export const getBucketSize = (numDays: number): number => {
	if (numDays >= 25) return 6;
	if (numDays >= 10) return 3;
	return 1;
};

/** Chart label for a multi-day bucket of UTC days, e.g. `3-5 nov`. */
export const formatBucketDateLabel = (
	startDate: Date,
	endDate: Date,
): string => {
	const startDay = startDate.getUTCDate();
	const endDay = endDate.getUTCDate();
	const startMonth = utcMonthShort(startDate);
	const endMonth = utcMonthShort(endDate);

	if (startMonth === endMonth) {
		if (startDay === endDay) {
			return `${startDay} ${startMonth}`;
		}
		return `${startDay}-${endDay} ${startMonth}`;
	}
	return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
};
