"use client";

import type { DomainResponse } from "@reloop/api";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { format } from "date-fns";
import * as React from "react";
import { inferDnsProvider } from "../utils";

export const DomainEvents = ({
	domain,
	nameservers,
}: {
	domain: DomainResponse;
	nameservers?: string[] | null;
}) => {
	const providerLabel = React.useMemo(
		() => inferDnsProvider(nameservers || domain.nameservers)?.label,
		[nameservers, domain.nameservers],
	);

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

	const bannerMessage = () => {
		switch (domain.status) {
			case "verifying":
				return `Propagation via ${providerLabel || "your DNS provider"} may take a few hours`;
			case "active":
				return "DNS records are configured correctly";
			case "failed":
				return "Please review your DNS configuration";
			case "start-verify":
				return "Add the DNS records and click Verify";
			default:
				return "Checking status...";
		}
	};

	const steps = [
		{
			number: 1,
			label: "Domain added",
			timestamp: domain.createdAt
				? format(new Date(domain.createdAt), "MMM dd, h:mm a")
				: null,
		},
		{
			number: 2,
			label: "Verification",
			timestamp: domain.lastVerifiedAt
				? format(new Date(domain.lastVerifiedAt), "MMM dd, h:mm a")
				: currentStep >= 2
					? "Pending"
					: null,
		},
		{
			number: 3,
			label: "Active",
			timestamp:
				domain.status === "active" && domain.lastVerifiedAt
					? format(new Date(domain.lastVerifiedAt), "MMM dd, h:mm a")
					: null,
		},
	];

	return (
		<div className="mt-7 flex flex-col gap-6 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/50 p-6">
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

			{/* Minimalist Timeline */}
			<div className="relative flex items-start gap-0">
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
											"relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border bg-bg-white-0 transition-all duration-300",
											state === "completed" &&
												"border-success-base bg-success-base text-static-white",
											state === "active" &&
												!isFailed &&
												"border-warning-base bg-warning-base/10 text-warning-base",
											state === "failed" &&
												"border-error-base bg-error-base/10 text-error-base",
											state === "upcoming" &&
												"border-stroke-soft-200 bg-bg-white-0 text-text-soft-400",
										)}
									>
										{state === "completed" ? (
											<Icon name="check" className="h-3 w-3" />
										) : state === "failed" ? (
											<Icon name="cross" className="h-3 w-3" />
										) : state === "active" && domain.status === "verifying" ? (
											<Spinner size={12} color="currentColor" />
										) : (
											<div
												className={cn(
													"size-1.5 rounded-full",
													state === "active" ? "bg-warning-base" : "bg-current",
												)}
											/>
										)}
									</div>

									{/* Connector Line */}
									{!isLast && (
										<div className="absolute top-3 right-0 left-6 h-[1px] bg-stroke-soft-200">
											<div
												className={cn(
													"h-full transition-all duration-700 ease-out",
													state === "completed"
														? "w-full bg-success-base"
														: "w-0",
												)}
											/>
										</div>
									)}
								</div>

								{/* Label + Meta */}
								<div className="flex flex-col gap-0.5 pr-4">
									<p
										className={cn(
											"font-medium text-[10px] uppercase tracking-wider transition-colors duration-300",
											state === "upcoming"
												? "text-text-soft-400"
												: "text-text-strong-950",
										)}
									>
										{step.label}
									</p>
									{step.timestamp && (
										<span className="text-[10px] text-text-soft-400 tabular-nums">
											{step.timestamp}
										</span>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
