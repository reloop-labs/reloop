"use client";

import { Skeleton } from "@reloop/ui/skeleton";
import {
	type EngagementBucket,
	useEngagementQuery,
} from "#/features/metrics/hooks/use-engagement-query";

const regionNames =
	typeof Intl !== "undefined" && "DisplayNames" in Intl
		? new Intl.DisplayNames(undefined, { type: "region" })
		: null;

function countryLabel(code: string): string {
	try {
		return regionNames?.of(code) ?? code;
	} catch {
		return code;
	}
}

function deviceLabel(device: string): string {
	return device.charAt(0).toUpperCase() + device.slice(1);
}

function BreakdownList({
	title,
	buckets,
	label = (name) => name,
	isLoading,
}: {
	title: string;
	buckets: EngagementBucket[];
	label?: (name: string) => string;
	isLoading: boolean;
}) {
	const total = buckets.reduce((sum, b) => sum + b.count, 0);
	return (
		<div className="min-w-0">
			<p className="font-medium text-paragraph-xs text-text-sub-600">{title}</p>
			<div className="mt-2.5 space-y-2">
				{isLoading ? (
					Array.from({ length: 3 }, (_, i) => (
						<Skeleton key={i} className="h-5 w-full rounded-md" />
					))
				) : buckets.length === 0 ? (
					<p className="text-paragraph-xs text-text-soft-400">No data yet</p>
				) : (
					buckets.map((bucket) => {
						const share = total ? Math.round((bucket.count / total) * 100) : 0;
						return (
							<div key={bucket.name} className="text-paragraph-xs">
								<div className="flex items-center justify-between gap-2">
									<span className="truncate text-text-strong-950">
										{label(bucket.name)}
									</span>
									<span className="shrink-0 text-text-sub-600 tabular-nums">
										{share}%
									</span>
								</div>
								<div className="mt-1 h-1 overflow-hidden rounded-full bg-bg-weak-50">
									<div
										className="h-full rounded-full bg-text-strong-950"
										style={{ width: `${share}%` }}
									/>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}

/** Email clients, devices and countries of the people who opened or clicked. */
export function CampaignEngagementCard({ campaignId }: { campaignId: string }) {
	const { data, isPending } = useEngagementQuery({ campaignId });
	const machineOpens = data?.totals.machineOpens ?? 0;

	return (
		<section className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-4">
			<div className="flex flex-wrap items-baseline justify-between gap-2">
				<h2 className="font-semibold text-label-sm text-text-strong-950">
					Who opened
				</h2>
				{machineOpens > 0 ? (
					<p className="text-paragraph-xs text-text-soft-400">
						{machineOpens.toLocaleString()} automatic{" "}
						{machineOpens === 1 ? "open" : "opens"} by Apple Mail Privacy
						Protection or security scanners not counted
					</p>
				) : null}
			</div>
			<div className="mt-4 grid gap-6 sm:grid-cols-3">
				<BreakdownList
					title="Email client"
					buckets={data?.clients ?? []}
					isLoading={isPending}
				/>
				<BreakdownList
					title="Device"
					buckets={data?.devices ?? []}
					label={deviceLabel}
					isLoading={isPending}
				/>
				<BreakdownList
					title="Country"
					buckets={data?.countries ?? []}
					label={countryLabel}
					isLoading={isPending}
				/>
			</div>
			<p className="mt-4 text-[11px] text-text-soft-400">
				Gmail and Yahoo load images through their own servers, so their readers'
				devices and locations aren't visible. Location data:{" "}
				<a
					href="https://db-ip.com"
					target="_blank"
					rel="noreferrer"
					className="underline-offset-2 hover:underline"
				>
					IP Geolocation by DB-IP
				</a>
				.
			</p>
		</section>
	);
}
