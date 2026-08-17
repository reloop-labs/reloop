"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useId, useState } from "react";
import { HeroAtmosphere, HeroWindowChrome } from "./hero-chrome";
import { HeroDashboardShell } from "./hero-dashboard-shell";
import {
	HeroDemoPlaybackButton,
	HeroDemoPlaybackProvider,
} from "./hero-demo-playback";
import { HeroPreviewContent, type HeroTabId } from "./hero-preview-content";

const TAB_TO_NAV: Record<HeroTabId, string> = {
	overview: "emails",
	analytics: "metrics",
	domain: "domain",
	workflow: "workflow",
	templates: "templates",
	dashboard: "emails",
	sdk: "domain",
	cloud: "domain",
	agents: "inbox",
};

const NAV_TO_TAB: Record<string, HeroTabId> = {
	emails: "overview",
	inbox: "overview",
	contacts: "workflow",
	templates: "templates",
	workflow: "workflow",
	metrics: "analytics",
	logs: "analytics",
	"api-keys": "domain",
	domain: "domain",
	webhooks: "workflow",
	integrations: "workflow",
	smtp: "overview",
	settings: "overview",
};

const TABS: {
	id: HeroTabId;
	title: string;
	description: string;
	cloud?: boolean;
	banner: {
		title: string;
		description: string;
		href: string;
		icon: string;
	};
}[] = [
	{
		id: "overview",
		title: "Overview",
		description: "Live feed of sent emails, opens, clicks, and deliveries.",
		banner: {
			title: "Overview",
			description: "Live feed of sent emails, deliveries, opens, and clicks.",
			href: hostedSignupHref,
			icon: "layout",
		},
	},
	{
		id: "analytics",
		title: "Analytics",
		description: "Deliverability and engagement for every send.",
		banner: {
			title: "Analytics",
			description: "Deliverability and engagement for every send.",
			href: "/docs/learn/metrics",
			icon: "activity",
		},
	},
	{
		id: "domain",
		title: "Domain",
		description: "SPF, DKIM, and DMARC authentication for your domain.",
		banner: {
			title: "Domains",
			description: "Set up SPF, DKIM, and DMARC so every send authenticates.",
			href: "/domain",
			icon: "globe",
		},
	},
	{
		id: "workflow",
		title: "Workflow",
		description: "Trigger automated sequences, webhooks, and logic.",
		banner: {
			title: "Workflows",
			description: "Trigger automated sequences and event-driven email logic.",
			href: "/docs/learn/workflows",
			icon: "workflow",
		},
	},
	{
		id: "templates",
		title: "Templates",
		description: "Visual editor with dynamic variables and components.",
		banner: {
			title: "Templates",
			description:
				"Design and preview transactional and marketing email templates.",
			href: "/features/email-templates",
			icon: "layout",
		},
	},
];

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function Hero() {
	const [active, setActive] = useState<HeroTabId>("overview");
	const reduceMotion = useReducedMotion();
	const tablistId = useId();

	const selectByOffset = useCallback((offset: number) => {
		setActive((current) => {
			const index = TABS.findIndex((tab) => tab.id === current);
			const next = (index + offset + TABS.length) % TABS.length;
			return TABS[next]?.id ?? current;
		});
	}, []);

	const activeNav = TAB_TO_NAV[active] ?? "emails";

	const handleSidebarClick = useCallback((id: string) => {
		const targetTab = NAV_TO_TAB[id];
		if (targetTab) {
			setActive(targetTab);
		}
	}, []);

	return (
		<section
			id="features"
			className="relative flex min-h-dvh flex-col bg-transparent"
		>
			<div className="relative mx-auto flex w-full max-w-5xl flex-col items-center border-stroke-soft-200 border-x px-6 pt-36 pb-14 text-center sm:px-8 sm:pt-44 sm:pb-16 md:max-w-7xl lg:px-12 lg:pt-52 lg:pb-20 dark:border-white/10">
				<h1 className="max-w-4xl text-center font-medium text-[2.5rem] text-text-strong-950 leading-[1.02] tracking-[-0.045em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
					Email API for Developers
					<br />
					With agent inboxes built in
				</h1>
				<p className="mt-5 max-w-[52rem] text-center text-[15px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[17px] dark:text-white/55">
					Open-source email infrastructure on GitHub. Extend, customize, and own
					every email workflow.
				</p>
				<div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-7">
					<FancyButton.Root asChild variant="neutral" size="small">
						<a href={hostedSignupHref}>Get Started</a>
					</FancyButton.Root>
					<FancyButton.Root asChild variant="basic" size="small">
						<a href="/docs">Documentation</a>
					</FancyButton.Root>
				</div>
			</div>

			<div className="relative mx-auto w-full max-w-5xl flex-1 flex-col border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<div
					role="tablist"
					aria-label="Product surfaces"
					className="flex overflow-x-auto border-stroke-soft-200 border-t border-b [scrollbar-width:none] lg:grid lg:grid-cols-5 dark:border-white/10 [&::-webkit-scrollbar]:hidden"
					onKeyDown={(event) => {
						if (event.key === "ArrowRight") {
							event.preventDefault();
							selectByOffset(1);
						} else if (event.key === "ArrowLeft") {
							event.preventDefault();
							selectByOffset(-1);
						}
					}}
				>
					{TABS.map((tab) => {
						const selected = tab.id === active;
						return (
							<button
								key={tab.id}
								type="button"
								role="tab"
								id={`${tablistId}-${tab.id}`}
								aria-selected={selected}
								aria-controls={`${tablistId}-panel`}
								tabIndex={selected ? 0 : -1}
								onClick={() => setActive(tab.id)}
								className={cn(
									"relative min-w-[11.5rem] flex-1 cursor-pointer border-stroke-soft-200 border-l px-5 py-4 text-left transition-colors duration-200 first:border-l-0 sm:min-w-[13rem] sm:px-6 sm:py-5 dark:border-white/10",
									selected
										? "bg-transparent"
										: "bg-transparent hover:bg-bg-weak-50/70 dark:hover:bg-white/[0.02]",
								)}
							>
								<span className="flex items-center gap-2">
									<span
										className={cn(
											"font-medium text-[14px] tracking-[-0.01em] transition-colors duration-200 sm:text-[15px]",
											selected
												? "text-text-strong-950 dark:text-white"
												: "text-text-sub-600 dark:text-white/55",
										)}
									>
										{tab.title}
									</span>
									{tab.cloud && (
										<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-1.5 py-0.5 font-medium text-[10px] text-text-sub-600 leading-none dark:bg-white/[0.08] dark:text-white/55">
											Cloud
										</span>
									)}
								</span>
								<span
									className={cn(
										"mt-1.5 block max-w-[16rem] text-[13px] leading-snug transition-colors duration-200 sm:text-[14px]",
										selected
											? "text-text-sub-600 dark:text-white/50"
											: "text-text-soft-400 dark:text-white/35",
									)}
								>
									{tab.description}
								</span>
								{selected && (
									<motion.span
										layoutId={reduceMotion ? undefined : "hero-tab-underline"}
										className="absolute right-0 bottom-0 left-0 h-[2px] bg-text-strong-950 dark:bg-white"
										transition={
											reduceMotion
												? { duration: 0 }
												: { duration: 0.22, ease: EASE_OUT }
										}
									/>
								)}
							</button>
						);
					})}
				</div>
			</div>

			<div className="relative w-full flex-1 overflow-hidden bg-bg-white-0 dark:bg-black">
				<HeroAtmosphere />
				<div
					id={`${tablistId}-panel`}
					role="tabpanel"
					aria-labelledby={`${tablistId}-${active}`}
					className="relative z-10 mx-auto flex h-dvh w-full max-w-5xl flex-col px-3 pt-10 pb-10 sm:px-6 sm:pt-14 sm:pb-14 md:max-w-7xl lg:px-8 lg:pt-20 lg:pb-16"
				>
					{/* Left and Right vertical borders matching the HeroAtmosphere line color and vertical gradient */}
					<div
						aria-hidden
						className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-[rgba(0,111,254,0.06)] via-[rgba(0,111,254,0.16)] to-[rgba(0,111,254,0.28)] dark:from-[rgba(0,111,254,0.1)] dark:via-[rgba(0,111,254,0.22)] dark:to-[rgba(0,111,254,0.38)]"
					/>
					<div
						aria-hidden
						className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-[rgba(0,111,254,0.06)] via-[rgba(0,111,254,0.16)] to-[rgba(0,111,254,0.28)] dark:from-[rgba(0,111,254,0.1)] dark:via-[rgba(0,111,254,0.22)] dark:to-[rgba(0,111,254,0.38)]"
					/>
					<HeroDemoPlaybackProvider>
						<HeroWindowChrome
							action={active === "sdk" ? <HeroDemoPlaybackButton /> : undefined}
						>
							<HeroDashboardShell
								activeItem={activeNav}
								onItemClick={handleSidebarClick}
							>
								<AnimatePresence mode="wait" initial={false}>
									<motion.div
										key={active}
										className="h-full w-full"
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
												: { duration: 0.2, ease: EASE_OUT }
										}
									>
										<HeroPreviewContent tab={active} />
									</motion.div>
								</AnimatePresence>
							</HeroDashboardShell>
							<HeroTabBanner
								tabId={active}
								reduceMotion={Boolean(reduceMotion)}
							/>
						</HeroWindowChrome>
					</HeroDemoPlaybackProvider>
				</div>
			</div>
		</section>
	);
}

function HeroTabBanner({
	tabId,
	reduceMotion,
}: {
	tabId: HeroTabId;
	reduceMotion: boolean;
}) {
	const tab = TABS.find((item) => item.id === tabId) ?? TABS[0]!;
	const { banner } = tab;

	return (
		<AnimatePresence mode="wait" initial={false}>
			<motion.div
				key={tab.id}
				className="pointer-events-none absolute inset-x-3 bottom-3 z-10 sm:inset-x-5 sm:bottom-5"
				initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
				transition={
					reduceMotion ? { duration: 0 } : { duration: 0.2, ease: EASE_OUT }
				}
			>
				<div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-[#171717] px-3 py-2.5 text-white shadow-[0_8px_28px_rgba(0,0,0,0.18)] sm:gap-4 sm:rounded-[1.35rem] sm:px-4 sm:py-3 dark:bg-[#111]">
					<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 sm:size-11">
						<Icon name={banner.icon} className="size-5 text-white" />
					</span>
					<div className="min-w-0 flex-1">
						<p className="truncate font-semibold text-[14px] leading-tight tracking-tight sm:text-[15px]">
							{banner.title}
						</p>
						<p className="mt-0.5 truncate text-[12px] text-white/55 leading-snug sm:text-[13px]">
							{banner.description}
						</p>
					</div>
					<Link
						href={banner.href}
						className="inline-flex h-9 shrink-0 items-center rounded-full bg-white px-3.5 font-medium text-[#171717] text-[13px] transition-opacity hover:opacity-90 sm:h-10 sm:px-4"
					>
						Learn more
					</Link>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
