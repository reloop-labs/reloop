"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { siCloudflare } from "simple-icons";
import type { DemoDomain } from "../_shared/data";
import { DnsRecordTable } from "../_shared/dns-record-table";
import {
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
} from "../_shared/status";

function StatusTimeline({ domain }: { domain: DemoDomain }) {
	const currentStep = domain.status === "verifying" ? 2 : 1;
	const steps = [
		{
			number: 1,
			label: "Domain Added",
			icon: "globe",
			state: "completed" as const,
		},
		{
			number: 2,
			label: domain.status === "verifying" ? "Verifying DNS" : "Start verification",
			icon: domain.status === "verifying" ? "scan" : "question",
			state:
				currentStep === 2 ? ("active" as const) : ("upcoming" as const),
		},
		{
			number: 3,
			label: "Ready to Send",
			icon: "mail-single",
			state: "upcoming" as const,
		},
	];

	return (
		<div className="relative mx-auto flex w-full max-w-md items-start gap-0">
			{steps.map((step, index) => {
				const isLast = index === steps.length - 1;
				return (
					<div
						key={step.number}
						className={cn("relative flex items-start", !isLast && "flex-1")}
					>
						<div className="flex flex-col gap-3">
							<div className="flex items-center">
								<div
									className={cn(
										"relative z-10 flex size-10 shrink-0 items-center justify-center rounded-[14px] border bg-bg-white-0",
										step.state === "completed" &&
											"border-success-base text-success-base",
										step.state === "active" &&
											"border-warning-base text-warning-base",
										step.state === "upcoming" &&
											"border-stroke-soft-200 text-text-soft-400",
									)}
								>
									<div
										className={cn(
											"absolute inset-0 rounded-[14px]",
											step.state === "completed" && "bg-success-base/10",
											step.state === "active" && "bg-warning-base/10",
										)}
									/>
									<Icon name={step.icon} className="relative z-10 h-4 w-4" />
								</div>
								{!isLast && (
									<div
										className={cn(
											"h-px flex-1 bg-stroke-soft-200",
											step.state === "completed" && "bg-success-base/40",
										)}
									/>
								)}
							</div>
							<div>
								<p className="font-medium text-[12px] text-text-strong-950">
									{step.label}
								</p>
							</div>
						</div>
						{!isLast && (
							<div className="mt-5 h-px min-w-6 flex-1 bg-stroke-soft-200 dark:bg-stroke-soft-100/40" />
						)}
					</div>
				);
			})}
		</div>
	);
}

export function DomainDetailPage({ domain }: { domain: DemoDomain }) {
	const dkimRecords = domain.dnsRecords.filter(
		(record) => record.recordTypeName === "DKIM",
	);
	const sendingRecords = domain.dnsRecords.filter(
		(record) => record.recordTypeName === "SPF",
	);
	const dmarcRecords = domain.dnsRecords.filter(
		(record) => record.recordTypeName === "DMARC",
	);

	const bannerMessage =
		domain.status === "verifying"
			? "Your domain is being verified — this can take a few hours depending on your DNS provider."
			: "Almost there! Add the DNS records shown below, then click Verify — and you'll be ready to send.";

	return (
		<div className="mx-auto max-w-3xl space-y-8 p-6 lg:p-8">
			<div className="flex items-center justify-between">
				<div className="flex min-w-0 items-center gap-3">
					<div
						className={cn(
							"flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border",
							domain.status === "verifying"
								? "border-warning-base/25 bg-warning-base/10"
								: "border-stroke-soft-200 bg-bg-weak-50",
						)}
					>
						<Icon
							name="globe"
							className={cn(
								"h-5 w-5",
								getStatusColorClass(domain.status),
							)}
						/>
					</div>
					<div className="min-w-0">
						<p className="font-medium text-paragraph-xs text-text-sub-600">
							Domain
						</p>
						<h1 className="mb-0.5 font-semibold text-title-h6 leading-5">
							{domain.domain}
						</h1>
					</div>
				</div>
				<FancyButton.Root
					variant="blue"
					size="xsmall"
					tabIndex={-1}
					className="font-medium"
				>
					{domain.status === "verifying" ? "Verifying..." : "Verify Domain"}
				</FancyButton.Root>
			</div>

			<div className="mt-7 grid grid-cols-3 gap-x-12 gap-y-6">
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="calendar" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Created
						</span>
					</div>
					<span className="font-medium text-paragraph-sm text-text-strong-950">
						{domain.createdAtLabel}
					</span>
				</div>
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="activity" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Status
						</span>
					</div>
					<div
						className={cn(
							"flex items-center gap-1",
							getStatusColorClass(domain.status),
						)}
					>
						<Icon
							name={getStatusIcon(domain.status)}
							className="h-3.5 w-3.5"
						/>
						<p className="font-medium text-paragraph-xs capitalize">
							{getStatusLabel(domain.status)}
						</p>
					</div>
				</div>
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="globe" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Provider
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span
							className="flex h-3.5 w-3.5 items-center justify-center [&>svg]:h-full [&>svg]:w-full"
							style={{ fill: `#${siCloudflare.hex}` }}
							dangerouslySetInnerHTML={{ __html: siCloudflare.svg }}
						/>
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							Cloudflare
						</span>
					</div>
				</div>
			</div>

			<div className="mt-7 flex flex-col gap-6 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/50 p-6 dark:border-stroke-soft-100/40">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-1.5">
						<Icon name="activity" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Status Timeline
						</span>
					</div>
					<p className="font-medium text-paragraph-sm text-text-strong-950">
						{bannerMessage}
					</p>
				</div>
				<div className="h-[1px] w-full bg-stroke-soft-200 dark:bg-stroke-soft-100/40" />
				<StatusTimeline domain={domain} />
			</div>

			<div className="mt-7">
				<div className="relative flex h-12 items-center gap-0 border-stroke-soft-200 border-b dark:border-white/10">
					<button
						type="button"
						tabIndex={-1}
						className="flex items-center gap-2 px-3 font-medium text-sm text-text-strong-950"
					>
						<Icon name="file-text" className="h-4 w-4" />
						DNS Records
					</button>
					<button
						type="button"
						tabIndex={-1}
						className="flex items-center gap-2 px-3 font-medium text-sm text-text-sub-600"
					>
						<Icon name="sliders-horiz-2" className="h-4 w-4" />
						Configuration
					</button>
				</div>

				<div className="mt-6 mb-24 flex flex-col space-y-6">
					<div className="rounded-2xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/10">
						<div className="mb-4 flex items-center gap-2 text-base text-text-strong-950">
							<Icon name="shield" className="h-4 w-4 text-text-sub-600" />
							<h3 className="font-semibold">Domain Verification</h3>
						</div>
						<DnsRecordTable records={dkimRecords} />
					</div>
					<div className="rounded-2xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/10">
						<div className="mb-4 flex items-center gap-2 text-base text-text-strong-950">
							<Icon name="mail-send" className="h-4 w-4 text-text-sub-600" />
							<h3 className="font-semibold">Email Sending</h3>
						</div>
						<DnsRecordTable records={sendingRecords} />
						{dmarcRecords.length > 0 && (
							<div className="mt-7">
								<DnsRecordTable records={dmarcRecords} />
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
