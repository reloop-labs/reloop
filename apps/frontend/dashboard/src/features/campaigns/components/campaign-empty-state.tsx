"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface CampaignEmptyStateProps {
	onCreate: () => void;
}

const steps = [
	{
		title: "Target your audience",
		description: "Select all contacts or target specific segments & channels.",
	},
	{
		title: "Design or choose template",
		description:
			"Compose rich HTML, pick a pre-built template, or write custom text.",
	},
	{
		title: "Broadcast instantly",
		description:
			"Preview across mobile/desktop and send to all contacts with one click.",
	},
];

const features = [
	{
		icon: "contacts",
		title: "Direct contact sync",
		description:
			"Broadcasts automatically reach every active subscriber in your audience.",
	},
	{
		icon: "sparkling",
		title: "Real-time deliverability",
		description:
			"Powered by Reloop's high-speed SMTP routing with DKIM & SPF authentication.",
	},
	{
		icon: "fat-row",
		title: "Deep analytics",
		description:
			"Track deliveries, opens, and link clicks in real-time as emails land.",
	},
];

export const CampaignEmptyState = ({ onCreate }: CampaignEmptyStateProps) => {
	return (
		<div className="w-full">
			<div className="flex flex-col items-center border-stroke-soft-100 border-b bg-bg-soft-200/10 px-6 py-12 text-center dark:border-stroke-soft-100/50 dark:bg-bg-soft-200/15">
				<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 shadow-sm dark:border-stroke-soft-100/50">
					<Icon name="mega-phone" className="h-5 w-5 text-text-strong-950" />
				</div>
				<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
					No campaigns created yet
				</h3>
				<p className="mx-auto mb-6 max-w-[340px] text-balance font-medium text-[13px] text-text-sub-600">
					Broadcast announcements, product updates, and newsletters directly to
					all your contacts with rich analytics.
				</p>
				<div className="flex items-center gap-3">
					<Button.Root
						variant="neutral"
						size="xsmall"
						onClick={onCreate}
						className="gap-2"
					>
						<Icon name="plus" className="h-4 w-4" />
						Create first campaign
					</Button.Root>
				</div>
			</div>

			<div className="grid grid-cols-1 divide-y divide-stroke-soft-100 border-stroke-soft-100 border-b sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/50">
				{steps.map((step, idx) => (
					<div key={step.title} className="p-6">
						<div className="mb-2 flex items-center gap-2">
							<span className="flex h-5 w-5 items-center justify-center rounded-full bg-bg-soft-200 font-medium text-[11px] text-text-strong-950 dark:bg-bg-soft-200/30">
								{idx + 1}
							</span>
							<h4 className="font-medium text-sm text-text-strong-950">
								{step.title}
							</h4>
						</div>
						<p className="text-text-sub-600 text-xs leading-relaxed">
							{step.description}
						</p>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
				{features.map((feature) => (
					<div
						key={feature.title}
						className="flex items-start gap-3 rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/30 dark:bg-bg-weak-50/20"
					>
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
							<Icon name={feature.icon} className="h-4 w-4 text-text-sub-600" />
						</div>
						<div>
							<h5 className="font-medium text-sm text-text-strong-950">
								{feature.title}
							</h5>
							<p className="mt-0.5 text-text-sub-600 text-xs leading-normal">
								{feature.description}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
