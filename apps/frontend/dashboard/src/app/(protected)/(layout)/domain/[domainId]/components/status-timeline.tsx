"use client";

import type { DomainResponse } from "@reloop/api";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { format } from "date-fns";

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
		if (domain.status === "active") return "completed";
		if (isFailed && stepNumber === 2) return "failed";
		if (stepNumber < currentStep) return "completed";
		if (stepNumber === currentStep) return "active";
		return "upcoming";
	};

	const steps = [
		{
			number: 1,
			label: "Domain Added",
			icon: "globe",
			timestamp: domain.createdAt
				? format(new Date(domain.createdAt), "MMM dd, h:mm a")
				: null,
		},
		{
			number: 2,
			label:
				domain.status === "active"
					? "Verified"
					: domain.status === "verifying"
						? "Verifying DNS"
						: domain.status === "failed"
							? "DNS Verification Failed"
							: "Start verification",
			icon:
				domain.status === "active"
					? "shield-check"
					: domain.status === "verifying"
						? "scan"
						: domain.status === "failed"
							? "cross-circle"
							: "question",
			timestamp:
				(domain.status === "active" ||
					domain.status === "verifying" ||
					domain.status === "failed") &&
				(domain.lastVerifiedAt || domain.updatedAt)
					? format(
							new Date(domain.lastVerifiedAt || domain.updatedAt),
							"MMM dd, h:mm a",
						)
					: null,
		},
		{
			number: 3,
			label: "Ready to Send",
			icon: "mail-single",
			timestamp:
				domain.status === "active" && domain.lastVerifiedAt
					? format(new Date(domain.lastVerifiedAt), "MMM dd, h:mm a")
					: null,
		},
	];
	return (
		<div className="relative mx-auto flex w-full max-w-md items-start gap-0">
			{steps.map((step, index) => {
				const state = getStepState(step.number);
				const isLast = index === steps.length - 1;

				const canShowSuccess = step.number !== 1 || domain.status === "active";
				const shouldForceNeutral =
					step.number === 1 && domain.status !== "active" && state !== "failed";

				return (
					<div
						key={step.number}
						className={cn("relative flex items-start", !isLast && "flex-1")}
					>
						<div className="flex flex-col gap-3">
							<div className="flex items-center">
								{/* Circle Indicator */}
								<div
									className={cn(
										"relative z-10 flex size-10 shrink-0 items-center justify-center rounded-[14px] border bg-bg-white-0 transition-all duration-300",
										state === "completed" &&
											canShowSuccess &&
											"border-success-base text-success-base",
										state === "active" &&
											step.number !== 1 &&
											!isFailed &&
											"border-warning-base text-warning-base",
										state === "failed" && "border-error-base text-error-base",
										(state === "upcoming" || shouldForceNeutral) &&
											"border-stroke-soft-200 text-text-soft-400",
									)}
								>
									{/* Colored Shade Overlay */}
									<div
										className={cn(
											"absolute inset-0 rounded-[14px]",
											state === "completed" &&
												canShowSuccess &&
												"bg-success-base/10",
											state === "active" &&
												step.number !== 1 &&
												!isFailed &&
												"bg-warning-base/10",
											state === "failed" && "bg-error-base/10",
										)}
									/>

									<Icon
										name={step.icon}
										className={cn(
											"relative z-10 h-5 w-5 transition-colors duration-300",
											state === "active" && step.number !== 1
												? "text-warning-base"
												: state === "completed" && canShowSuccess
													? "text-success-base"
													: state === "failed"
														? "text-error-base"
														: "text-text-soft-400",
											domain.status === "verifying" &&
												step.number === 2 &&
												"animate-spin",
										)}
									/>
								</div>

								{/* Connector Line */}
								{!isLast && (
									<div className="-right-5 absolute top-5 left-5 h-[1px] bg-stroke-soft-200">
										<div
											className={cn(
												"h-full transition-all duration-700 ease-out",
												state === "completed" && canShowSuccess
													? "w-full bg-success-base"
													: "w-0",
											)}
										/>
									</div>
								)}
							</div>

							{/* Label + Meta */}
							<div className="flex w-10 flex-col items-center gap-0.5">
								<p
									className={cn(
										"whitespace-nowrap text-center font-medium text-[10px] uppercase tracking-wider transition-colors duration-300",
										state === "upcoming"
											? "text-text-soft-400"
											: "text-text-strong-950",
									)}
								>
									{step.label}
								</p>
								{step.timestamp && (
									<span className="whitespace-nowrap text-center text-[10px] text-text-soft-400 tabular-nums">
										{step.timestamp}
									</span>
								)}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export const StatusTimelineSkeleton = () => (
	<div className="relative mx-auto flex w-full max-w-md items-start gap-0">
		{[1, 2, 3].map((step, index) => {
			const isLast = index === 2;
			return (
				<div
					key={step}
					className={cn("relative flex items-start", !isLast && "flex-1")}
				>
					<div className="flex flex-col gap-3">
						<div className="flex items-center">
							{/* Circle Indicator */}
							<div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-[14px] border border-stroke-soft-100 bg-bg-white-0 transition-all duration-300 dark:border-stroke-soft-100/40">
								<Skeleton className="h-5 w-5 rounded-md" />
							</div>

							{/* Connector Line */}
							{!isLast && (
								<div className="-right-5 absolute top-5 left-5 h-[1px] w-full bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />
							)}
						</div>

						{/* Label + Meta */}
						<div className="flex w-10 flex-col items-center gap-1.5">
							<Skeleton className="h-2 w-12 rounded-sm" />
							<Skeleton className="h-2 w-16 rounded-sm" />
						</div>
					</div>
				</div>
			);
		})}
	</div>
);
