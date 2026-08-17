import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { hostedSignupHref, socialProfiles } from "@reloop/web/lib/site";
import Link from "next/link";

type ComparisonFeature = {
	label: string;
	selfHost: string | boolean;
	cloud: string | boolean;
};

type ComparisonCategory = {
	id: string;
	title: string;
	icon: string;
	features: ComparisonFeature[];
};

const CATEGORIES: ComparisonCategory[] = [
	{
		id: "deployment",
		title: "Deployment & Infrastructure",
		icon: "server",
		features: [
			{
				label: "100% Open Source (Apache 2.0)",
				selfHost: true,
				cloud: "Managed Cloud",
			},
			{
				label: "Data Residency & Sovereignty",
				selfHost: "100% On-Prem / VPC",
				cloud: "Global Multi-Region",
			},
			{
				label: "Volume Limits & Sending Caps",
				selfHost: "Unlimited (Your hardware)",
				cloud: "Tier-based quota",
			},
			{
				label: "Docker, Compose & Helm Charts",
				selfHost: true,
				cloud: "Fully Managed",
			},
		],
	},
	{
		id: "email",
		title: "Email Engine & Deliverability",
		icon: "mail-send",
		features: [
			{
				label: "SMTP Inbound & Submission",
				selfHost: "Port 25 / 587",
				cloud: "Port 25 / 587",
			},
			{
				label: "SPF, DKIM & DMARC Verification",
				selfHost: true,
				cloud: true,
			},
			{
				label: "Dedicated IP Warmup & Pools",
				selfHost: "—",
				cloud: "Automated by Reloop",
			},
			{
				label: "Live Webhooks & Event Delivery",
				selfHost: true,
				cloud: true,
			},
		],
	},
	{
		id: "agents-dev",
		title: "Developer & Agent Inbox",
		icon: "headset",
		features: [
			{
				label: "AI Agent Inboxes & MCP Protocol",
				selfHost: true,
				cloud: true,
			},
			{
				label: "React Email & Visual Templates",
				selfHost: true,
				cloud: true,
			},
			{
				label: "TypeScript SDKs & REST APIs",
				selfHost: true,
				cloud: true,
			},
			{
				label: "Auto Schema Migrations on Boot",
				selfHost: true,
				cloud: "Managed by Reloop",
			},
		],
	},
	{
		id: "operations",
		title: "Maintenance & Reliability",
		icon: "activity",
		features: [
			{
				label: "Database Backups & Scaling",
				selfHost: "—",
				cloud: "Automated & Zero DevOps",
			},
			{
				label: "High-Availability Multi-Region SLA",
				selfHost: "Configurable by your team",
				cloud: "99.99% Guaranteed SLA",
			},
			{
				label: "Automatic Updates & Security Patches",
				selfHost: "Git pull / Docker update",
				cloud: "Continuous zero-downtime",
			},
		],
	},
];

function RenderValue({ value }: { value: string | boolean }) {
	if (value === true) {
		return (
			<span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-text-strong-950 text-white dark:bg-white dark:text-black">
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

	if (value === false) {
		return (
			<span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-300 text-white dark:bg-white/20 dark:text-white">
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

	if (value === "-" || value === "—") {
		return (
			<span className="font-medium text-[16px] text-text-sub-600/70 dark:text-white/40">
				—
			</span>
		);
	}

	return (
		<span className="font-medium text-[13.5px] text-text-strong-950 sm:text-[14px] dark:text-white">
			{value}
		</span>
	);
}

export function SelfHostComparison() {
	return (
		<section className="w-full">
			<div className="border-stroke-soft-200 border-b px-6 py-12 text-center sm:px-8 sm:py-16 md:px-12 dark:border-white/10">
				<h2 className="font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl lg:text-4xl dark:text-white">
					Self-Hosted vs. Reloop Cloud
				</h2>
				<p className="mt-3 text-[14.5px] text-text-sub-600 sm:text-base dark:text-white/60">
					Same powerful API engine and modern UI, tailored to your deployment
					strategy.
				</p>
			</div>

			<div className="w-full overflow-x-auto">
				<div className="grid min-w-[640px] grid-cols-[minmax(240px,1.3fr)_minmax(180px,1fr)_minmax(180px,1fr)]">
					{/* Column Headers */}
					<div className="sticky top-0 z-30 border-stroke-soft-200 border-b bg-bg-white-0/95 p-5 backdrop-blur-md sm:p-6 dark:border-white/10 dark:bg-black/95">
						<span className="font-bold text-[13px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">
							Features & Capabilities
						</span>
					</div>

					<div className="sticky top-0 z-30 border-stroke-soft-200 border-x border-b bg-bg-weak-50/80 p-5 text-center backdrop-blur-md sm:p-6 dark:border-white/10 dark:bg-white/[0.04]">
						<div className="flex items-center justify-center gap-2">
							<span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400">
								<Logo className="size-4" />
							</span>
							<span className="font-bold text-[16px] text-text-strong-950 tracking-tight dark:text-white">
								Reloop Cloud
							</span>
							<span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 font-medium text-[10px] text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
								Managed
							</span>
						</div>
					</div>

					<div className="sticky top-0 z-30 border-stroke-soft-200 border-b bg-bg-white-0/95 p-5 text-center backdrop-blur-md sm:p-6 dark:border-white/10 dark:bg-black/95">
						<div className="flex items-center justify-center gap-2">
							<span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400">
								<Logo className="size-4" />
							</span>
							<span className="font-bold text-[16px] text-text-strong-950 tracking-tight dark:text-white">
								Self-Hosted
							</span>
							<span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-[10px] text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
								Open Source
							</span>
						</div>
					</div>

					{/* Category Blocks & Feature Rows */}
					{CATEGORIES.map((category) => (
						<div key={category.id} className="contents">
							{/* Category Header Row */}
							<div className="col-span-3 flex items-center gap-2.5 border-stroke-soft-200 border-b bg-bg-weak-50/60 px-5 py-3 sm:px-6 dark:border-white/10 dark:bg-white/[0.02]">
								<Icon
									name={category.icon}
									className="size-4 text-text-sub-600 dark:text-white/50"
								/>
								<span className="font-bold text-[12px] text-text-strong-950 uppercase tracking-wider dark:text-white">
									{category.title}
								</span>
							</div>

							{/* Category Feature Rows */}
							{category.features.map((feature) => (
								<div key={feature.label} className="contents">
									<div className="flex items-center border-stroke-soft-200 border-b px-5 py-4 font-medium text-[13.5px] text-text-strong-950 sm:px-6 sm:text-[14px] dark:border-white/10 dark:text-white">
										{feature.label}
									</div>
									<div className="flex items-center justify-center border-stroke-soft-200 border-x border-b bg-bg-weak-50/25 px-5 py-4 text-center dark:border-white/10 dark:bg-white/[0.01]">
										<RenderValue value={feature.cloud} />
									</div>
									<div className="flex items-center justify-center border-stroke-soft-200 border-b px-5 py-4 text-center dark:border-white/10">
										<RenderValue value={feature.selfHost} />
									</div>
								</div>
							))}
						</div>
					))}

					{/* Action Footer Row */}
					<div className="flex items-center border-stroke-soft-200 border-b bg-bg-weak-50/40 p-5 sm:p-6 dark:border-white/10 dark:bg-white/[0.02]">
						<span className="font-medium text-[13px] text-text-sub-600 dark:text-white/50">
							Ready to get started?
						</span>
					</div>
					<div className="flex items-center justify-center border-stroke-soft-200 border-x border-b bg-bg-weak-50/40 p-5 sm:p-6 dark:border-white/10 dark:bg-white/[0.02]">
						<Link
							href={hostedSignupHref}
							className="group inline-flex items-center gap-1.5 font-medium text-[13px] text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
						>
							<span>Start on Reloop Cloud</span>
							<Icon
								name="arrow-up-right"
								className="group-hover:-translate-y-0.5 size-3.5 rotate-45 transition-transform group-hover:translate-x-0.5"
							/>
						</Link>
					</div>
					<div className="flex items-center justify-center border-stroke-soft-200 border-b bg-bg-weak-50/40 p-5 sm:p-6 dark:border-white/10 dark:bg-white/[0.02]">
						<a
							href={socialProfiles.github}
							target="_blank"
							rel="noopener noreferrer"
							className="group inline-flex items-center gap-1.5 font-medium text-[13px] text-text-strong-950 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
						>
							<span>View GitHub Repo</span>
							<Icon
								name="arrow-up-right"
								className="group-hover:-translate-y-0.5 size-3.5 rotate-45 transition-transform group-hover:translate-x-0.5"
							/>
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
