"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import useSWR from "swr";
import { DateRangeFilter } from "../emails/components/date-range-filter";
import { DomainSelector } from "../emails/components/domain-selector";
import { DeliverabilityChart } from "./components/deliverability-chart";
import { RateChart } from "./components/rate-chart";

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
		const totalBounced = data.bounced.reduce((a, b) => a + b, 0);
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

		const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;
		const complaintRate =
			totalSent > 0 ? (totalComplaint / totalSent) * 100 : 0;

		const chartData = data.dates.map((d: string, i: number) => {
			const sentCount = data.sent[i] || 0;
			const bouncedCount = data.bounced[i] || 0;
			const complaintCount = data.complaint[i] || 0;

			return {
				date: d,
				bounceRate: sentCount > 0 ? (bouncedCount / sentCount) * 100 : 0,
				complaintRate: sentCount > 0 ? (complaintCount / sentCount) * 100 : 0,
			};
		});

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
							totalSent > 0
								? Math.round((totalTransient / totalSent) * 100)
								: 0,
					},
					{
						label: "Permanent",
						color: "#F04438",
						count: totalPermanent,
						percentage:
							totalSent > 0
								? Math.round((totalPermanent / totalSent) * 100)
								: 0,
					},
					{
						label: "Undetermined",
						color: "#F04438",
						count: totalUndetermined,
						percentage:
							totalSent > 0
								? Math.round((totalUndetermined / totalSent) * 100)
								: 0,
					},
				],
				complaint: [
					{
						label: "Complained",
						color: "#FDB022",
						count: totalComplaint,
						percentage:
							totalSent > 0
								? Math.round((totalComplaint / totalSent) * 100)
								: 0,
					},
				],
			},
		};
	}, [data]);

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
					/>
				</div>
			</div>
		</div>
	);
};

export default MetricsPage;
