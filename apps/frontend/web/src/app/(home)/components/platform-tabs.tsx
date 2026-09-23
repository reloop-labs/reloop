"use client";

import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { HeroWindowChrome } from "./hero-chrome";

type PlatformTabId =
	| "domains"
	| "email"
	| "analytics"
	| "templates"
	| "agents"
	| "workflows";

const TABS: {
	id: PlatformTabId;
	title: string;
	description: string;
	badge?: string;
	nav: string;
}[] = [
	{
		id: "domains",
		title: "Domains",
		description: "Verify DNS once, send forever.",
		nav: "domain",
	},
	{
		id: "email",
		title: "Email",
		description: "Transactional API and SMTP relay.",
		nav: "emails",
	},
	{
		id: "analytics",
		title: "Analytics",
		description: "Delivery, opens and bounces live.",
		nav: "metrics",
	},
	{
		id: "templates",
		title: "Templates",
		description: "React Email blocks that scale.",
		badge: "AI",
		nav: "templates",
	},
	{
		id: "agents",
		title: "Agent Inbox",
		description: "Inbound email for AI agents.",
		badge: "AI",
		nav: "inbox",
	},
	{
		id: "workflows",
		title: "Workflows",
		description: "Automate lifecycle sends.",
		nav: "workflow",
	},
];

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

// Full-window product screenshots (already include sidebar + topbar,
// so they render directly in HeroWindowChrome with no nested shell).
const PLATFORM_IMAGES: Record<PlatformTabId, { src: string; alt: string }> = {
	domains: {
		src: "/platform/domains.png",
		alt: "Domains — verify DNS once, send forever",
	},
	email: {
		src: "/platform/email.png",
		alt: "Email — transactional API and SMTP relay",
	},
	analytics: {
		src: "/platform/analytics.png",
		alt: "Analytics — delivery, opens and bounces live",
	},
	templates: {
		src: "/platform/templates.png",
		alt: "Templates — React Email blocks that scale",
	},
	agents: {
		src: "/platform/agents.png",
		alt: "Agent Inbox — inbound email for AI agents",
	},
	workflows: {
		src: "/platform/workflows.png",
		alt: "Workflows — automate lifecycle sends",
	},
};

function PlatformPreview({ tab }: { tab: PlatformTabId }) {
	const img = PLATFORM_IMAGES[tab];
	return (
		<div className="relative h-full w-full">
			<Image
				src={img.src}
				alt={img.alt}
				fill
				sizes="(max-width: 1024px) 100vw, 1200px"
				className="object-cover object-top"
				priority={tab === "domains"}
			/>
		</div>
	);
}

export default function PlatformTabs() {
	const [active, setActive] = useState<PlatformTabId>("domains");
	const reduceMotion = useReducedMotion();

	return (
		<section
			id="platform"
			aria-labelledby="platform-heading"
			className="w-full border-stroke-soft-100 border-b dark:border-white/10"
		>
			<h2 id="platform-heading" className="sr-only">
				Reloop platform overview
			</h2>

			{/* Tab header — mirrors reference: 5 columns, dividers, active underline */}
			<div
				role="tablist"
				aria-label="Platform areas"
				className="grid grid-cols-2 border-stroke-soft-100 border-b sm:grid-cols-3 lg:grid-cols-5 dark:border-white/10"
			>
				{TABS.map((tab) => {
					const selected = tab.id === active;
					return (
						<button
							key={tab.id}
							type="button"
							role="tab"
							aria-selected={selected}
							onClick={() => setActive(tab.id)}
							className={cn(
								"relative border-stroke-soft-100 px-5 py-5 text-left transition-colors sm:px-6 sm:py-6 dark:border-white/10",
								"border-b sm:border-b-0",
								"odd:border-r sm:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n)]:border-r",
								"[&:nth-child(5n)]:border-r-0",
								"sm:border-r lg:border-r",
								"last:border-r-0 last:odd:col-span-2 sm:last:odd:col-span-1",
								"focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-base/40",
								selected
									? "bg-bg-white-0 dark:bg-black"
									: "bg-bg-white-0 hover:bg-bg-weak-50/60 dark:bg-black dark:hover:bg-white/[0.03]",
							)}
						>
							<span className="flex items-center gap-2">
								<span
									className={cn(
										"font-medium text-[15px] tracking-[-0.01em] sm:text-[16px]",
										selected
											? "text-text-strong-950 dark:text-white"
											: "text-text-soft-400 dark:text-white/40",
									)}
								>
									{tab.title}
								</span>
								{tab.badge ? (
									<span className="inline-flex h-5 items-center rounded-full bg-stroke-soft-100/90 px-2 font-medium text-[11px] text-text-sub-600 dark:bg-white/15 dark:text-white/70">
										{tab.badge}
									</span>
								) : null}
							</span>
							<span
								className={cn(
									"mt-1.5 line-clamp-2 block text-[13.5px] leading-snug sm:text-[14px]",
									selected
										? "text-text-sub-600 dark:text-white/60"
										: "text-text-soft-400 dark:text-white/35",
								)}
							>
								{tab.description}
							</span>
							{selected ? (
								<motion.span
									layoutId="platform-tab-underline"
									className="absolute inset-x-0 bottom-[-1px] h-[2px] bg-text-strong-950 dark:bg-white"
									transition={
										reduceMotion
											? { duration: 0 }
											: { type: "spring", bounce: 0.15, duration: 0.35 }
									}
								/>
							) : null}
						</button>
					);
				})}
			</div>

			{/* Preview panel — whole image, no nested dashboard shell */}
			<div className="bg-bg-weak-50/40 px-3 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 dark:bg-white/[0.015]">
				<HeroWindowChrome>
					<AnimatePresence mode="wait">
						<motion.div
							key={active}
							className="h-[440px] w-full sm:h-[520px] lg:h-[560px]"
							initial={
								reduceMotion
									? { opacity: 1 }
									: { opacity: 0, filter: "blur(2px)" }
							}
							animate={{ opacity: 1, filter: "blur(0px)" }}
							exit={
								reduceMotion
									? { opacity: 0 }
									: { opacity: 0, filter: "blur(2px)" }
							}
							transition={
								reduceMotion
									? { duration: 0 }
									: { duration: 0.22, ease: EASE_OUT }
							}
						>
							<PlatformPreview tab={active} />
						</motion.div>
					</AnimatePresence>
				</HeroWindowChrome>
			</div>
		</section>
	);
}
