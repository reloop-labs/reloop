"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { formatPrice, pricingPlans } from "@reloop/web/lib/pricing";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { type ReactNode, useEffect, useState } from "react";
import { siLoops, siMailchimp } from "simple-icons";
import {
	PLATFORM_ALT,
	TAB_SCREENSHOT,
} from "../../../(home)/components/platform-tabs-data";

const reloopGrowth = pricingPlans.find((plan) => plan.id === "startup");
const reloopGrowthMonthly = reloopGrowth?.monthlyPrice ?? 20;

/**
 * Published monthly list price at 100,000 contacts (one send each = 100k
 * emails, which Reloop Growth covers). Mailchimp Standard, Kit Creator, Loops.
 * Keep Loops in sync with /compare/loops.
 */
type Competitor = {
	name: string;
	logo: ReactNode;
	monthlyAt100k: number;
};

const COMPETITORS = (
	[
		{
			name: "Mailchimp",
			logo: (
				<svg viewBox="0 0 24 24" className="size-full">
					<circle cx="12" cy="12" r="10.5" fill="#FFE01B" />
					<path d={siMailchimp.path} fill="#241C15" />
				</svg>
			),
			monthlyAt100k: 800,
		},
		{
			name: "Kit",
			logo: (
				<svg viewBox="-8 -8 116 116" className="size-full fill-current">
					<path d="M0 0h38v36C48 22 62 8 84 0h6v37l-30 3c20 0 28 12 30 22 5 13 8 26 10 38H62c0-16-4-30-12-34-4-2-8-3-12-3v37H0Z" />
				</svg>
			),
			monthlyAt100k: 679,
		},
		{
			name: "Loops",
			logo: (
				<svg viewBox="0 0 24 24" className="size-full">
					<path d={siLoops.path} fill="#FC5200" />
				</svg>
			),
			monthlyAt100k: 399,
		},
	] satisfies Competitor[]
).map((competitor) => ({
	...competitor,
	savingsPercent: Math.floor(
		(1 - reloopGrowthMonthly / competitor.monthlyAt100k) * 100,
	),
}));

type ShotTabId = "campaigns" | "templates" | "analytics";

const SHOT_TABS: {
	id: ShotTabId;
	label: string;
	icon: string;
	description: string;
}[] = [
	{
		id: "campaigns",
		label: "Campaigns",
		icon: "mega-phone",
		description: "Send broadcasts to segments and see results per send.",
	},
	{
		id: "templates",
		label: "Templates",
		icon: "layout",
		description: "Build reusable emails once and send them anywhere.",
	},
	{
		id: "analytics",
		label: "Analytics",
		icon: "fat-row",
		description: "Track delivery, opens, clicks, and bounces live.",
	},
];

const ROTATE_MS = 2800;

const SWAP_TRANSITION = {
	duration: 0.35,
	ease: [0.22, 1, 0.36, 1],
} as const;

export function MarketingHero() {
	const reduceMotion = useReducedMotion();
	const [activeTabId, setActiveTabId] = useState<ShotTabId>("campaigns");
	const [index, setIndex] = useState(0);
	const competitor = COMPETITORS[index] ?? COMPETITORS[0];

	useEffect(() => {
		if (reduceMotion) return;
		const interval = setInterval(() => {
			setIndex((prev) => (prev + 1) % COMPETITORS.length);
		}, ROTATE_MS);
		return () => clearInterval(interval);
	}, [reduceMotion]);

	const swap = reduceMotion
		? {}
		: {
				initial: { opacity: 0, y: "0.25em", filter: "blur(8px)" },
				animate: { opacity: 1, y: 0, filter: "blur(0px)" },
				exit: { opacity: 0, y: "-0.25em", filter: "blur(8px)" },
				transition: SWAP_TRANSITION,
			};

	return (
		<header className="relative w-full bg-transparent [--primary-base:#ea580c] [--primary-dark:#c2410c] [--primary-darker:#9a3412] [--primary-link:#c2410c] dark:[--primary-base:#ea580c] dark:[--primary-dark:#ea580c] dark:[--primary-darker:#c2410c] dark:[--primary-link:#fdba74]">
			<div className="relative mx-auto mt-14 w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl min-[1280px]:mt-[72px] dark:border-white/10">
				<div
					aria-hidden
					className="h-10 border-stroke-soft-100 border-t sm:h-24 dark:border-white/10"
				/>
				<div className="flex flex-col items-start px-4 pt-0 pb-16 text-left sm:px-8 sm:pb-20 lg:px-12">
					<h1 className="max-w-5xl text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.1rem] dark:text-white">
						Send email campaigns
						<br />
						<AnimatePresence mode="wait" initial={false}>
							<motion.span
								key={competitor?.name}
								className="inline-block"
								{...swap}
							>
								<span className="relative isolate inline-block whitespace-nowrap">
									<motion.span
										aria-hidden
										className="-z-10 absolute inset-x-[-0.06em] bottom-[0.08em] h-[0.34em] origin-left rounded-[0.08em] bg-stroke-soft-200 dark:bg-white/15"
										initial={reduceMotion ? false : { scaleX: 0 }}
										animate={{ scaleX: 1 }}
										transition={{
											delay: 0.2,
											duration: 0.6,
											ease: [0.22, 1, 0.36, 1],
										}}
									/>
									<span className="tabular-nums">
										{competitor?.savingsPercent}%
									</span>{" "}
									cheaper
								</span>{" "}
								<span className="whitespace-nowrap">
									than{" "}
									<span
										aria-hidden
										className="relative top-[-0.06em] inline-block size-[0.78em] align-middle"
									>
										{competitor?.logo}
									</span>{" "}
									{competitor?.name}.
								</span>
							</motion.span>
						</AnimatePresence>
					</h1>

					<p className="mt-4 max-w-[42rem] text-balance text-[15px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] dark:text-white/60">
						You pay for the emails you send, not the contacts sitting in your
						list. Newsletters, launches, and drips: 100,000 emails for{" "}
						{formatPrice(reloopGrowthMonthly)} a month.
					</p>

					<div className="mt-7 flex flex-wrap items-center justify-start gap-3 sm:mt-9 sm:gap-4">
						<FancyButton.Root
							asChild
							variant="neutral"
							size="medium"
							className="h-10 rounded-xl px-5 font-medium text-[14.5px] sm:h-11 sm:px-6 sm:text-[15.5px]"
						>
							<a href={hostedSignupHref}>Start for free</a>
						</FancyButton.Root>
					</div>
					<p className="mt-3.5 text-[12.5px] text-text-sub-600 sm:text-[13.5px] dark:text-white/50">
						Free plan: 6,000 emails a month. No credit card.
					</p>
				</div>

				<div
					role="tablist"
					aria-label="Campaign tools"
					className="relative flex snap-x snap-mandatory overflow-x-auto border-stroke-soft-100 border-y [scrollbar-width:none] sm:grid sm:snap-none sm:grid-cols-3 sm:overflow-visible dark:border-white/10 [&::-webkit-scrollbar]:hidden"
				>
					{SHOT_TABS.map((t) => {
						const selected = t.id === activeTabId;
						return (
							<button
								key={t.id}
								type="button"
								role="tab"
								id={`marketing-tab-${t.id}`}
								aria-selected={selected}
								aria-controls="marketing-panel"
								onClick={() => setActiveTabId(t.id)}
								className={cn(
									"relative flex w-[78%] shrink-0 snap-start items-start gap-4 border-stroke-soft-100 border-r px-4 py-6 text-left transition-colors last:border-r-0 sm:w-auto sm:px-8 sm:py-7 lg:px-10 dark:border-white/10",
									selected
										? "bg-bg-white-0 dark:bg-black"
										: "bg-bg-white-0 hover:bg-bg-weak-50 dark:bg-black dark:hover:bg-white/[0.03]",
								)}
							>
								<span
									className={cn(
										"flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-xs transition-colors sm:size-11",
										selected
											? "border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
											: "border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/50",
									)}
								>
									<Icon name={t.icon} className="size-5" aria-hidden />
								</span>
								<span className="flex min-w-0 flex-col gap-1">
									<span
										className={cn(
											"font-semibold text-[15px] sm:text-[17px]",
											selected
												? "text-text-strong-950 dark:text-white"
												: "text-text-sub-600 dark:text-white/50",
										)}
									>
										{t.label}
									</span>
									<span className="line-clamp-2 text-[13px] text-text-sub-600 leading-relaxed sm:text-[14px] dark:text-white/50">
										{t.description}
									</span>
								</span>
								<span className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
									{selected && (
										<span className="block h-full bg-text-strong-950 dark:bg-white" />
									)}
								</span>
							</button>
						);
					})}
				</div>

				<div
					id="marketing-panel"
					role="tabpanel"
					aria-labelledby={`marketing-tab-${activeTabId}`}
					className="relative w-full overflow-hidden bg-gradient-to-t from-orange-100 via-amber-50 to-bg-white-0 px-4 pt-6 pb-6 sm:px-10 sm:pt-10 sm:pb-10 lg:px-14 lg:pt-14 lg:pb-14 dark:from-orange-950/40 dark:via-orange-950/10 dark:to-black"
				>
					<div className="relative w-full overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)] sm:rounded-2xl dark:border-white/10 dark:bg-black dark:shadow-black/60">
						<div className="relative aspect-[2776/1926] w-full">
							{SHOT_TABS.map((t) => {
								const selected = t.id === activeTabId;
								const shot = TAB_SCREENSHOT[t.id];
								return (
									<div
										key={t.id}
										aria-hidden={!selected}
										className={cn(
											"absolute inset-0 transition-opacity duration-300 ease-out",
											selected
												? "z-10 opacity-100"
												: "pointer-events-none z-0 opacity-0",
										)}
									>
										<Image
											src={shot.src}
											alt={selected ? PLATFORM_ALT[t.id] : ""}
											fill
											sizes="(min-width: 1280px) 1200px, 100vw"
											className="object-cover object-top-left dark:hidden"
											preload={t.id === "campaigns"}
											loading={t.id === "campaigns" ? undefined : "eager"}
											draggable={false}
										/>
										<Image
											src={shot.darkSrc}
											alt=""
											aria-hidden
											fill
											sizes="(min-width: 1280px) 1200px, 100vw"
											className="hidden object-cover object-top-left dark:block"
											loading="eager"
											draggable={false}
										/>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
