"use client";

import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";
import React from "react";
import { competitorBrands } from "../competitor-brands";
import { BrandIcon } from "./brand-icon";
import { CompareTitleIcon } from "./compare-title-icon";

interface FeatureRow {
	feature: string;
	detail?: string;
	reloop: string | boolean;
	resend: string | boolean;
	sendgrid: string | boolean;
	postmark: string | boolean;
	awsSes: string | boolean;
}

interface MatrixCategory {
	category: string;
	rows: FeatureRow[];
}

const MASTER_CATEGORIES: MatrixCategory[] = [
	{
		category: "Architecture & Open Source",
		rows: [
			{
				feature: "Open Source Engine",
				detail: "Core sending engine codebase",
				reloop: "Yes (KumoMTA)",
				resend: false,
				sendgrid: false,
				postmark: false,
				awsSes: false,
			},
			{
				feature: "Self-Hosting Capability",
				detail: "Deploy on your own K8s / Docker",
				reloop: "Yes",
				resend: false,
				sendgrid: false,
				postmark: false,
				awsSes: false,
			},
			{
				feature: "Data Sovereignty",
				detail: "Complete data control & EU residency",
				reloop: "Yes",
				resend: "Cloud only",
				sendgrid: "Cloud only",
				postmark: "Cloud only",
				awsSes: "AWS Regions",
			},
			{
				feature: "Bring Your Own IPs / SMTP",
				detail: "Plug custom sending IPs",
				reloop: "Yes",
				resend: "Enterprise only",
				sendgrid: "Pro Plan",
				postmark: "Dedicated Plan",
				awsSes: "Yes",
			},
		],
	},
	{
		category: "Unified Stack & Features",
		rows: [
			{
				feature: "Transactional Email API",
				detail: "REST & SMTP relays",
				reloop: "Yes",
				resend: "Yes",
				sendgrid: "Yes",
				postmark: "Yes",
				awsSes: "Yes",
			},
			{
				feature: "Marketing & Broadcast Campaigns",
				detail: "Unified contacts & newsletters",
				reloop: "Yes",
				resend: "Basic",
				sendgrid: "Separate Add-on",
				postmark: "Separate Stream",
				awsSes: "No",
			},
			{
				feature: "Inbound AI Agent Inbox",
				detail: "Auto-parse & AI agent responses",
				reloop: "Yes",
				resend: false,
				sendgrid: false,
				postmark: false,
				awsSes: false,
			},
			{
				feature: "React / JSX Email Templates",
				detail: "Code-native template render",
				reloop: "Yes",
				resend: "Yes",
				sendgrid: "No (HTML/Handlebars)",
				postmark: "No (Mustache)",
				awsSes: "No",
			},
		],
	},
	{
		category: "Pricing & Scale Economics",
		rows: [
			{
				feature: "Free Tier Allowance",
				detail: "Free monthly sending credit",
				reloop: "3,000 / mo · 200 / day",
				resend: "3,000 / mo",
				sendgrid: "100 / day",
				postmark: "100 / mo",
				awsSes: "EC2 62k / mo",
			},
			{
				feature: "Cost per 100,000 Emails",
				detail: "Hosted Reloop Startup ($20) + $0.80/1k overage",
				reloop: "$60",
				resend: "$90.00",
				sendgrid: "$89.95",
				postmark: "$115.00",
				awsSes: "$10.00 + Data",
			},
			{
				feature: "Dedicated IP Pricing",
				detail: "Monthly dedicated IP cost",
				reloop: "Enterprise (optional)",
				resend: "$30 / mo",
				sendgrid: "$30 / mo",
				postmark: "$50 / mo",
				awsSes: "$24.95 / mo",
			},
		],
	},
];

function CheckCircleIcon() {
	return (
		<span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-text-strong-950 text-white shadow-sm dark:bg-white dark:text-black">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="size-3"
				aria-hidden="true"
			>
				<polyline points="20 6 9 17 4 12" />
			</svg>
		</span>
	);
}

function CrossCircleIcon() {
	return (
		<span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-400/80 text-white dark:bg-white/20 dark:text-white">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="size-3"
				aria-hidden="true"
			>
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</span>
	);
}

function RenderCellValue({ value }: { value: string | boolean }) {
	if (value === true || value === "Yes") {
		return (
			<div className="flex items-center justify-center gap-1.5 text-center">
				<CheckCircleIcon />
				<span className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
					Yes
				</span>
			</div>
		);
	}

	if (value === false || value === "No") {
		return (
			<div className="flex items-center justify-center gap-1.5 text-center">
				<CrossCircleIcon />
				<span className="text-[13px] text-text-sub-600 dark:text-white/40">
					No
				</span>
			</div>
		);
	}

	if (typeof value === "string") {
		const str = value.trim();
		if (str.startsWith("Yes")) {
			const extra = str.replace(/^Yes[\s(-]*/i, "").replace(/\)$/, "");
			return (
				<div className="flex flex-col items-center justify-center gap-1 text-center">
					<div className="flex items-center justify-center gap-1.5">
						<CheckCircleIcon />
						<span className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
							Yes
						</span>
					</div>
					{extra ? (
						<span className="font-medium text-[11px] text-text-sub-600 dark:text-white/50">
							({extra})
						</span>
					) : null}
				</div>
			);
		}

		if (str.startsWith("No")) {
			const extra = str.replace(/^No[\s(-]*/i, "").replace(/\)$/, "");
			return (
				<div className="flex flex-col items-center justify-center gap-1 text-center">
					<div className="flex items-center justify-center gap-1.5">
						<CrossCircleIcon />
						<span className="text-[13px] text-text-sub-600 dark:text-white/40">
							No
						</span>
					</div>
					{extra ? (
						<span className="text-[11px] text-text-sub-600 dark:text-white/40">
							({extra})
						</span>
					) : null}
				</div>
			);
		}
	}

	return (
		<span className="font-medium font-mono text-[13px] text-text-strong-950 dark:text-white">
			{value}
		</span>
	);
}

export function CompareMasterMatrix() {
	const resendIcon = competitorBrands.find((b) => b.name === "Resend")?.icon;
	const sendgridIcon = competitorBrands.find(
		(b) => b.name === "SendGrid",
	)?.icon;
	const postmarkIcon = competitorBrands.find(
		(b) => b.name === "Postmark",
	)?.icon;
	const awsIcon = competitorBrands.find((b) => b.name === "AWS SES")?.icon;

	return (
		<div className="w-full">
			{/* Left-Aligned Header matching ComparisonGrid & CompareCalculator style with bottom border */}
			<div className="-mx-6 -mt-12 sm:-mx-10 sm:-mt-16 lg:-mx-12 border-stroke-soft-200 border-b px-6 pt-12 pb-8 sm:px-10 sm:pt-16 sm:pb-10 lg:px-12 dark:border-white/10">
				<div className="flex flex-col items-start gap-2.5">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="size-5 text-text-strong-950 dark:text-white"
						aria-hidden="true"
					>
						<g opacity="0.12">
							<path
								d="M2 17.2C2 16.0799 2 15.5198 2.21799 15.092C2.40973 14.7157 2.71569 14.4097 3.09202 14.218C3.51984 14 4.0799 14 5.2 14H6.8C7.9201 14 8.48016 14 8.90798 14.218C9.28431 14.4097 9.59027 14.7157 9.78201 15.092C10 15.5198 10 16.0799 10 17.2V18.8C10 19.9201 10 20.4802 9.78201 20.908C9.59027 21.2843 9.28431 21.5903 8.90798 21.782C8.48016 22 7.9201 22 6.8 22H5.2C4.0799 22 3.51984 22 3.09202 21.782C2.71569 21.5903 2.40973 21.2843 2.21799 20.908C2 20.4802 2 19.9201 2 18.8V17.2Z"
								fill="currentColor"
							/>
							<path
								d="M14 17.2C14 16.0799 14 15.5198 14.218 15.092C14.4097 14.7157 14.7157 14.4097 15.092 14.218C15.5198 14 16.0799 14 17.2 14H18.8C19.9201 14 20.4802 14 20.908 14.218C21.2843 14.4097 21.5903 14.7157 21.782 15.092C22 15.5198 22 16.0799 22 17.2V18.8C22 19.9201 22 20.4802 21.782 20.908C21.5903 21.2843 21.2843 21.5903 20.908 21.782C20.4802 22 19.9201 22 18.8 22H17.2C16.0799 22 15.5198 22 15.092 21.782C14.7157 21.5903 14.4097 21.2843 14.218 20.908C14 20.4802 14 19.9201 14 18.8V17.2Z"
								fill="currentColor"
							/>
						</g>
						<path
							d="M14 6H18M18 6H22M18 6V10M18 6V2M17.2 22H18.8C19.9201 22 20.4802 22 20.908 21.782C21.2843 21.5903 21.5903 21.2843 21.782 20.908C22 20.4802 22 19.9201 22 18.8V17.2C22 16.0799 22 15.5198 21.782 15.092C21.5903 14.7157 21.2843 14.4097 20.908 14.218C20.4802 14 19.9201 14 18.8 14H17.2C16.0799 14 15.5198 14 15.092 14.218C14.7157 14.4097 14.4097 14.7157 14.218 15.092C14 15.5198 14 16.0799 14 17.2V18.8C14 19.9201 14 20.4802 14.218 20.908C14.4097 21.2843 14.7157 21.5903 15.092 21.782C15.5198 22 16.0799 22 17.2 22ZM5.2 22H6.8C7.92011 22 8.48016 22 8.90798 21.782C9.28431 21.5903 9.59027 21.2843 9.78201 20.908C10 20.4802 10 19.9201 10 18.8V17.2C10 16.0799 10 15.5198 9.78201 15.092C9.59027 14.7157 9.28431 14.4097 8.90798 14.218C8.48016 14 7.92011 14 6.8 14H5.2C4.07989 14 3.51984 14 3.09202 14.218C2.71569 14.4097 2.40973 14.7157 2.21799 15.092C2 15.5198 2 16.0799 2 17.2V18.8C2 19.9201 2 20.4802 2.21799 20.908C2.40973 21.2843 2.71569 21.5903 3.09202 21.782C3.51984 22 4.07989 22 5.2 22ZM5.2 10H6.8C7.92011 10 8.48016 10 8.90798 9.78201C9.28431 9.59027 9.59027 9.28431 9.78201 8.90798C10 8.48016 10 7.92011 10 6.8V5.2C10 4.07989 10 3.51984 9.78201 3.09202C9.59027 2.71569 9.28431 2.40973 8.90798 2.21799C8.48016 2 7.92011 2 6.8 2H5.2C4.07989 2 3.51984 2 3.09202 2.21799C2.71569 2.40973 2.40973 2.71569 2.21799 3.09202C2 3.51984 2 4.07989 2 5.2V6.8C2 7.92011 2 8.48016 2.21799 8.90798C2.40973 9.28431 2.71569 9.59027 3.09202 9.78201C3.51984 10 4.07989 10 5.2 10Z"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						Feature Comparison
					</h2>
				</div>
			</div>

			<div className="-mx-6 sm:-mx-10 lg:-mx-12 overflow-x-auto">
				<table className="w-full min-w-[760px] border-collapse text-left">
					<thead>
						<tr className="sticky top-16 z-30 border-stroke-soft-200 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
							<th className="w-[30%] p-4 pl-6 font-bold text-[13px] text-text-sub-600 uppercase tracking-wider sm:p-5 sm:pl-10 lg:pl-12 dark:text-white/50">
								Capability
							</th>
							<th className="w-[18%] border-stroke-soft-200/80 border-x bg-bg-weak-50/80 p-4 text-center sm:p-5 dark:border-white/10 dark:bg-white/[0.04]">
								<div className="flex flex-col items-center justify-center gap-1.5">
									<div className="flex items-center justify-center gap-2">
										<span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm dark:bg-white">
											<Logo className="size-full text-text-strong-950" />
										</span>
										<span className="font-bold text-[16px] text-text-strong-950 tracking-tight dark:text-white">
											Reloop
										</span>
									</div>
									<span className="rounded-full bg-text-strong-950/10 px-2.5 py-0.5 font-bold font-mono text-[10px] text-text-strong-950 dark:bg-white/10 dark:text-white">
										Open Source
									</span>
								</div>
							</th>
							<th className="w-[13%] p-4 text-center sm:p-5">
								<div className="flex flex-col items-center justify-center gap-1.5">
									<div className="flex items-center justify-center gap-2">
										{resendIcon ? (
											<span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm dark:bg-white">
												<BrandIcon icon={resendIcon} className="size-4" />
											</span>
										) : null}
										<span className="font-bold text-[15px] text-text-strong-950 dark:text-white">
											Resend
										</span>
									</div>
								</div>
							</th>
							<th className="w-[13%] p-4 text-center sm:p-5">
								<div className="flex flex-col items-center justify-center gap-1.5">
									<div className="flex items-center justify-center gap-2">
										{sendgridIcon ? (
											<span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm dark:bg-white">
												<BrandIcon icon={sendgridIcon} className="size-4" />
											</span>
										) : null}
										<span className="font-bold text-[15px] text-text-strong-950 dark:text-white">
											SendGrid
										</span>
									</div>
								</div>
							</th>
							<th className="w-[13%] p-4 text-center sm:p-5">
								<div className="flex flex-col items-center justify-center gap-1.5">
									<div className="flex items-center justify-center gap-2">
										{postmarkIcon ? (
											<span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm dark:bg-white">
												<BrandIcon icon={postmarkIcon} className="size-4" />
											</span>
										) : null}
										<span className="font-bold text-[15px] text-text-strong-950 dark:text-white">
											Postmark
										</span>
									</div>
								</div>
							</th>
							<th className="w-[13%] p-4 pr-6 text-center sm:p-5 sm:pr-10 lg:pr-12">
								<div className="flex flex-col items-center justify-center gap-1.5">
									<div className="flex items-center justify-center gap-2">
										{awsIcon ? (
											<span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm dark:bg-white">
												<BrandIcon icon={awsIcon} className="size-4" />
											</span>
										) : null}
										<span className="font-bold text-[15px] text-text-strong-950 dark:text-white">
											AWS SES
										</span>
									</div>
								</div>
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-stroke-soft-200/80 dark:divide-white/10">
						{MASTER_CATEGORIES.map((cat) => (
							<React.Fragment key={cat.category}>
								<tr className="bg-bg-weak-50/60 dark:bg-white/[0.03]">
									<td
										colSpan={6}
										className="border-stroke-soft-200 border-t border-b p-3.5 pl-6 sm:px-5 sm:pl-10 lg:pl-12 dark:border-white/10"
									>
										<div className="flex items-center gap-2.5">
											<CompareTitleIcon title={cat.category} isSection />
											<span className="font-bold text-[12px] text-text-strong-950 uppercase tracking-widest dark:text-white">
												{cat.category}
											</span>
										</div>
									</td>
								</tr>

								{cat.rows.map((row) => (
									<tr
										key={row.feature}
										className="transition-colors hover:bg-bg-weak-50/30 dark:hover:bg-white/[0.01]"
									>
										<td className="p-4 pl-6 sm:p-5 sm:pl-10 lg:pl-12">
											<div className="flex items-start gap-2.5">
												<CompareTitleIcon
													title={row.feature}
													className="mt-0.5"
												/>
												<div className="flex min-w-0 flex-col">
													<p className="font-medium text-[14px] text-text-strong-950 dark:text-white">
														{row.feature}
													</p>
													{row.detail ? (
														<p className="text-[12px] text-text-sub-600 dark:text-white/50">
															{row.detail}
														</p>
													) : null}
												</div>
											</div>
										</td>
										<td className="border-stroke-soft-200/80 border-x bg-bg-weak-50/60 p-4 text-center sm:p-5 dark:border-white/10 dark:bg-white/[0.03]">
											<RenderCellValue value={row.reloop} />
										</td>
										<td className="p-4 text-center sm:p-5">
											<RenderCellValue value={row.resend} />
										</td>
										<td className="p-4 text-center sm:p-5">
											<RenderCellValue value={row.sendgrid} />
										</td>
										<td className="p-4 text-center sm:p-5">
											<RenderCellValue value={row.postmark} />
										</td>
										<td className="p-4 pr-6 text-center sm:p-5 sm:pr-10 lg:pr-12">
											<RenderCellValue value={row.awsSes} />
										</td>
									</tr>
								))}
							</React.Fragment>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
