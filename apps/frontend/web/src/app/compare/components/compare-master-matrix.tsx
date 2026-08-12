"use client";

import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";
import { competitorBrands } from "../competitor-brands";
import { BrandIcon } from "./brand-icon";

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
				reloop: "10,000 / mo",
				resend: "3,000 / mo",
				sendgrid: "100 / day",
				postmark: "100 / mo",
				awsSes: "EC2 62k / mo",
			},
			{
				feature: "Cost per 100,000 Emails",
				detail: "Standard cloud sending cost",
				reloop: "$9.00",
				resend: "$90.00",
				sendgrid: "$89.95",
				postmark: "$115.00",
				awsSes: "$10.00 + Data",
			},
			{
				feature: "Dedicated IP Pricing",
				detail: "Monthly dedicated IP cost",
				reloop: "Included on Pro",
				resend: "$30 / mo",
				sendgrid: "$30 / mo",
				postmark: "$50 / mo",
				awsSes: "$24.95 / mo",
			},
		],
	},
];

function RenderCellValue({ value }: { value: string | boolean }) {
	if (value === true || value === "Yes") {
		return (
			<div className="flex items-center justify-center gap-1.5 text-center">
				<span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-text-strong-950 text-white dark:bg-white dark:text-black">
					✓
				</span>
				<span className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
					Yes
				</span>
			</div>
		);
	}

	if (value === false || value === "No") {
		return (
			<div className="flex items-center justify-center gap-1.5 text-center">
				<span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-700 dark:bg-white/20 dark:text-white">
					✕
				</span>
				<span className="text-[13px] text-text-sub-600 dark:text-white/40">
					No
				</span>
			</div>
		);
	}

	return (
		<span className="font-mono font-medium text-[13px] text-text-strong-950 dark:text-white">
			{value}
		</span>
	);
}

export function CompareMasterMatrix() {
	const resendIcon = competitorBrands.find((b) => b.name === "Resend")?.icon;
	const sendgridIcon = competitorBrands.find((b) => b.name === "SendGrid")?.icon;
	const postmarkIcon = competitorBrands.find((b) => b.name === "Postmark")?.icon;
	const awsIcon = competitorBrands.find((b) => b.name === "AWS SES")?.icon;

	return (
		<div className="w-full space-y-6">
			<div className="text-center">
				<span className="font-bold text-[12px] text-text-sub-600 uppercase tracking-widest dark:text-white/50">
					Comprehensive Feature Breakdown
				</span>
				<h2 className="mt-2 font-serif text-[2rem] text-text-strong-950 leading-tight tracking-tight sm:text-[2.5rem] dark:text-white">
					Master Feature & Specs Matrix
				</h2>
				<p className="mx-auto mt-2 max-w-xl text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
					Compare key capabilities, delivery infrastructure, and pricing limits
					side-by-side.
				</p>
			</div>

			<div className="w-full overflow-x-auto rounded-3xl border border-stroke-soft-200/80 bg-bg-white-0 shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
				<table className="w-full min-w-[760px] border-collapse text-left">
					<thead>
						<tr className="border-stroke-soft-200 border-b bg-bg-weak-50/60 dark:border-white/10 dark:bg-white/[0.03]">
							<th className="p-4 sm:p-5 font-bold text-[13px] text-text-sub-600 uppercase tracking-wider dark:text-white/50 w-[30%]">
								Capability
							</th>
							<th className="p-4 sm:p-5 text-center bg-bg-weak-50/90 dark:bg-white/[0.06] border-x border-stroke-soft-200/80 dark:border-white/10 w-[18%]">
								<div className="flex flex-col items-center justify-center gap-1">
									<div className="flex items-center gap-1.5">
										<span className="flex size-6 items-center justify-center rounded-md bg-text-strong-950 text-white dark:bg-white dark:text-black">
											<Logo className="size-3.5" />
										</span>
										<span className="font-bold text-[15px] text-text-strong-950 dark:text-white">
											Reloop
										</span>
									</div>
									<span className="rounded-full bg-text-strong-950/10 px-2 py-0.5 font-bold font-mono text-[10px] text-text-strong-950 dark:bg-white/10 dark:text-white">
										Open Source
									</span>
								</div>
							</th>
							<th className="p-4 sm:p-5 text-center w-[13%]">
								<div className="flex flex-col items-center justify-center gap-1">
									{resendIcon ? (
										<BrandIcon icon={resendIcon} className="size-4" />
									) : null}
									<span className="font-bold text-[14px] text-text-strong-950 dark:text-white">
										Resend
									</span>
								</div>
							</th>
							<th className="p-4 sm:p-5 text-center w-[13%]">
								<div className="flex flex-col items-center justify-center gap-1">
									{sendgridIcon ? (
										<BrandIcon icon={sendgridIcon} className="size-4" />
									) : null}
									<span className="font-bold text-[14px] text-text-strong-950 dark:text-white">
										SendGrid
									</span>
								</div>
							</th>
							<th className="p-4 sm:p-5 text-center w-[13%]">
								<div className="flex flex-col items-center justify-center gap-1">
									{postmarkIcon ? (
										<BrandIcon icon={postmarkIcon} className="size-4" />
									) : null}
									<span className="font-bold text-[14px] text-text-strong-950 dark:text-white">
										Postmark
									</span>
								</div>
							</th>
							<th className="p-4 sm:p-5 text-center w-[13%]">
								<div className="flex flex-col items-center justify-center gap-1">
									{awsIcon ? (
										<BrandIcon icon={awsIcon} className="size-4" />
									) : null}
									<span className="font-bold text-[14px] text-text-strong-950 dark:text-white">
										AWS SES
									</span>
								</div>
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-stroke-soft-200/80 dark:divide-white/10">
						{MASTER_CATEGORIES.map((cat) => (
							<tr key={cat.category} className="contents">
								<tr className="bg-bg-weak-50/40 dark:bg-white/[0.02]">
									<td
										colSpan={6}
										className="p-3 sm:px-5 font-bold text-[12px] text-text-strong-950 uppercase tracking-widest dark:text-white border-stroke-soft-200 border-t border-b dark:border-white/10"
									>
										{cat.category}
									</td>
								</tr>

								{cat.rows.map((row) => (
									<tr
										key={row.feature}
										className="hover:bg-bg-weak-50/30 dark:hover:bg-white/[0.01] transition-colors"
									>
										<td className="p-4 sm:p-5">
											<p className="font-medium text-[14px] text-text-strong-950 dark:text-white">
												{row.feature}
											</p>
											{row.detail ? (
												<p className="text-[12px] text-text-sub-600 dark:text-white/50">
													{row.detail}
												</p>
											) : null}
										</td>
										<td className="p-4 sm:p-5 text-center bg-bg-weak-50/60 dark:bg-white/[0.03] border-x border-stroke-soft-200/80 dark:border-white/10">
											<RenderCellValue value={row.reloop} />
										</td>
										<td className="p-4 sm:p-5 text-center">
											<RenderCellValue value={row.resend} />
										</td>
										<td className="p-4 sm:p-5 text-center">
											<RenderCellValue value={row.sendgrid} />
										</td>
										<td className="p-4 sm:p-5 text-center">
											<RenderCellValue value={row.postmark} />
										</td>
										<td className="p-4 sm:p-5 text-center">
											<RenderCellValue value={row.awsSes} />
										</td>
									</tr>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
