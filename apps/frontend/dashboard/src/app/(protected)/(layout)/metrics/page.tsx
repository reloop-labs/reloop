"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import useSWR from "swr";
import { DateRangeFilter } from "../emails/components/date-range-filter";
import { DomainSelector } from "../emails/components/domain-selector";
import { DeliverabilityChart } from "./components/deliverability-chart";
import { RateChart } from "./components/rate-chart";

import {
	formatDateLabel,
	generateContinuousDateList,
	getLocalKey,
	getYearMonthDayKey,
} from "./utils";

interface EmailStatsResponse {
	dates: string[];
	sent: number[];
	delivered: number[];
	bounced: number[];
	complaint: number[];
	rate: number[];
	bounceBreakdown: {
		transient: number[];
		permanent: number[];
		undetermined: number[];
	};
}

const MetricsPage = () => {
	const { activeOrganization } = useUserOrganization();
	const [selectedDomain, setSelectedDomain] = useQueryState(
		"domain",
		parseAsString.withDefault(""),
	);
	const [startDate, setStartDate] = useQueryState(
		"start_date",
		parseAsString.withDefault(""),
	);
	const [endDate, setEndDate] = useQueryState(
		"end_date",
		parseAsString.withDefault(""),
	);
	const [datePreset, setDatePreset] = useQueryState(
		"preset",
		parseAsString.withDefault(""),
	);

	const handleDateChange = (
		newStartDate: string | null,
		newEndDate: string | null,
		preset: string | null,
	) => {
		setStartDate(newStartDate || "");
		setEndDate(newEndDate || "");
		setDatePreset(preset || "");
	};

	const buildApiUrl = () => {
		if (!activeOrganization?.id) return null;
		const params = new URLSearchParams();
		if (startDate) params.set("start_date", startDate);
		if (endDate) params.set("end_date", endDate);
		if (selectedDomain && selectedDomain !== "all")
			params.set("domain_id", selectedDomain);
		return `/api/logs/v1/emails/stats?${params.toString()}`;
	};

	const { data } = useSWR<EmailStatsResponse>(buildApiUrl());

	const stats = useMemo(() => {
		if (!data) return null;

		const totalSent = data.sent.reduce((a, b) => a + b, 0);
		const _totalBounced = data.bounced.reduce((a, b) => a + b, 0);
		const totalComplaint = data.complaint.reduce((a, b) => a + b, 0);

		const totalPermanent = data.bounceBreakdown.permanent.reduce(
			(a, b) => a + b,
			0,
		);
		const totalTransient = data.bounceBreakdown.transient.reduce(
			(a, b) => a + b,
			0,
		);
		const totalUndetermined = data.bounceBreakdown.undetermined.reduce(
			(a, b) => a + b,
			0,
		);

		const bounceRate =
			totalSent > 0
				? ((totalPermanent + totalTransient + totalUndetermined) / totalSent) *
					100
				: 0;
		const complaintRate =
			totalSent > 0 ? (totalComplaint / totalSent) * 100 : 0;

		const statsMap = new Map<
			string,
			{
				sent: number;
				transient: number;
				permanent: number;
				undetermined: number;
				complaint: number;
			}
		>();

		for (let i = 0; i < data.dates.length; i++) {
			const dateStr = data.dates[i];
			if (!dateStr) continue;
			const key = getLocalKey(dateStr);
			if (key) {
				statsMap.set(key, {
					sent: data.sent[i] ?? 0,
					transient: data.bounceBreakdown.transient[i] ?? 0,
					permanent: data.bounceBreakdown.permanent[i] ?? 0,
					undetermined: data.bounceBreakdown.undetermined[i] ?? 0,
					complaint: data.complaint[i] ?? 0,
				});
			}
		}

		const datesList = generateContinuousDateList(data, startDate, endDate);

		const chartData = datesList.map((date) => {
			const key = getYearMonthDayKey(date);
			const formattedDate = formatDateLabel(date);
			const existing = statsMap.get(key);

			const bounceCount =
				(existing?.transient ?? 0) +
				(existing?.permanent ?? 0) +
				(existing?.undetermined ?? 0);
			const complaintCount = existing?.complaint ?? 0;

			return {
				date: formattedDate,
				bounceRate: totalSent > 0 ? (bounceCount / totalSent) * 100 : 0,
				complaintRate: totalSent > 0 ? (complaintCount / totalSent) * 100 : 0,
			};
		});

		const totalBouncedSum = totalPermanent + totalTransient + totalUndetermined;

		return {
			bounceRate: Math.round(bounceRate * 100) / 100,
			complaintRate: Math.round(complaintRate * 100) / 100,
			chartData,
			breakdown: {
				bounce: [
					{
						label: "Transient",
						color: "#F04438",
						count: totalTransient,
						percentage:
							totalBouncedSum > 0
								? Math.round((totalTransient / totalBouncedSum) * 100 * 100) /
									100
								: 0,
					},
					{
						label: "Permanent",
						color: "#F04438",
						count: totalPermanent,
						percentage:
							totalBouncedSum > 0
								? Math.round((totalPermanent / totalBouncedSum) * 100 * 100) /
									100
								: 0,
					},
					{
						label: "Undetermined",
						color: "#F04438",
						count: totalUndetermined,
						percentage:
							totalBouncedSum > 0
								? Math.round(
										(totalUndetermined / totalBouncedSum) * 100 * 100,
									) / 100
								: 0,
					},
				],
				complaint: [
					{
						label: "Complained",
						color: "#FDB022",
						count: totalComplaint,
						percentage:
							totalComplaint > 0
								? Math.round((totalComplaint / totalComplaint) * 100 * 100) /
									100
								: 0,
					},
				],
			},
		};
	}, [data, startDate, endDate]);

	return (
		<div className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
			<div className="flex items-center justify-between pb-10">
				<div className="flex flex-col gap-1">
					<h1 className="font-medium text-2xl">Metrics</h1>
				</div>
				<div className="flex items-center gap-2">
					<DateRangeFilter
						startDate={startDate || null}
						endDate={endDate || null}
						activePreset={datePreset || null}
						onDateChange={handleDateChange}
						numberOfMonths={1}
					/>
					<DomainSelector
						value={selectedDomain}
						onChange={(val: string) => {
							setSelectedDomain(val);
						}}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-6 pb-20">
				<DeliverabilityChart
					startDate={startDate}
					endDate={endDate}
					domain={selectedDomain}
				/>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<RateChart
						title="Bounce Rate"
						rate={stats?.bounceRate || 0}
						data={
							stats?.chartData.map((d) => ({
								date: d.date,
								rate: d.bounceRate,
							})) || []
						}
						breakdown={stats?.breakdown.bounce || []}
						color="#F04438"
						riskValue={4}
					/>
					<RateChart
						title="Complain Rate"
						rate={stats?.complaintRate || 0}
						data={
							stats?.chartData.map((d) => ({
								date: d.date,
								rate: d.complaintRate,
							})) || []
						}
						breakdown={stats?.breakdown.complaint || []}
						color="#FDB022"
						yAxisDomain={[0, 0.2]}
						riskValue={0.08}
					/>
				</div>
			</div>
		</div>
	);
};

export default MetricsPage;
