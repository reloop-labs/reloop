import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { format } from "date-fns";
import { Fragment } from "react";
import type { DomainResponse } from "#/features/domain/types";
import { TimeHover } from "./created-time-hover";

interface StatusTimelineProps {
	domain: DomainResponse;
}

export const StatusTimeline = ({ domain }: StatusTimelineProps) => {
	let currentStep = 1;
	if (domain.status === "verifying") currentStep = 2;
	if (domain.status === "active") currentStep = 3;
	if (domain.status === "failed") currentStep = 2;

	const isFailed = domain.status === "failed";

	const getStepState = (stepNumber: number) => {
		// Domain Added is always gray, in every state.
		if (stepNumber === 1) return "upcoming";
		// DNS Verified stays blue once verified; only the final badge turns green.
		if (domain.status === "active")
			return stepNumber === 2 ? "active" : "completed";
		if (isFailed && stepNumber === 2) return "failed";
		if (stepNumber < currentStep) return "completed";
		if (stepNumber === currentStep) return "active";
		return "upcoming";
	};

	const verifiedAt = domain.lastVerifiedAt || domain.updatedAt;

	const steps = [
		{
			number: 1,
			label: "Domain Added",
			icon: "globe",
			rawDate: domain.createdAt ?? null,
		},
		{
			number: 2,
			label:
				domain.status === "active"
					? "DNS Verified"
					: domain.status === "verifying"
						? "Verifying DNS Records"
						: domain.status === "failed"
							? "Verification Failed"
							: "Start Verification",
			icon:
				domain.status === "active"
					? "list-check"
					: domain.status === "verifying"
						? "scan"
						: domain.status === "failed"
							? "cross-circle"
							: "list-check",
			timestamp: null,
			rawDate:
				(domain.status === "active" ||
					domain.status === "verifying" ||
					domain.status === "failed") &&
				verifiedAt
					? verifiedAt
					: null,
		},
		{
			number: 3,
			label: "Verified",
			icon: "verified",
			rawDate:
				domain.status === "active" && domain.lastVerifiedAt
					? domain.lastVerifiedAt
					: null,
		},
	];

	const getIconStyles = (state: string) => {
		switch (state) {
			case "completed":
				return "border-success-base/20 bg-success-lighter/50 text-success-base";
			case "active":
				return "border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-400";
			case "failed":
				return "border-error-light bg-error-lighter text-error-base";
			default:
				return "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400";
		}
	};

	const getBadgeStyles = (state: string) => {
		switch (state) {
			case "completed":
				return "bg-success-lighter text-success-base";
			case "active":
				return "bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400";
			case "failed":
				return "bg-error-lighter text-error-base";
			default:
				return "bg-bg-weak-50 text-text-sub-600 dark:bg-neutral-900 dark:text-neutral-400";
		}
	};

	return (
		<div className="relative flex h-[176px] w-full items-center justify-start rounded-3xl border border-stroke-soft-100 bg-bg-white-0 py-6 pr-8 pb-5 pl-6 transition-all hover:border-stroke-soft-200 dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5">
			<div className="flex w-full max-w-2xl items-start justify-start">
				{steps.map((step, index) => {
					const state = getStepState(step.number);

					const textBlock = (
						<div className="flex cursor-default flex-col items-center gap-1 text-center">
							<span
								className={cn(
									"whitespace-nowrap rounded-md px-2 py-1 font-semibold text-xs transition-colors duration-300",
									getBadgeStyles(state),
								)}
							>
								{step.label}
							</span>
							<div className="flex h-4 items-center justify-center">
								{step.timestamp ? (
									<span className="whitespace-nowrap font-medium text-text-soft-400 text-xs">
										{step.timestamp}
									</span>
								) : (
									<span className="h-4 w-16 opacity-0" aria-hidden="true" />
								)}
							</div>
						</div>
					);

					return (
						<Fragment key={step.number}>
							<div className="flex min-w-[90px] flex-col items-center">
								<div className="flex flex-col items-center gap-2">
									<div
										className={cn(
											"flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border transition-all duration-300",
											getIconStyles(state),
										)}
									>
										{domain.status === "verifying" && step.number === 2 ? (
											<Spinner size={20} color="currentColor" />
										) : (
											<Icon name={step.icon} className="h-5 w-5" />
										)}
									</div>

									<TimeHover
										value={step.rawDate}
										trigger={textBlock}
										idPrefix={`timeline-step-${step.number}`}
									/>
								</div>
							</div>
							{index < steps.length - 1 && (
								<div className="mt-5 h-0 w-24 flex-none border-stroke-soft-100 border-t-[1.5px] border-dashed dark:border-neutral-800" />
							)}
						</Fragment>
					);
				})}
			</div>
		</div>
	);
};

export const StatusTimelineSkeleton = () => (
	<div className="relative flex h-[176px] w-full items-center justify-start rounded-3xl border border-stroke-soft-100 bg-bg-white-0 py-6 pr-8 pb-5 pl-6 dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5">
		<div className="flex w-full max-w-2xl items-start justify-start">
			{[1, 2, 3].map((step, index) => (
				<Fragment key={step}>
					<div className="flex min-w-[90px] flex-col items-center">
						<div className="flex flex-col items-center gap-2">
							<Skeleton className="h-10 w-10 rounded-[10px]" />
							<div className="flex flex-col items-center gap-1">
								<Skeleton className="h-6 w-20 rounded-md" />
								<Skeleton className="h-3 w-16 rounded-md" />
							</div>
						</div>
					</div>
					{index < 2 && (
						<div className="mt-5 h-0 w-24 flex-none border-stroke-soft-100 border-t-[1.5px] border-dashed dark:border-neutral-800" />
					)}
				</Fragment>
			))}
		</div>
	</div>
);
