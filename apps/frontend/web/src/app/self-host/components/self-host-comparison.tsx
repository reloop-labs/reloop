import { Icon } from "@reloop/ui/icon";
import { SectionTitle } from "@reloop/web/app/sdk/components/section-title";
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

function CloudCustomIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			className={className}
			aria-hidden="true"
		>
			<g data-transform-wrapper="on" transform="translate(24 0) scale(-1 1)">
				<g fill="none">
					<path
						d="M10.9999 2.625L8.10205 3.6666L10.2631 4.24287L12.04 5.2994L14.6333 8.61304L15.4977 12.3829L17.0105 13.2713L18.5472 15.5525L19.5557 18.1217L19.0995 21.1232L21.8486 19.5058L21.9809 17.625V15.5525L20.3496 12.7781L18.1546 11.1185L17.9999 10.625L17.4999 8.125L14.9999 4.625L12.9999 3.125L10.9999 2.625Z"
						fill="currentColor"
						fillOpacity="0.3"
					/>
					<path
						d="M7.19531 4.24103L8.73017 3.49552L9.4976 3.12284C10.5563 2.64504 11.6903 2.41133 13.1297 3.12284C15.8409 4.46303 18.0387 8.00586 18.0387 11.036C20.2981 12.1528 22.1297 15.1052 22.1297 17.6303C22.1297 18.4002 21.9594 19.0415 21.6586 19.5293C21.3491 20.0314 20.8016 20.315 20.2764 20.5834L18.3087 21.589"
						stroke="currentColor"
					/>
					<path d="M15.4507 12.1825L18.069 10.8733" stroke="currentColor" />
					<path
						d="M15.4191 21.4966L10.51 19.0699L5.60092 16.6433C3.34157 15.5265 1.51001 12.5741 1.51001 10.049C1.51001 7.52394 3.34157 6.38231 5.60092 7.49913C5.60092 4.46901 7.79879 3.09905 10.51 4.43924C13.2212 5.77943 15.4191 9.32226 15.4191 12.3524C17.6784 13.4692 19.51 16.4216 19.51 18.9467C19.51 21.4718 17.6784 22.6134 15.4191 21.4966Z"
						stroke="currentColor"
						strokeLinejoin="round"
					/>
				</g>
			</g>
		</svg>
	);
}

function ServerIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			className={className}
			aria-hidden="true"
		>
			<g data-transform-wrapper="on" transform="translate(24 0) scale(-1 1)">
				<g fill="none">
					<path
						d="M12 11L22 6V18L12 23V11Z"
						fill="currentColor"
						fillOpacity="0.3"
					/>
					<path d="M9 2.5L19 7.5V19.5" stroke="currentColor" />
					<path d="M2 10L12 15L22 10" stroke="currentColor" />
					<path d="M2 14L12 19L22 14" stroke="currentColor" />
					<path d="M12 11V23" stroke="currentColor" />
					<path
						d="M22 6L12.4472 10.7764C12.1657 10.9172 11.8343 10.9172 11.5528 10.7764L2 6"
						stroke="currentColor"
					/>
					<path
						d="M21.4472 5.72361L12.6708 1.33541C12.2485 1.12426 11.7515 1.12426 11.3292 1.33541L2.55279 5.72361C2.214 5.893 2 6.23926 2 6.61803V17.382C2 17.7607 2.214 18.107 2.55279 18.2764L11.3292 22.6646C11.7515 22.8757 12.2485 22.8757 12.6708 22.6646L21.4472 18.2764C21.786 18.107 22 17.7607 22 17.382V6.61803C22 6.23926 21.786 5.893 21.4472 5.72361Z"
						stroke="currentColor"
					/>
					<path d="M10 20H10.01" stroke="currentColor" strokeLinecap="round" />
					<path d="M10 16H10.01" stroke="currentColor" strokeLinecap="round" />
					<path d="M10 12H10.01" stroke="currentColor" strokeLinecap="round" />
					<path d="M4 9L5 9.5" stroke="currentColor" strokeLinecap="round" />
					<path d="M4 13L5 13.5" stroke="currentColor" strokeLinecap="round" />
					<path d="M4 17L5 17.5" stroke="currentColor" strokeLinecap="round" />
				</g>
			</g>
		</svg>
	);
}

export function SelfHostComparison() {
	return (
		<section id="compare" className="w-full">
			<SectionTitle
				title="Reloop Cloud vs Self-Hosted"
				icon={
					<CloudCustomIcon className="size-5 text-text-strong-950 dark:text-white" />
				}
			/>

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
								<CloudCustomIcon className="size-4" />
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
								<ServerIcon className="size-4" />
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
