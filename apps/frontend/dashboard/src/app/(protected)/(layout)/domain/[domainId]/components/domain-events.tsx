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
				return {
					title: "Scanning DNS Records",
					subtitle: `Propagation via ${providerLabel || "your DNS provider"} may take a few hours`,
				};
			case "active":
				return {
					title: "Verification Complete",
					subtitle: "DNS records are configured correctly",
				};
			case "failed":
				return {
					title: "Verification Failed",
					subtitle: "Please review your DNS configuration",
				};
			case "start-verify":
				return {
					title: "Ready to Verify",
					subtitle: "Add the DNS records and click Verify",
				};
			default:
				return {
					title: "Checking Status",
					subtitle: "Please wait...",
				};
		}
	};

	const banner = bannerMessage();

	const steps = [
		{
			number: 1,
			label: "Domain added",
			icon: "globe" as const,
			timestamp: domain.createdAt
				? format(new Date(domain.createdAt), "MMM dd, h:mm a")
				: null,
		},
		{
			number: 2,
			label: "Checking DNS",
			icon: "wifi" as const,
			timestamp: domain.lastVerifiedAt
				? format(new Date(domain.lastVerifiedAt), "MMM dd, h:mm a")
				: currentStep >= 2
					? "Pending"
					: null,
		},
		{
			number: 3,
			label: "Verified",
			icon: "check-circle" as const,
			timestamp:
				domain.status === "active" && domain.lastVerifiedAt
					? format(new Date(domain.lastVerifiedAt), "MMM dd, h:mm a")
					: null,
		},
	];

	return (
		<div>
			{/* Status Banner */}
			<div
				className={cn(
					"mt-8 mb-5 flex w-full items-center gap-3 rounded-xl border p-4 shadow-sm",
					domain.status === "active" && "border-success-base bg-success-base/5",
					domain.status === "verifying" &&
						"border-warning-base bg-warning-base/5",
					domain.status === "failed" && "border-error-base bg-error-base/5",
					!["active", "verifying", "failed"].includes(domain.status) &&
						"border-stroke-soft-200 bg-bg-weak-50",
				)}
			>
				<div
					className={cn(
						"relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors",
						domain.status === "active" &&
							"border-success-base bg-success-base/10 text-success-base",
						domain.status === "verifying" &&
							"border-warning-base bg-warning-base/10 text-warning-base",
						domain.status === "failed" &&
							"border-error-base bg-error-base/10 text-error-base",
						!["active", "verifying", "failed"].includes(domain.status) &&
							"border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600",
					)}
				>
					{domain.status === "verifying" ? (
						<Spinner size={16} color="currentColor" />
					) : domain.status === "active" ? (
						<Icon name="check-circle" className="relative h-4 w-4" />
					) : domain.status === "failed" ? (
						<Icon name="cross-circle" className="relative h-4 w-4" />
					) : (
						<Icon name="wifi" className="relative h-4 w-4" />
					)}
				</div>

				<div className="flex flex-col gap-0.5">
					<span className="font-semibold text-paragraph-sm text-text-strong-950">
						{banner.title}
					</span>
					<span className="text-[11px] text-text-sub-600">
						{banner.subtitle}
					</span>
				</div>
			</div>

			{/* Horizontal Timeline */}
			<div className="relative overflow-hidden rounded-2xl border-stroke-soft-200 border-t-[0.5px] border-r border-b border-l p-10">
				{/* Dot grid pattern - Light mode */}
				<div
					className="pointer-events-none absolute inset-0 dark:hidden"
					style={{
						backgroundImage:
							"radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.25) 0.8px, transparent 0)",
						backgroundSize: "20px 20px",
					}}
				/>
				{/* Dot grid pattern - Dark mode */}
				<div
					className="pointer-events-none absolute inset-0 hidden dark:block"
					style={{
						backgroundImage:
							"radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.3) 0.8px, transparent 0)",
						backgroundSize: "20px 20px",
					}}
				/>
				<div className="relative flex items-start">
					{steps.map((step, index) => {
						const state = getStepState(step.number);
						const isLast = index === steps.length - 1;

						return (
							<div
								key={step.number}
								className={cn(
									"flex items-start",
									isLast ? "flex-shrink-0" : "flex-1",
								)}
							>
								{/* Step */}
								<div className="flex flex-col items-center gap-2.5">
									{/* Circle */}
									<div
										className={cn(
											"relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-all duration-500",
											state === "completed" &&
												"border-success-base bg-success-base/10 text-success-base",
											state === "active" &&
												!isFailed &&
												"border-warning-base bg-warning-base/10 text-warning-base",
											state === "failed" &&
												"border-error-base bg-error-base/10 text-error-base",
											state === "upcoming" &&
												"border-stroke-soft-200 bg-bg-weak-50 text-text-soft-400",
										)}
									>
										{state === "failed" && (
											<span className="absolute inset-0 animate-ping rounded-full bg-error-base/20 [animation-duration:2.5s]" />
										)}

										{state === "completed" ? (
											<Icon name="check" className="relative h-3.5 w-3.5" />
										) : state === "failed" ? (
											<Icon name="cross" className="relative h-3.5 w-3.5" />
										) : state === "active" && domain.status === "verifying" ? (
											<Spinner size={14} color="currentColor" />
										) : (
											<Icon
												name={step.icon}
												className={cn(
													"relative h-3.5 w-3.5",
													state === "upcoming" && "opacity-40",
												)}
											/>
										)}
									</div>

									{/* Label + Timestamp */}
									<div className="flex flex-col items-center gap-1 text-center">
										<span
											className={cn(
												"font-medium text-xs transition-colors duration-300",
												state === "completed"
													? "text-text-strong-950"
													: state === "active" || state === "failed"
														? "text-text-strong-950"
														: "text-text-soft-400",
											)}
										>
											{step.label}
										</span>

										{step.timestamp && (
											<span className="text-[10px] text-text-soft-400">
												{step.timestamp}
											</span>
										)}
									</div>
								</div>

								{/* Connector Line */}
								{!isLast && (
									<div className="mt-[14px] flex flex-1 items-center px-2">
										<div className="relative h-[1px] w-full overflow-hidden rounded-full bg-stroke-soft-200">
											<div
												className={cn(
													"absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out",
													state === "completed"
														? "w-full bg-success-base"
														: state === "active" && !isFailed
															? "w-1/2 bg-warning-base"
															: state === "failed"
																? "w-1/2 bg-error-base"
																: "w-0",
												)}
											/>
											{state === "active" && !isFailed && (
												<div className="absolute inset-y-0 left-0 w-1/2 animate-pulse rounded-full bg-warning-base/20" />
											)}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};
