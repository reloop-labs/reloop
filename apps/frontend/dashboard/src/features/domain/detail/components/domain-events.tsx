import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import type { DomainResponse } from "#/features/domain/types";
import { getVerificationFailedMessage } from "#/features/domain/utils";
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
				return "Your domain is being verified this can take a few hours depending on your DNS provider.";
			case "active":
				return "Domain verified: Your domain is ready to send emails.";
			case "failed":
				return getVerificationFailedMessage(domain.verificationFailedReason);
			case "pending":
				return "Almost there! Add the DNS records shown below, then click Verify and you'll be ready to send.";
			default:
				return "Verifying your DNS records this will just take a moment.";
		}
	};

	if (isLoading || !domain) {
		return <DomainEventsSkeleton />;
	}

	// Banner tone by status: gray = not started, blue = verifying,
	// green = verified, red = error.
	const tone = (() => {
		switch (domain.status) {
			case "active":
				return {
					card: "border-success-base/25 bg-success-lighter/50 dark:border-success-base/30 dark:bg-success-base/10",
					icon: "confetti",
					iconClass: "text-success-base",
				};
			case "verifying":
				return {
					card: "border-sky-500/25 bg-sky-500/10 dark:border-sky-400/30 dark:bg-sky-400/10",
					icon: "list-check",
					iconClass: "text-sky-600 dark:text-sky-400",
				};
			case "failed":
				return {
					card: "border-error-base/25 bg-error-lighter/40 dark:border-error-base/30 dark:bg-error-base/10",
					icon: "cross-circle",
					iconClass: "text-error-base",
				};
			default:
				return {
					card: "border-stroke-soft-200 bg-bg-weak-50/50 dark:border-stroke-soft-100/40",
					icon: "activity",
					iconClass: "text-text-sub-600",
				};
		}
	})();

	return (
		<div className="mt-7 flex flex-col gap-4">
			{/* Status banner */}
			<div
				className={cn(
					"flex items-start gap-2.5 rounded-2xl border p-4",
					tone.card,
				)}
			>
				<Icon
					name={tone.icon}
					className={cn("mt-0.5 h-4 w-4 shrink-0", tone.iconClass)}
				/>
				<p className="font-medium text-paragraph-sm text-text-strong-950">
					{bannerMessage()}
				</p>
			</div>

			{/* Bottom section — timeline steps (email details style) */}
			<StatusTimeline domain={domain} />
		</div>
	);
};

export const DomainEventsSkeleton = () => (
	<div className="mt-7 flex flex-col gap-4">
		<div className="flex flex-col gap-2.5 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/20 p-6 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/50">
			<div className="flex items-center gap-1.5">
				<Skeleton className="h-3.5 w-3.5 rounded-full" />
				<Skeleton className="h-2.5 w-24 rounded-full" />
			</div>
			<Skeleton className="h-4 w-3/4 rounded-full" />
		</div>

		<StatusTimelineSkeleton />
	</div>
);
