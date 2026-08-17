"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useId, useState } from "react";
import { HeroAtmosphere, HeroWindowChrome } from "./hero-chrome";
import {
	HeroDemoPlaybackButton,
	HeroDemoPlaybackProvider,
} from "./hero-demo-playback";
import { HeroPreview, type HeroTabId } from "./hero-preview";

const TABS: {
	id: HeroTabId;
	title: string;
	description: string;
	cloud?: boolean;
	banner: {
		title: string;
		description: string;
		href: string;
		icon: "activity" | "layout" | "globe" | "server" | "headset";
	};
}[] = [
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
		id: "dashboard",
		title: "Dashboard",
		description: "Customizable console for your email.",
		banner: {
			title: "Dashboard",
			description: "Customizable console for your email.",
			href: hostedSignupHref,
			icon: "layout",
		},
	},
	{
		id: "sdk",
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
		id: "cloud",
		title: "Infrastructure",
		description: "Push from GitHub to the fastest infrastructure.",
		cloud: true,
		banner: {
			title: "Infrastructure",
			description: "Self-host or run on Reloop Cloud.",
			href: "/self-host",
			icon: "server",
		},
	},
	{
		id: "agents",
		title: "Agent Inbox",
		description: "MCP, CLI, Skills, and Agent Previews.",
		cloud: true,
		banner: {
			title: "Agent Inbox",
			description: "MCP, CLI, Skills, and agent previews.",
			href: "/features/ai-agents",
			icon: "headset",
		},
	},
];

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function Hero() {
	const [active, setActive] = useState<HeroTabId>("analytics");
	const reduceMotion = useReducedMotion();
	const tablistId = useId();

	const selectByOffset = useCallback((offset: number) => {
		setActive((current) => {
			const index = TABS.findIndex((tab) => tab.id === current);
			const next = (index + offset + TABS.length) % TABS.length;
			return TABS[next]?.id ?? current;
		});
	}, []);

	const [copiedCommand, setCopiedCommand] = useState(false);

	const handleCopyCommand = async () => {
		try {
			await navigator.clipboard.writeText("npx reloop init");
			setCopiedCommand(true);
			window.setTimeout(() => setCopiedCommand(false), 2000);
		} catch {
			// ignore
		}
	};

	return (
		<section
			id="features"
			className="relative flex min-h-dvh flex-col bg-transparent pt-40 sm:pt-48 lg:pt-56"
		>
			<div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center sm:px-8 md:max-w-7xl lg:px-12">
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
						<a href={hostedSignupHref}>Start Building</a>
					</FancyButton.Root>
					<FancyButton.Root asChild variant="basic" size="small">
						<a href="/docs">Documentation</a>
					</FancyButton.Root>
				</div>

				<div className="mt-8 w-full max-w-2xl rounded-xl border border-stroke-soft-200 bg-[#121214] p-4 text-left font-mono text-[13px] shadow-sm sm:mt-10 sm:px-5 sm:py-4 sm:text-sm dark:border-white/10">
					<p className="text-zinc-400 leading-relaxed">
						<span className="text-zinc-500"># </span>
						<span>The self-hosted version is ready on your server in under a minute – </span>
						<span className="text-amber-300/90 dark:text-amber-300/90">
							always free, with all functionalities.
						</span>
					</p>
					<div className="mt-2.5 flex items-center justify-between gap-4 sm:mt-3">
						<div className="flex items-center gap-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
							<span className="select-none text-zinc-500">&gt;</span>
							<code className="text-zinc-100">npx reloop init</code>
						</div>
						<button
							type="button"
							onClick={handleCopyCommand}
							aria-label="Copy command"
							className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
						>
							{copiedCommand ? (
								<Icon
									name="check"
									className="size-4 text-emerald-400"
								/>
							) : (
								<Icon name="copy" className="size-4" />
							)}
						</button>
					</div>
				</div>
			</div>

			<div className="relative mx-auto mt-8 w-full max-w-5xl flex-1 flex-col border-stroke-soft-200 border-x sm:mt-10 md:max-w-7xl dark:border-white/10">
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
					className="relative z-10 mx-auto flex h-[32rem] w-full max-w-5xl flex-col px-3 pt-10 pb-10 sm:h-[40rem] sm:px-6 sm:pt-14 sm:pb-14 md:max-w-7xl lg:h-[48rem] lg:px-8 lg:pt-20 lg:pb-16"
				>
					<HeroDemoPlaybackProvider>
						<HeroWindowChrome
							action={active === "sdk" ? <HeroDemoPlaybackButton /> : undefined}
						>
							<AnimatePresence mode="wait" initial={false}>
								<motion.div
									key={active}
									className="absolute inset-0"
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
									<HeroPreview tab={active} />
								</motion.div>
							</AnimatePresence>
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
