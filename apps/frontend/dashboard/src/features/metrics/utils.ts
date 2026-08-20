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

export const getYearMonthDayKey = (date: Date) => {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
};

export const getLocalKey = (dStr: string) => {
	const d = new Date(dStr);
	if (Number.isNaN(d.getTime())) return "";
	return getYearMonthDayKey(d);
};

export const formatDateLabel = (date: Date) => {
	return `${date.getDate()} ${date.toLocaleDateString("en-US", { month: "short" }).toLowerCase()}`;
};

export const generateContinuousDateList = (
	data: EmailStatsResponse | undefined,
	startDate: string,
	endDate: string,
) => {
	const resolvedEndDate = endDate ? new Date(endDate) : new Date();
	let resolvedStartDate: Date;

	if (startDate) {
		resolvedStartDate = new Date(startDate);
	} else if (data && data.dates[0] !== undefined) {
		resolvedStartDate = new Date(data.dates[0]);
	} else {
		resolvedStartDate = new Date(resolvedEndDate);
		resolvedStartDate.setDate(resolvedStartDate.getDate() - 14);
	}

	const datesList: Date[] = [];
	const current = new Date(resolvedStartDate);
	current.setHours(12, 0, 0, 0);

	const targetEnd = new Date(resolvedEndDate);
	targetEnd.setHours(12, 0, 0, 0);

	while (current <= targetEnd) {
		datesList.push(new Date(current));
		current.setDate(current.getDate() + 1);
	}

	return datesList;
};

export const getBucketSize = (numDays: number): number => {
	if (numDays >= 25) return 6;
	if (numDays >= 10) return 3;
	return 1;
};

export const formatBucketDateLabel = (startDate: Date, endDate: Date) => {
	const startDay = startDate.getDate();
	const endDay = endDate.getDate();
	const startMonth = startDate
		.toLocaleDateString("en-US", { month: "short" })
		.toLowerCase();
	const endMonth = endDate
		.toLocaleDateString("en-US", { month: "short" })
		.toLowerCase();

	if (startMonth === endMonth) {
		if (startDay === endDay) {
			return `${startDay} ${startMonth}`;
		}
		return `${startDay}-${endDay} ${startMonth}`;
	}
	return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
};
