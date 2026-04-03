"use client";

import type { DomainResponse } from "@reloop/api";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { format } from "date-fns";

const WifiAnimatedIcon = ({ className }: { className?: string }) => (
	<svg viewBox="0 0 48 48" fill="none" className={className}>
		<style>{`
			@keyframes wifi-pendulum {
				0%, 100% { transform: rotate(-15deg); }
				50% { transform: rotate(15deg); }
			}
		`}</style>
		{/* WiFi arcs (static) */}
		<path
			d="M5.5 19.148C11.868 13.45 16.933 11.42 26.987 11.621"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M33.972 13.324C38.53 15 40.025 16.174 42.5 19.081"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M12.806 26.588C16.56 23.371 18.436 22.535 22.457 22.2"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M32.057 23.785C34.121 24.225 35.931 25.975 36.347 26.801"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		{/* Hand (pendulum) */}
		<path
			d="M20.179 33.358C18.269 37.782 26.212 40.195 27.418 35.101L31.976 10.701C32.012 10.121 30.731 9.766 30.434 10.3Z"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			fill="none"
			style={{
				transformOrigin: "24px 37px",
				animation: "wifi-pendulum 1.5s ease-in-out infinite",
			}}
		/>
	</svg>
);

export const DomainEvents = ({
	domain,
	providerLabel,
}: {
	domain: DomainResponse;
	providerLabel?: string | null;
}) => {
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
					"mt-8 mb-5 flex items-center gap-3 rounded-xl border p-4",
					domain.status === "active" && "border-success-base",
					domain.status === "verifying" && "border-warning-base",
					domain.status === "failed" && "border-error-base",
					!["active", "verifying", "failed"].includes(domain.status) &&
						"border-stroke-soft-200",
				)}
			>
				<div
					className={cn(
						"relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-stroke-soft-200",
						domain.status === "active"
							? "bg-bg-weak-50 text-text-strong-950"
							: "bg-bg-weak-50 text-text-sub-600 ring-stroke-soft-200 ring-inset",
					)}
				>
					{domain.status === "verifying" ? (
						<WifiAnimatedIcon className="relative h-4 w-4" />
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
			<div className="relative overflow-hidden rounded-2xl border-stroke-soft-200 border-t-[0.5px] border-r border-b border-l p-7">
				{/* Circuit board pattern - Light mode */}
				<div
					className="pointer-events-none absolute inset-0 dark:hidden"
					style={{
						backgroundImage: `
							repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(0, 0, 0, 0.04) 19px, rgba(0, 0, 0, 0.04) 20px, transparent 20px, transparent 39px, rgba(0, 0, 0, 0.04) 39px, rgba(0, 0, 0, 0.04) 40px),
							repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(0, 0, 0, 0.04) 19px, rgba(0, 0, 0, 0.04) 20px, transparent 20px, transparent 39px, rgba(0, 0, 0, 0.04) 39px, rgba(0, 0, 0, 0.04) 40px),
							radial-gradient(circle at 20px 20px, rgba(0, 0, 0, 0.05) 1.5px, transparent 1.5px),
							radial-gradient(circle at 40px 40px, rgba(0, 0, 0, 0.05) 1.5px, transparent 1.5px)
						`,
						backgroundSize: "40px 40px, 40px 40px, 40px 40px, 40px 40px",
					}}
				/>
				{/* Circuit board pattern - Dark mode */}
				<div
					className="pointer-events-none absolute inset-0 hidden dark:block"
					style={{
						backgroundImage: `
							repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255, 255, 255, 0.06) 19px, rgba(255, 255, 255, 0.06) 20px, transparent 20px, transparent 39px, rgba(255, 255, 255, 0.06) 39px, rgba(255, 255, 255, 0.06) 40px),
							repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255, 255, 255, 0.06) 19px, rgba(255, 255, 255, 0.06) 20px, transparent 20px, transparent 39px, rgba(255, 255, 255, 0.06) 39px, rgba(255, 255, 255, 0.06) 40px),
							radial-gradient(circle at 20px 20px, rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px),
							radial-gradient(circle at 40px 40px, rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)
						`,
						backgroundSize: "40px 40px, 40px 40px, 40px 40px, 40px 40px",
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
											"relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-stroke-soft-200 transition-all duration-500",
											state === "completed" &&
												"bg-neutral-alpha-10 text-text-strong-950",
											state === "active" &&
												!isFailed &&
												"bg-bg-weak-50 text-text-sub-600",
											state === "failed" &&
												"bg-neutral-alpha-10 text-text-sub-600",
											state === "upcoming" &&
												"bg-bg-weak-50 text-text-soft-400",
										)}
									>
										{state === "failed" && (
											<span className="absolute inset-0 animate-ping rounded-full bg-neutral-alpha-10 [animation-duration:2.5s]" />
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
														? "w-full bg-text-sub-600"
														: state === "active" && !isFailed
															? "w-1/2 bg-text-sub-600"
															: state === "failed"
																? "w-1/2 bg-text-sub-600"
																: "w-0",
												)}
											/>
											{state === "active" && !isFailed && (
												<div className="absolute inset-y-0 left-0 w-1/2 animate-pulse rounded-full bg-text-sub-600/20" />
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
