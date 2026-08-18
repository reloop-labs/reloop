import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useQueryClient } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { DomainSelector } from "#/features/emails/components/domain-selector";
import { DateRangeFilter } from "#/features/logs/date-range-filter";
import { DeliverabilityChart } from "#/features/metrics/components/deliverability-chart";
import { HealthCards } from "#/features/metrics/components/health-cards";
import { RateChart } from "#/features/metrics/components/rate-chart";
import { buildHealthCards } from "#/features/metrics/health-ratings";
import { useEmailStatsQuery } from "#/features/metrics/hooks/use-email-stats-query";
import {
	formatBucketDateLabel,
	formatDateLabel,
	generateContinuousDateList,
	getBucketSize,
	getLocalKey,
	getYearMonthDayKey,
} from "#/features/metrics/utils";
import { queryKeys } from "#/lib/query-keys";
import { MetricsListHeader } from "./metrics-list-header";

export function MetricsPage() {
	const { activeOrganization } = useActiveOrganization();
	const queryClient = useQueryClient();
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

	const { effectiveStartDate, effectiveEndDate, effectivePreset } =
		useMemo(() => {
			let start = startDate;
			let end = endDate;
			let preset = datePreset;

			if (!start && !end) {
				preset = datePreset || "15d";
				const now = new Date();
				const toDate = new Date(now);
				toDate.setHours(23, 59, 59, 999);
				const fromDate = new Date(now);
				fromDate.setDate(now.getDate() - 14); // 15 days inclusive
				fromDate.setHours(0, 0, 0, 0);

				start = fromDate.toISOString();
				end = toDate.toISOString();
			}

			return {
				effectiveStartDate: start ?? "",
				effectiveEndDate: end ?? "",
				effectivePreset: preset ?? "",
			};
		}, [startDate, endDate, datePreset]);

	const handleDateChange = (
		newStartDate: string | null,
		newEndDate: string | null,
		preset: string | null,
	) => {
		void setStartDate(newStartDate || "");
		void setEndDate(newEndDate || "");
		void setDatePreset(preset || "");
	};

	const statsParams = {
		startDate: effectiveStartDate,
		endDate: effectiveEndDate,
		domain: selectedDomain ?? "",
	};

	const { data, isFetching, isPending } = useEmailStatsQuery({
		...statsParams,
		enabled: !!activeOrganization?.id,
	});

	const handleRefresh = () => {
		void queryClient.invalidateQueries({
			queryKey: queryKeys.metrics.emailStats(statsParams),
		});
	};

	const stats = useMemo(() => {
		if (!data) return null;

		const totalSent = data.sent.reduce((a, b) => a + b, 0);
		const totalComplaint = data.complaint.reduce((a, b) => a + b, 0);

		const bounceBreakdown = data.bounceBreakdown ?? {
			transient: data.dates.map(() => 0),
			permanent: data.dates.map(() => 0),
			undetermined: data.dates.map(() => 0),
		};

		const totalPermanent = bounceBreakdown.permanent.reduce((a, b) => a + b, 0);
		const totalTransient = bounceBreakdown.transient.reduce((a, b) => a + b, 0);
		const totalUndetermined = bounceBreakdown.undetermined.reduce(
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
				delivered: number;
				transient: number;
				permanent: number;
				undetermined: number;
				complaint: number;
				rate: number;
			}
		>();

		for (let i = 0; i < data.dates.length; i++) {
			const dateStr = data.dates[i];
			if (!dateStr) continue;
			const key = getLocalKey(dateStr);
			if (key) {
				statsMap.set(key, {
					sent: data.sent[i] ?? 0,
					delivered: data.delivered[i] ?? 0,
					transient: bounceBreakdown.transient[i] ?? 0,
					permanent: bounceBreakdown.permanent[i] ?? 0,
					undetermined: bounceBreakdown.undetermined[i] ?? 0,
					complaint: data.complaint[i] ?? 0,
					rate: data.rate[i] ?? 0,
				});
			}
		}

		const datesList = generateContinuousDateList(
			data,
			effectiveStartDate,
			effectiveEndDate,
		);

		const chunks: Date[][] = [];
		const bucketSize = getBucketSize(datesList.length);
		for (let i = 0; i < datesList.length; i += bucketSize) {
			chunks.push(datesList.slice(i, i + bucketSize));
		}

		const chartData = chunks.map((chunk) => {
			const chunkStart = chunk[0];
			const chunkEnd = chunk[chunk.length - 1];

			let formattedDate = "";
			let fullDate = "";
			if (bucketSize > 1 && chunkStart && chunkEnd) {
				formattedDate = formatBucketDateLabel(chunkStart, chunkEnd);
				fullDate = formattedDate;
			} else if (chunkStart) {
				formattedDate = formatDateLabel(chunkStart);
				fullDate = formattedDate;
			}

			let totalSentInBucket = 0;
			let totalDeliveredInBucket = 0;
			let transientBounced = 0;
			let permanentBounced = 0;
			let undeterminedBounced = 0;
			let totalComplaintInBucket = 0;

			for (const date of chunk) {
				const key = getYearMonthDayKey(date);
				const existing = statsMap.get(key);
				if (existing) {
					totalSentInBucket += existing.sent;
					totalDeliveredInBucket += existing.delivered;
					transientBounced += existing.transient;
					permanentBounced += existing.permanent;
					undeterminedBounced += existing.undetermined;
					totalComplaintInBucket += existing.complaint;
				}
			}

			const bounceCount =
				transientBounced + permanentBounced + undeterminedBounced;

			return {
				date: formattedDate,
				fullDate: fullDate,
				bounceRate:
					totalSentInBucket > 0 ? (bounceCount / totalSentInBucket) * 100 : 0,
				complaintRate:
					totalSentInBucket > 0
						? (totalComplaintInBucket / totalSentInBucket) * 100
						: 0,
				sent: totalSentInBucket,
				bounced: bounceCount,
				deliveryRate:
					totalSentInBucket > 0
						? (totalDeliveredInBucket / totalSentInBucket) * 100
						: 0,
			};
		});

		const totalBouncedSum = totalPermanent + totalTransient + totalUndetermined;
		const totalSentSum = totalSent;
		const totalDelivered = data.delivered.reduce((a, b) => a + b, 0);
		const totalOpened = (data.opened ?? []).reduce((a, b) => a + b, 0);
		const totalUnsubscribed = (data.unsubscribed ?? []).reduce(
			(a, b) => a + b,
			0,
		);

		return {
			bounceRate: Math.round(bounceRate * 100) / 100,
			complaintRate: Math.round(complaintRate * 100) / 100,
			healthCards: buildHealthCards({
				sent: totalSentSum,
				delivered: totalDelivered,
				bounced: totalBouncedSum,
				complaint: totalComplaint,
				opened: totalOpened,
				unsubscribed: totalUnsubscribed,
			}),
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
	}, [data, effectiveStartDate, effectiveEndDate]);

	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
			<MetricsListHeader />

			<div className="pb-8">
				{/* Toolbar */}
				<div className="flex flex-wrap items-center gap-2">
					<DateRangeFilter
						startDate={effectiveStartDate || null}
						endDate={effectiveEndDate || null}
						activePreset={effectivePreset || null}
						onDateChange={handleDateChange}
						numberOfMonths={2}
						maxDays={30}
						align="start"
					/>
					<DomainSelector
						value={selectedDomain ?? ""}
						onChange={(val: string) => {
							void setSelectedDomain(val);
						}}
						align="start"
					/>
					<button
						type="button"
						onClick={handleRefresh}
						disabled={isFetching}
						className={cn(
							"ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/40",
							isFetching ? "pointer-events-none" : "cursor-pointer",
						)}
						title="Refresh metrics"
						aria-label="Refresh metrics"
						aria-busy={isFetching}
					>
						<Icon
							name="rotate-cw"
							className={cn("h-4 w-4", isFetching && "animate-spin")}
						/>
					</button>
				</div>

				<div className="mt-4 flex flex-col gap-6">
					<HealthCards
						cards={stats?.healthCards ?? []}
						isLoading={isPending && !stats}
					/>

					<DeliverabilityChart
						startDate={effectiveStartDate}
						endDate={effectiveEndDate}
						domain={selectedDomain ?? ""}
					/>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<RateChart
							title="Bounce Rate"
							rate={stats?.bounceRate || 0}
							data={
								stats?.chartData.map((d) => ({
									date: d.date,
									rate: d.bounceRate,
									sent: d.sent,
									bounced: d.bounced,
									deliveryRate: d.deliveryRate,
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
									sent: d.sent,
									bounced: d.bounced,
									deliveryRate: d.deliveryRate,
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
		</div>
	);
}
