import { useState } from "react";
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
	const [expanded, setExpanded] = useState(false);

	// Use registrar age from API (RDAP) if available, fallback to Reloop added date
	const ageDays =
		domain?.ageDays != null
			? domain.ageDays
			: domain
				? Math.max(0, Math.floor((Date.now() - new Date(domain.createdAt).getTime()) / 86400000))
				: 0;
	const getCap = (age: number): number | null => {
		if (age <= 1) return 20;
		if (age <= 3) return 50;
		if (age <= 7) return 100;
		if (age <= 14) return 250;
		if (age <= 30) return 500;
		return null;
	};
	const dailyCap = domain?.dailyCap !== undefined ? domain.dailyCap : getCap(ageDays);
	const nextCap = (() => {
		if (ageDays <= 1) return { cap: 50, inDays: 2 - ageDays };
		if (ageDays <= 3) return { cap: 100, inDays: 4 - ageDays };
		if (ageDays <= 7) return { cap: 250, inDays: 8 - ageDays };
		if (ageDays <= 14) return { cap: 500, inDays: 15 - ageDays };
		if (ageDays <= 30) return { cap: null, label: "Dynamic" as const, inDays: 31 - ageDays };
		return null;
	})();
	const registrarCreatedAt = domain?.registrarCreatedAt ? new Date(domain.registrarCreatedAt) : null;

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
			{/* Status banner — expands in place to show age & cap */}
			<div className={cn("rounded-2xl border p-4", tone.card)}>
				<div className="flex items-start gap-2.5">
					<Icon
						name={tone.icon}
						className={cn("mt-0.5 h-4 w-4 shrink-0", tone.iconClass)}
					/>
					<p className="flex-1 font-medium text-paragraph-sm text-text-strong-950">
						{bannerMessage()}
					</p>
					{domain?.status === "active" && (
						<button
							type="button"
							onClick={() => setExpanded((v) => !v)}
							aria-expanded={expanded}
							aria-label={expanded ? "Hide sending limits" : "Show sending limits"}
							className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 transition hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:text-white/60"
						>
							<Icon
								name="chevron-down"
								className={cn("size-3.5 transition-transform duration-200", expanded && "rotate-180")}
							/>
						</button>
					)}
				</div>

				{expanded && domain?.status === "active" && (
					<div className="mt-3 border-t border-success-base/15 pt-3 dark:border-success-base/20">
						<p className="text-[12px] leading-relaxed text-text-strong-950 dark:text-white">
							Your domain is <span className="font-semibold">{ageDays} day{ageDays === 1 ? "" : "s"} old</span>{" "}
							{registrarCreatedAt ? (
								<span>
									(registered {registrarCreatedAt.toLocaleDateString()} via registrar, RDAP
									{ageDays > 30 ? ` — ${Math.floor(ageDays / 30)} months` : ""})
								</span>
							) : (
								<span>(added {new Date(domain.createdAt).toLocaleDateString()})</span>
							)}{" "}
							— you can send up to{" "}
							<span className="font-semibold">{dailyCap === null ? "as many as your plan allows (reputation-based)" : `${dailyCap.toLocaleString()} emails today`}</span>
							{dailyCap !== null && ` (resets at 00:00 UTC${domain.sentToday != null ? ` · ${domain.sentToday}/${dailyCap} sent today` : ""})`}.
						</p>
						{nextCap && dailyCap !== null && (
							<p className="mt-1 text-[12px] leading-relaxed text-text-sub-600 dark:text-white/60">
								Next increase: {nextCap.cap === null ? "unlimited (reputation-based)" : `${nextCap.cap.toLocaleString()}/day`} in {nextCap.inDays} day{nextCap.inDays === 1 ? "" : "s"} — no action needed, it rises automatically.
							</p>
						)}
						{dailyCap === null && (
							<p className="mt-1 text-[12px] leading-relaxed text-text-sub-600 dark:text-white/60">
								Warmup complete — your plan limit now applies (Free 100/day). Keep bounce/complaint low to stay dynamic.
							</p>
						)}
						<p className="mt-2 text-[11px] leading-relaxed text-text-sub-600 dark:text-white/50">
							New domains are throttled for all plans to protect reputation. If you hit the limit you’ll get a 429 and can try again tomorrow.
						</p>
					</div>
				)}
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
