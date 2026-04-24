"use client";

import type { DomainResponse } from "@reloop/api";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
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
			label: isFailed ? "DNS Failed" : "Verifying DNS",
			icon: "shield",
			timestamp:
				domain.lastVerifiedAt || domain.updatedAt
					? format(
							new Date(domain.lastVerifiedAt || domain.updatedAt),
							"MMM dd, h:mm a",
						)
					: null,
		},
		{
			number: 3,
			label: "Ready to Send",
			icon: "list-unordered-4-rec",
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
											step.number !== 1 &&
											"border-success-base text-success-base",
										state === "active" &&
											step.number !== 1 &&
											!isFailed &&
											"border-warning-base text-warning-base",
										state === "failed" && "border-error-base text-error-base",
										(state === "upcoming" ||
											(state !== "failed" && step.number === 1)) &&
											"border-stroke-soft-200 text-text-soft-400",
									)}
								>
									{/* Colored Shade Overlay */}
									<div
										className={cn(
											"absolute inset-0 rounded-[14px]",
											state === "completed" &&
												step.number !== 1 &&
												"bg-success-base/10",
											state === "active" &&
												step.number !== 1 &&
												!isFailed &&
												"bg-warning-base/10",
											state === "failed" && "bg-error-base/10",
										)}
									/>

									{state === "failed" ? (
										<Icon name="cross" className="relative z-10 h-5 w-5" />
									) : state === "active" && domain.status === "verifying" ? (
										<div className="relative z-10">
											<Spinner size={12} color="currentColor" />
										</div>
									) : (
										<Icon
											name={step.icon}
											className={cn(
												"relative z-10 h-5 w-5 transition-colors duration-300",
												state === "active" && step.number !== 1
													? "text-warning-base"
													: state === "completed" && step.number !== 1
														? "text-success-base"
														: "text-text-soft-400",
											)}
										/>
									)}
								</div>

								{/* Connector Line */}
								{!isLast && (
									<div className="-right-5 absolute top-5 left-5 h-[1px] bg-stroke-soft-200">
										<div
											className={cn(
												"h-full transition-all duration-700 ease-out",
												state === "completed" && step.number !== 1
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
