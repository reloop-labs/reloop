"use client";

import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

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

// Alt text per tab for a11y.
const PLATFORM_ALT: Record<PlatformTabId, string> = {
	domains: "Domains — verify DNS once, send forever",
	email: "Email — transactional API and SMTP relay",
	analytics: "Analytics — delivery, opens and bounces live",
	templates: "Templates — React Email blocks that scale",
	agents: "Agent Inbox — inbound email for AI agents",
	workflows: "Workflows — automate lifecycle sends",
};

// Distinct gradient backdrop per tab — light + dark.
const TAB_GRADIENTS: Record<PlatformTabId, string> = {
	domains:
		"from-[#dbe7ff] via-[#eef3ff] to-bg-white-0 dark:from-[#0b1b33] dark:via-[#060b16] dark:to-black",
	email:
		"from-[#fdeecd] via-[#fdf6e7] to-bg-white-0 dark:from-[#2a1c07] dark:via-[#120d05] dark:to-black",
	analytics:
		"from-[#d2f3e3] via-[#e9faf2] to-bg-white-0 dark:from-[#06281c] dark:via-[#041209] dark:to-black",
	templates:
		"from-[#fbdce5] via-[#fdeef2] to-bg-white-0 dark:from-[#33101c] dark:via-[#160609] dark:to-black",
	agents:
		"from-[#e3d9fb] via-[#efe9fd] to-bg-white-0 dark:from-[#1e1245] dark:via-[#0d0722] dark:to-black",
	workflows:
		"from-[#cfe9fb] via-[#e6f3fd] to-bg-white-0 dark:from-[#08273f] dark:via-[#04121e] dark:to-black",
};

// TODO: per-tab screenshots — using domain shot as placeholder until others land.
const TAB_SCREENSHOT: Record<PlatformTabId, { src: string; darkSrc: string }> =
	{
		domains: {
			src: "/platform/domain-light.png",
			darkSrc: "/platform/domain-dark.png",
		},
		email: {
			src: "/platform/email-light.png",
			darkSrc: "/platform/email-dark.png",
		},
		analytics: {
			src: "/platform/analytics-light.png",
			darkSrc: "/platform/analytics-dark.png",
		},
		templates: {
			src: "/platform/domain-light.png",
			darkSrc: "/platform/domain-dark.png",
		},
		agents: {
			src: "/platform/agent-inbox-light.png",
			darkSrc: "/platform/agent-inbox-dark.png",
		},
		workflows: {
			src: "/platform/domain-light.png",
			darkSrc: "/platform/domain-dark.png",
		},
	};

function PlatformPreview({ tab }: { tab: PlatformTabId }) {
	const shot = TAB_SCREENSHOT[tab];
	return (
		<div
			className={`relative h-full w-full overflow-hidden bg-gradient-to-b px-10 pt-10 ${TAB_GRADIENTS[tab]}`}
		>
			<div className="relative h-full w-full overflow-hidden rounded-t-xl border border-stroke-soft-100 border-b-0 bg-bg-white-0 shadow-regular-md dark:border-white/10 dark:bg-black">
				<Image
					src={shot.src}
					alt={PLATFORM_ALT[tab]}
					fill
					sizes="100vw"
					className="object-cover object-top dark:hidden"
					priority={tab === "domains"}
				/>
				<Image
					src={shot.darkSrc}
					alt=""
					aria-hidden
					fill
					sizes="100vw"
					className="hidden object-cover object-top dark:block"
					priority={tab === "domains"}
				/>
			</div>
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
			className="w-full border-stroke-soft-100 border-y dark:border-white/10"
		>
			<h2 id="platform-heading" className="sr-only">
				Reloop platform overview
			</h2>

			{/* Tab header — mirrors reference: 5 columns, dividers, active underline */}
			<div
				role="tablist"
				aria-label="Platform areas"
				className="grid grid-cols-2 border-stroke-soft-100 border-b sm:grid-cols-3 lg:grid-cols-6 dark:border-white/10"
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
			<div>
				<AnimatePresence mode="wait">
					<motion.div
						key={active}
						className="h-[560px] w-full sm:h-[640px] lg:h-[720px]"
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
			</div>
		</section>
	);
}
