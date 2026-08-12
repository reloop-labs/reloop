"use client";

import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";
import { useState } from "react";
import { competitorBrands } from "../competitor-brands";
import { BrandIcon } from "./brand-icon";

interface ProviderSnapshot {
	name: string;
	href: string;
	tagline: string;
	keyDiff: string;
	reloopAdvantages: string[];
	competitorDrawbacks: string[];
	freeTier: { reloop: string; competitor: string };
	openSource: { reloop: string; competitor: string };
	inboundAi: { reloop: string; competitor: string };
}

const SPOTLIGHT_DATA: Record<string, ProviderSnapshot> = {
	Resend: {
		name: "Resend",
		href: "/compare/resend",
		tagline: "Modern UI email API, but proprietary & gets expensive at scale",
		keyDiff:
			"Reloop provides open-source transparency (KumoMTA engine), 10x lower volume cost, and built-in AI agent inboxes.",
		reloopAdvantages: [
			"100% Open source core (KumoMTA)",
			"Built-in AI agent inbox & email parsing",
			"Self-host anywhere or use Reloop Cloud",
			"10x lower overage costs at high volume",
		],
		competitorDrawbacks: [
			"Closed-source proprietary backend",
			"No native self-hosting option",
			"Costs escalate rapidly above 100k emails/mo",
			"Requires third-party tools for inbound AI logic",
		],
		freeTier: { reloop: "10,000 emails / mo", competitor: "3,000 emails / mo" },
		openSource: { reloop: "Yes (KumoMTA Engine)", competitor: "No (Proprietary)" },
		inboundAi: { reloop: "Built-in Agent Inbox", competitor: "Webhooks only" },
	},
	SendGrid: {
		name: "SendGrid",
		href: "/compare/sendgrid",
		tagline: "Legacy email service with complex UI and legacy pricing models",
		keyDiff:
			"Reloop offers a developer-first React/JSX experience, clean modern UI, and modern deliverability controls without complex legacy enterprise upsells.",
		reloopAdvantages: [
			"Modern developer-first API & React email support",
			"Clean, fast dashboard UI without clutter",
			"Transparent pricing without seat lock-in",
			"Native inbound agent workflows",
		],
		competitorDrawbacks: [
			"Dated admin UI and complex setup",
			"Legacy IP warm-up rules & hidden limits",
			"Strict account locks & slow support",
			"Expensive dedicated IP add-ons",
		],
		freeTier: { reloop: "10,000 emails / mo", competitor: "100 emails / day" },
		openSource: { reloop: "Yes (KumoMTA Engine)", competitor: "No (Closed Source)" },
		inboundAi: { reloop: "Built-in Agent Inbox", competitor: "No" },
	},
	Mailgun: {
		name: "Mailgun",
		href: "/compare/mailgun",
		tagline: "Transactional email API with complex routing & rising costs",
		keyDiff:
			"Reloop simplifies email infrastructure into a unified transactional + marketing + AI platform with predictable pricing.",
		reloopAdvantages: [
			"Unified transactional & marketing campaigns",
			"Predictable flat pricing per 1,000 emails",
			"Native React/JSX email template support",
			"Complete data sovereignty via self-hosting",
		],
		competitorDrawbacks: [
			"Confusing plan tiers and sudden price jumps",
			"Complex routes setup required for basic parsing",
			"Separate tools needed for marketing campaigns",
			"No open source option",
		],
		freeTier: { reloop: "10,000 emails / mo", competitor: "Trial only" },
		openSource: { reloop: "Yes (KumoMTA Engine)", competitor: "No" },
		inboundAi: { reloop: "Built-in Agent Inbox", competitor: "Basic Routes" },
	},
	"AWS SES": {
		name: "AWS SES",
		href: "/compare/aws-ses",
		tagline: "Ultra-raw infrastructure requiring custom UI & delivery ops",
		keyDiff:
			"Reloop gives you AWS SES-level pricing with a world-class developer UI, template editor, analytics, and deliverability monitoring built-in.",
		reloopAdvantages: [
			"Beautiful dashboard, template builder, & analytics",
			"Instant onboarding without AWS IAM complexity",
			"Built-in suppression list & reputation monitoring",
			"Option to use Reloop UI on top of your own infrastructure",
		],
		competitorDrawbacks: [
			"No native email template editor or previewer",
			"Complex IAM policies & production sandbox approval",
			"Zero built-in AI agent inbox capabilities",
			"No out-of-the-box marketing campaign tools",
		],
		freeTier: { reloop: "10,000 emails / mo", competitor: "62k/mo (EC2 only)" },
		openSource: { reloop: "Yes (KumoMTA Engine)", competitor: "No" },
		inboundAi: { reloop: "Built-in Agent Inbox", competitor: "S3 + Lambda pipeline" },
	},
	Postmark: {
		name: "Postmark",
		href: "/compare/postmark",
		tagline: "Great delivery for transactional email, but lacks marketing & AI",
		keyDiff:
			"Reloop brings high deliverability to BOTH transactional and marketing emails while offering AI agent inboxes at a fraction of the cost.",
		reloopAdvantages: [
			"Unified transactional + broadcast marketing",
			"Significantly lower per-email costs",
			"AI-assisted template builder & agent inbox",
			"Full self-hosting freedom",
		],
		competitorDrawbacks: [
			"Strict split between transactional & broadcast streams",
			"Higher cost per email than modern alternatives",
			"No open-source options",
			"No native AI capabilities",
		],
		freeTier: { reloop: "10,000 emails / mo", competitor: "100 emails / mo" },
		openSource: { reloop: "Yes (KumoMTA Engine)", competitor: "No" },
		inboundAi: { reloop: "Built-in Agent Inbox", competitor: "Basic Webhooks" },
	},
	Loops: {
		name: "Loops",
		href: "/compare/loops",
		tagline: "SaaS email for startups, but relies on third-party senders",
		keyDiff:
			"Reloop owns the underlying email engine (KumoMTA) for enterprise deliverability while providing complete developer APIs & AI workflows.",
		reloopAdvantages: [
			"Native email sending engine (KumoMTA core)",
			"Full developer API & SMTP relay",
			"Self-hostable open source platform",
			"Built-in AI agent inbox",
		],
		competitorDrawbacks: [
			"Relies on third-party sending infrastructure",
			"Limited raw SMTP and low-level API controls",
			"No self-hosting or data sovereignty options",
			"Gets expensive quickly for high contact volume",
		],
		freeTier: { reloop: "10,000 emails / mo", competitor: "1,000 contacts" },
		openSource: { reloop: "Yes (KumoMTA Engine)", competitor: "No" },
		inboundAi: { reloop: "Built-in Agent Inbox", competitor: "No" },
	},
	Mailchimp: {
		name: "Mailchimp",
		href: "/compare/mailchimp",
		tagline: "Legacy marketing platform with contact-based penalty pricing",
		keyDiff:
			"Reloop charges for emails sent—not contacts stored. Reloop provides modern developer APIs alongside intuitive campaign tools.",
		reloopAdvantages: [
			"Pay for sent volume, not contact list size",
			"Developer-first REST API & SMTP integration",
			"Clean modern UI without bloat",
			"Open-source data ownership",
		],
		competitorDrawbacks: [
			"Penalizes list size even if inactive",
			"Complex legacy builder and slow interface",
			"Transactional email requires separate Mandrill add-on",
			"Expensive monthly contact tier locks",
		],
		freeTier: { reloop: "10,000 emails / mo", competitor: "500 contacts limit" },
		openSource: { reloop: "Yes (KumoMTA Engine)", competitor: "No" },
		inboundAi: { reloop: "Built-in Agent Inbox", competitor: "No" },
	},
};

const defaultSnapshot = SPOTLIGHT_DATA["Resend"]!;

export function CompareInteractiveSpotlight() {
	const [selectedBrand, setSelectedBrand] = useState<string>("Resend");

	const currentBrand = competitorBrands.find((b) => b.name === selectedBrand);
	const snapshot = SPOTLIGHT_DATA[selectedBrand] ?? defaultSnapshot;

	return (
		<div className="w-full space-y-6">
			{/* Header */}
			<div className="text-center">
				<span className="font-bold text-[12px] text-text-sub-600 uppercase tracking-widest dark:text-white/50">
					Interactive Comparison
				</span>
				<h2 className="mt-2 font-serif text-[2rem] text-text-strong-950 leading-tight tracking-tight sm:text-[2.5rem] dark:text-white">
					Select a provider to compare directly
				</h2>
				<p className="mx-auto mt-2 max-w-xl text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
					See how Reloop stands against your current email provider in key
					capabilities, open-source freedom, and cost.
				</p>
			</div>

			{/* Competitor Brand Switcher Bar */}
			<div className="flex flex-wrap items-center justify-center gap-2">
				{competitorBrands.map((brand) => {
					const isSelected = selectedBrand === brand.name;
					return (
						<button
							key={brand.name}
							type="button"
							onClick={() => setSelectedBrand(brand.name)}
							className={cn(
								"flex items-center gap-2.5 rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-200",
								isSelected
									? "bg-text-strong-950 text-white shadow-md dark:bg-white dark:text-black"
									: "border border-stroke-soft-200/80 bg-bg-weak-50/50 text-text-sub-600 hover:border-stroke-soft-300 hover:bg-bg-soft-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:border-white/20 dark:hover:text-white",
							)}
						>
							<BrandIcon icon={brand.icon} className="size-4 shrink-0" />
							<span>{brand.name}</span>
						</button>
					);
				})}
			</div>

			{/* Spotlight Comparison Card */}
			<div className="rounded-3xl border border-stroke-soft-200/80 bg-bg-white-0 p-6 shadow-sm sm:p-10 dark:border-white/10 dark:bg-white/[0.02]">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:border-stroke-soft-200 lg:border-b lg:pb-8 dark:lg:border-white/10">
					<div>
						<div className="flex items-center gap-3">
							<span className="flex size-9 items-center justify-center rounded-xl bg-text-strong-950 text-white dark:bg-white dark:text-black">
								<Logo className="size-5" />
							</span>
							<span className="font-bold text-[18px] text-text-strong-950 dark:text-white">
								Reloop
							</span>
							<span className="font-semibold text-[14px] text-text-sub-600 dark:text-white/40">
								vs
							</span>
							{currentBrand ? (
								<div className="flex items-center gap-2">
									<span className="flex size-8 items-center justify-center rounded-lg border border-stroke-soft-200/80 bg-bg-weak-50 dark:border-white/10 dark:bg-white/10">
										<BrandIcon icon={currentBrand.icon} className="size-4" />
									</span>
									<span className="font-bold text-[18px] text-text-strong-950 dark:text-white">
										{snapshot.name}
									</span>
								</div>
							) : null}
						</div>
						<p className="mt-2 text-[15px] text-text-sub-600 dark:text-white/60">
							{snapshot.tagline}
						</p>
					</div>

					<Link
						href={snapshot.href}
						className="inline-flex items-center justify-center rounded-xl bg-text-strong-950 px-5 py-2.5 font-medium text-[14px] text-white shadow-sm transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
					>
						View full Reloop vs {snapshot.name} report →
					</Link>
				</div>

				{/* Key Differentiators Matrix */}
				<div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
					<div className="rounded-2xl border border-stroke-soft-200/80 bg-bg-weak-50/50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
						<p className="font-semibold text-[12px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">
							Free Tier Included
						</p>
						<div className="mt-3 space-y-2">
							<div>
								<span className="block text-[11px] text-text-sub-600 dark:text-white/40">
									Reloop Cloud
								</span>
								<span className="font-bold font-mono text-[15px] text-text-strong-950 dark:text-white">
									{snapshot.freeTier.reloop}
								</span>
							</div>
							<div className="border-stroke-soft-200/80 border-t pt-2 dark:border-white/10">
								<span className="block text-[11px] text-text-sub-600 dark:text-white/40">
									{snapshot.name}
								</span>
								<span className="font-medium font-mono text-[14px] text-text-sub-600 dark:text-white/60">
									{snapshot.freeTier.competitor}
								</span>
							</div>
						</div>
					</div>

					<div className="rounded-2xl border border-stroke-soft-200/80 bg-bg-weak-50/50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
						<p className="font-semibold text-[12px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">
							Open Source Core
						</p>
						<div className="mt-3 space-y-2">
							<div>
								<span className="block text-[11px] text-text-sub-600 dark:text-white/40">
									Reloop
								</span>
								<span className="font-bold text-[15px] text-text-strong-950 dark:text-white">
									{snapshot.openSource.reloop}
								</span>
							</div>
							<div className="border-stroke-soft-200/80 border-t pt-2 dark:border-white/10">
								<span className="block text-[11px] text-text-sub-600 dark:text-white/40">
									{snapshot.name}
								</span>
								<span className="font-medium text-[14px] text-text-sub-600 dark:text-white/60">
									{snapshot.openSource.competitor}
								</span>
							</div>
						</div>
					</div>

					<div className="rounded-2xl border border-stroke-soft-200/80 bg-bg-weak-50/50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
						<p className="font-semibold text-[12px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">
							Inbound AI Agent Inbox
						</p>
						<div className="mt-3 space-y-2">
							<div>
								<span className="block text-[11px] text-text-sub-600 dark:text-white/40">
									Reloop
								</span>
								<span className="font-bold text-[15px] text-text-strong-950 dark:text-white">
									{snapshot.inboundAi.reloop}
								</span>
							</div>
							<div className="border-stroke-soft-200/80 border-t pt-2 dark:border-white/10">
								<span className="block text-[11px] text-text-sub-600 dark:text-white/40">
									{snapshot.name}
								</span>
								<span className="font-medium text-[14px] text-text-sub-600 dark:text-white/60">
									{snapshot.inboundAi.competitor}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Advantages Bullet Breakdown */}
				<div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
					<div className="space-y-3 rounded-2xl border border-stroke-soft-200/80 bg-bg-weak-50/40 p-5 dark:border-white/10 dark:bg-white/[0.02]">
						<p className="font-bold text-[14px] text-text-strong-950 dark:text-white">
							Why teams choose Reloop over {snapshot.name}
						</p>
						<ul className="space-y-2 text-[14px] text-text-sub-600 dark:text-white/70">
							{snapshot.reloopAdvantages.map((adv) => (
								<li key={adv} className="flex items-start gap-2.5">
									<span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-text-strong-950 text-white dark:bg-white dark:text-black">
										✓
									</span>
									<span>{adv}</span>
								</li>
							))}
						</ul>
					</div>

					<div className="space-y-3 rounded-2xl border border-stroke-soft-200/80 bg-bg-weak-50/40 p-5 dark:border-white/10 dark:bg-white/[0.02]">
						<p className="font-bold text-[14px] text-text-strong-950 dark:text-white">
							Common limitations with {snapshot.name}
						</p>
						<ul className="space-y-2 text-[14px] text-text-sub-600 dark:text-white/70">
							{snapshot.competitorDrawbacks.map((drawback) => (
								<li key={drawback} className="flex items-start gap-2.5">
									<span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-700 dark:bg-white/20 dark:text-white">
										✕
									</span>
									<span>{drawback}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
