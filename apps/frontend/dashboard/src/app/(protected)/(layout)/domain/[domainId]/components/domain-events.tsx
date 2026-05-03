"use client";

import type { DomainResponse } from "@fe/dashboard/types/api.types";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { StatusTimeline, StatusTimelineSkeleton } from "./status-timeline";

export const DomainEvents = ({
	domain,
	isLoading,
}: {
	domain?: DomainResponse;
	isLoading?: boolean;
}) => {
	const bannerMessage = () => {
		if (!domain) return "";
		switch (domain.status) {
			case "verifying":
				return "Your domain is being verified — this can take a few hours depending on your DNS provider.";
			case "active":
				return "You're all set! Your domain is ready to send emails.";
			case "failed":
				return "We couldn't verify your domain. Double-check your DNS records and try again.";
			case "start-verify":
				return "Almost there! Add the DNS records shown below, then click Verify — and you'll be ready to send.";
			default:
				return "Checking your domain authentication — this will just take a moment…";
		}
	};

	if (isLoading || !domain) {
		return <DomainEventsSkeleton />;
	}

	return (
		<div className="mt-7 flex flex-col gap-6 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/50 p-6 dark:border-stroke-soft-100/40">
			{/* Header Status */}
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-1.5">
					<Icon name="activity" className="h-3.5 w-3.5 text-text-sub-600" />
					<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
						Status Timeline
					</span>
				</div>
				<p className="font-medium text-paragraph-sm text-text-strong-950">
					{bannerMessage()}
				</p>
			</div>

			<div className="h-[1px] w-full bg-stroke-soft-200 dark:bg-stroke-soft-100/40" />

			<StatusTimeline domain={domain} />
		</div>
	);
};

export const DomainEventsSkeleton = () => (
	<div className="mt-7 flex flex-col gap-6 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/20 p-6 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/50">
		<div className="flex flex-col gap-2.5">
			<div className="flex items-center gap-1.5">
				<Skeleton className="h-3.5 w-3.5 rounded-full" />
				<Skeleton className="h-2.5 w-24 rounded-full" />
			</div>
			<Skeleton className="h-4 w-3/4 rounded-full" />
		</div>

		<div className="h-[1px] w-full bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

		<StatusTimelineSkeleton />
	</div>
);
