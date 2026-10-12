import { cn } from "@reloop/ui/cn";
import {
	Activity,
	BadgeCheck,
	Ban,
	Clock,
	Gauge,
	Mail,
	ShieldCheck,
	Wrench,
} from "lucide-react";
import { SectionHeading } from "../../components/section-heading";
import { FeatureGrid } from "./feature-grid";

export function WhatYouGet() {
	return (
		<FeatureGrid
			id="what-you-get"
			eyebrow="What you get"
			icon="star"
			title={["More than a score.", "The exact fixes."]}
			description="Free, no signup, and every report tells you what to change in your DNS, not just what's wrong."
			features={[
				{
					icon: Gauge,
					title: "0–100 score and grade",
					description:
						"One number for your sending domain's health, built from the signals mailbox providers check.",
				},
				{
					icon: Wrench,
					title: "Copy-paste DNS fixes",
					description:
						"Missing DMARC or a weak SPF? Get the exact record to add, with your existing settings kept.",
				},
				{
					icon: Mail,
					title: "Inbox provider check",
					description:
						"See which Gmail, Yahoo, Outlook, and iCloud sender rules your domain meets, for normal and bulk sending.",
				},
				{
					icon: BadgeCheck,
					title: "Shareable report & badge",
					description:
						"Send a link to your team, or embed a live reputation badge in your README or footer.",
				},
			]}
		/>
	);
}

export function HowWeScore() {
	return (
		<FeatureGrid
			id="how-we-score"
			eyebrow="How it works"
			icon="grid"
			title={["How we score", "your domain reputation"]}
			description="Four weighted pillars, read live from public DNS and RDAP every time you run a check."
			features={[
				{
					icon: ShieldCheck,
					figure: "35%",
					title: "Authentication",
					description:
						"SPF record and qualifier, a DKIM key on common selectors, and DMARC policy and coverage.",
				},
				{
					icon: Ban,
					figure: "30%",
					title: "Domain blocklists",
					description:
						"Live lookups on Spamhaus DBL, URIBL, SURBL, three Spam Eating Monkey lists, and NordSpam.",
				},
				{
					icon: Clock,
					figure: "20%",
					title: "Domain age",
					description:
						"Registration date from RDAP. Domains under 90 days old get filtered harder until they build history.",
				},
				{
					icon: Activity,
					figure: "15%",
					title: "DNS health",
					description:
						"MX records, A/AAAA resolution, redundant nameservers, and a valid TLS certificate.",
				},
			]}
		/>
	);
}

const AUDIENCES = [
	{
		title: "Founders & developers",
		items: [
			"Launching a new domain",
			"Emails landing in spam",
			"Before a product launch",
			"After changing ESPs",
			"Debugging bounces",
		],
	},
	{
		title: "Email marketers",
		items: [
			"Pre-campaign checks",
			"Open rates suddenly dropped",
			"Moving DMARC to reject",
			"Gmail, Outlook & iCloud rules",
			"Cold outreach domains",
		],
	},
	{
		title: "Agencies & IT",
		items: [
			"Client onboarding audits",
			"Domain migrations",
			"Monthly health reports",
			"Shareable client reports",
			"Many domains at once (API)",
		],
	},
	{
		title: "Security teams",
		items: [
			"Spoofing exposure",
			"Blocklist incidents",
			"Lookalike domain triage",
			"Vendor domain checks",
			"Compliance evidence",
		],
	},
];

export function WhoIsItFor() {
	return (
		<section
			id="who-is-it-for"
			aria-labelledby="who-is-it-for-heading"
			className="w-full"
		>
			<SectionHeading
				id="who-is-it-for-heading"
				eyebrow="Who is it for"
				icon="users"
				title={["When should you check", "your domain reputation?"]}
				description="Any time mail matters: before you send, when results drop, or when you set up a new domain."
			/>
			<div className="grid grid-cols-1 border-stroke-soft-100 border-b sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10">
				{AUDIENCES.map((column, index) => (
					<div
						key={column.title}
						className={cn(
							"border-stroke-soft-100 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 dark:border-white/10",
							index < AUDIENCES.length - 1 && "border-b lg:border-b-0",
							index % 2 === 0 && "sm:border-r",
							index === 1 && "lg:border-r",
							index >= 2 && "sm:border-b-0",
						)}
					>
						<h3 className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
							{column.title}
						</h3>
						<ul className="mt-4 space-y-2.5">
							{column.items.map((item) => (
								<li
									key={item}
									className="flex items-center gap-2.5 text-[14px] text-text-sub-600 dark:text-white/60"
								>
									<span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 dark:bg-white/[0.06]">
										<svg
											viewBox="0 0 12 12"
											className="size-2.5 text-text-strong-950 dark:text-white"
											aria-hidden
										>
											<path
												d="M2.5 6.2 5 8.5l4.5-5"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.8"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</span>
									{item}
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</section>
	);
}
