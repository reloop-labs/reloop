"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

const UsagePage = () => {
	return (
		<div className="w-full space-y-5 pt-5">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h5">
						Usage
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						Email sends for your current billing period.
					</p>
				</div>
				<button className="rounded-md p-1 text-text-sub-600 transition-colors hover:bg-bg-soft-200">
					<Icon name="more-horizontal" className="h-5 w-5" />
				</button>
			</div>

			{/* Billing Period Banner */}
			<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-4">
				<div className="flex items-center gap-3">
					<Icon name="calendar" className="h-5 w-5 text-text-sub-600" />
					<p className="font-medium text-label-sm text-text-strong-950">
						Billing period: May 1 – May 31, 2026
					</p>
				</div>
				<p className="font-medium text-paragraph-xs text-text-sub-600">
					Resets in{" "}
					<span className="font-semibold text-text-strong-950">24 days</span>
				</p>
			</div>

			{/* Main Usage Card */}
			<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-6 shadow-sm">
				<div className="mb-4 flex items-center justify-between">
					<div>
						<p className="font-semibold text-label-md text-text-strong-950">
							Emails sent
						</p>
						<p className="text-paragraph-xs text-text-sub-600">
							Total outbound sends this period
						</p>
					</div>
					<div className="rounded-full border border-success-light bg-success-lighter px-2.5 py-0.5">
						<span className="font-semibold text-[11px] text-success-base uppercase tracking-wider">
							On track
						</span>
					</div>
				</div>

				<div className="mb-6">
					<div className="flex items-baseline gap-2">
						<span className="font-bold text-text-strong-950 text-title-h3">
							24,810
						</span>
						<span className="font-medium text-paragraph-sm text-text-sub-600">
							of 100,000 included
						</span>
					</div>
				</div>

				<div className="relative h-2 w-full overflow-hidden rounded-full bg-bg-soft-200">
					<div
						className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500"
						style={{ width: "24.8%" }}
					/>
				</div>

				<div className="mt-3 flex justify-between">
					<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-tight">
						24.8% used
					</p>
					<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-tight">
						75,190 remaining
					</p>
				</div>
			</div>

			{/* Small Stats Cards */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				{[
					{
						label: "This month",
						value: "24,810",
						trend: "↑ 8% vs last",
						trendColor: "text-success-base",
					},
					{
						label: "Yesterday",
						value: "1,204",
						trend: "avg 980/day",
						trendColor: "text-text-sub-600",
					},
					{
						label: "Delivery rate",
						value: "98.7%",
						trend: "↑ 0.4% vs last",
						trendColor: "text-success-base",
					},
				].map((stat) => (
					<div
						key={stat.label}
						className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-4 shadow-sm"
					>
						<p className="mb-1 font-medium text-paragraph-xs text-text-sub-600">
							{stat.label}
						</p>
						<p className="font-bold text-label-xl text-text-strong-950">
							{stat.value}
						</p>
						<p className={`mt-1 font-medium text-[11px] ${stat.trendColor}`}>
							{stat.trend}
						</p>
					</div>
				))}
			</div>

			{/* Rate Limits Card */}
			<div className="relative overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-6 shadow-sm">
				<div className="mb-6">
					<p className="font-semibold text-label-md text-text-strong-950">
						Rate limits
					</p>
					<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
						Current plan thresholds
					</p>
				</div>

				<div className="space-y-4">
					{[
						{ label: "Per second", value: "50 emails / sec", icon: "clock" },
						{ label: "Per minute", value: "2,000 emails / min", icon: "clock" },
						{ label: "Per hour", value: "50,000 emails / hr", icon: "clock" },
						{
							label: "Monthly quota",
							value: "100,000 emails",
							icon: "calendar",
						},
						{ label: "Max attachment size", value: "10 MB", icon: "file-text" },
					].map((limit) => (
						<div
							key={limit.label}
							className="group flex items-center justify-between"
						>
							<div className="flex items-center gap-3 text-text-sub-600">
								<Icon name={limit.icon} className="h-4 w-4" />
								<span className="font-medium text-paragraph-sm">
									{limit.label}
								</span>
							</div>
							<span className="font-semibold text-paragraph-sm text-text-strong-950 tracking-tight">
								{limit.value}
							</span>
						</div>
					))}
				</div>

				<div className="mt-8 flex items-center justify-between border-stroke-soft-200/50 border-t pt-6">
					<button className="mx-auto rounded-full p-2 text-text-sub-600 transition-colors hover:bg-bg-soft-200">
						<Icon name="chevron-down" className="h-5 w-5" />
					</button>
					<div className="absolute right-6 bottom-6">
						<Button.Root
							variant="neutral"
							size="xsmall"
							className="font-semibold"
						>
							Upgrade plan
							<Icon
								name="arrow-swap"
								className="ml-2 h-3.5 w-3.5 rotate-[135deg]"
							/>
						</Button.Root>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UsagePage;
