"use client";

import { Icon } from "@reloop/ui/icon";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LanguageIcon } from "../../../sdk/components/language-icon";
import { SdkCodeBlock } from "../../../sdk/components/sdk-code-block";
import { frameworks } from "../../../sdk/frameworks";

const CAMPAIGN_CYCLE = ["newsletter", "launch", "drip", "winback"] as const;

const SEND_CODE_TS = `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

await reloop.emails.send({
  from: 'Acme <newsletter@yourdomain.com>',
  to: [{ email: 'maya@northwind.io' }],
  subject: 'October update: what shipped',
  html: '<strong>New templates, segments, and analytics.</strong>',
});`;

const PREVIEWS: Record<
	(typeof CAMPAIGN_CYCLE)[number],
	{ eyebrow: string; title: string; body: string; cta: string; stat: string }
> = {
	newsletter: {
		eyebrow: "Weekly newsletter",
		title: "October update: what shipped",
		body: "New templates, segments, and per-link analytics — plus 3 growth teardowns from real sends.",
		cta: "Read the issue",
		stat: "42% open · 8.1% click",
	},
	launch: {
		eyebrow: "Product launch",
		title: "Introducing Drip Flows 2.0",
		body: "Trigger nurture sequences from signup, trial, and checkout events. No CSV exports.",
		cta: "See what's new",
		stat: "12k sent · 0.04% spam",
	},
	drip: {
		eyebrow: "Drip · Day 3",
		title: "Still exploring? Here's a template",
		body: "Day 3 of your welcome series. One click imports this layout into your workspace.",
		cta: "Use this template",
		stat: "3-email series · +19% activation",
	},
	winback: {
		eyebrow: "Win-back",
		title: "We miss you — 20% off Pro",
		body: "Re-engage dormant contacts with a single segmented broadcast and auto-suppression.",
		cta: "Claim the offer",
		stat: "6.4% reactivated",
	},
};

export function MarketingPreviewSection() {
	const [campaignIndex, setCampaignIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCampaignIndex((prev) => (prev + 1) % CAMPAIGN_CYCLE.length);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	const activeId = CAMPAIGN_CYCLE[campaignIndex] ?? "newsletter";
	const preview = PREVIEWS[activeId];

	return (
		<section className="w-full border-stroke-soft-200 border-t bg-bg-white-0 dark:border-white/10 dark:bg-black">
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-white/10">
					{/* Left Panel: Frameworks */}
					<div className="flex flex-col justify-between p-8 sm:p-10 lg:p-12">
						<div>
							<div className="mb-4">
								<span className="inline-flex items-center gap-1.5 rounded-[10px] bg-orange-50 px-2.5 py-1 font-medium text-[13px] text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
									<Icon name="code" className="size-3.5" />
									Developer First
								</span>
							</div>
							<h3 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[23px] xl:text-[26px] dark:text-white">
								Send campaigns from your stack.
							</h3>
							<p className="mt-2.5 text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] lg:text-[15px] dark:text-white/60">
								Official SDKs and native libraries for Node.js, Python, Go, PHP,
								Ruby, Java, .NET, and Elixir.
							</p>

							<div className="mt-7 flex max-w-lg flex-wrap items-center gap-4 sm:gap-4.5">
								{frameworks.map((fw) => (
									<Link
										key={fw.slug}
										href={`/frameworks/${fw.slug}`}
										title={`Send email with ${fw.name}`}
										aria-label={`Send email with ${fw.name}`}
										className="group flex cursor-pointer items-center justify-center p-1 text-text-strong-950 transition-transform duration-150 hover:scale-115 dark:text-white"
									>
										<span className="flex items-center justify-center">
											<LanguageIcon
												icon={fw.icon}
												className="size-7 sm:size-8"
											/>
										</span>
									</Link>
								))}
							</div>
						</div>

						<div className="mt-8 w-full">
							<SdkCodeBlock slug="nodejs" code={SEND_CODE_TS} path="send.ts" />
						</div>
					</div>

					{/* Right Panel: Campaign Preview */}
					<div className="relative flex flex-col justify-between p-8 sm:p-10 lg:p-12">
						<div>
							<div className="mb-4 flex items-center justify-between gap-3">
								<span className="inline-flex items-center gap-1.5 rounded-[10px] bg-orange-50 px-2.5 py-1 font-medium text-[13px] text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
									<Icon name="layout" className="size-3.5" />
									Campaigns
								</span>

								{/* Progress Indicator */}
								<div className="flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-white-0/90 px-2.5 py-1 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
									{/* Circular progress ring */}
									<div className="relative flex size-3 items-center justify-center">
										<svg className="-rotate-90 size-3" viewBox="0 0 24 24">
											<circle
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="3.5"
												className="text-stroke-soft-200 dark:text-white/15"
												fill="none"
											/>
											<motion.circle
												key={campaignIndex}
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="3.5"
												strokeLinecap="round"
												className="text-orange-500 dark:text-orange-400"
												fill="none"
												strokeDasharray="62.83"
												initial={{ strokeDashoffset: 62.83 }}
												animate={{ strokeDashoffset: 0 }}
												transition={{ duration: 3, ease: "linear" }}
											/>
										</svg>
									</div>

									<span className="font-medium font-mono text-[11px] text-text-sub-600 dark:text-white/70">
										{campaignIndex + 1}/{CAMPAIGN_CYCLE.length}
									</span>
								</div>
							</div>

							<h3 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[23px] xl:text-[26px] dark:text-white">
								Broadcasts that land in the inbox.
							</h3>
							<p className="mt-2.5 text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] lg:text-[15px] dark:text-white/60">
								Newsletters, launches, drip sequences, and win-backs — with
								segments, scheduling, and unsubscribe handling built in.
							</p>
						</div>

						<div className="relative mx-auto mt-8 max-h-[380px] w-full max-w-sm overflow-hidden rounded-[20px] sm:max-h-[400px]">
							<div className="relative overflow-hidden rounded-[22px] border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)] [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent_98%)] [mask-image:linear-gradient(to_bottom,black_60%,transparent_98%)] dark:border-white/10 dark:bg-[#141414]">
								<motion.div
									key={activeId}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.25 }}
								>
									<p className="font-medium font-mono text-[11px] text-orange-600 uppercase tracking-[0.18em] dark:text-orange-400">
										{preview.eyebrow}
									</p>
									<h4 className="mt-2 font-semibold text-[20px] text-text-strong-950 leading-snug tracking-tight dark:text-white">
										{preview.title}
									</h4>
									<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/60">
										{preview.body}
									</p>
									<div className="mt-4 inline-flex items-center rounded-xl bg-bg-strong-950 px-4 py-2 font-medium text-[13px] text-white dark:bg-white dark:text-black">
										{preview.cta}
									</div>
									<p className="mt-4 font-mono text-[11px] text-text-sub-600 dark:text-white/50">
										{preview.stat}
									</p>
								</motion.div>
							</div>
							{/* Gradient fade to section background */}
							<div
								aria-hidden
								className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 bg-gradient-to-t from-bg-white-0 via-bg-white-0/60 to-transparent dark:from-black dark:via-black/60"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
