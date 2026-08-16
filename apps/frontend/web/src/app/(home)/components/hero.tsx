"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { type ReactNode, useCallback, useId, useState } from "react";
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
		icon: "activity" | "layout" | "book-open" | "server" | "headset";
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
		title: "SDK",
		description: "Guardrails for agents to build email workflows.",
		banner: {
			title: "SDKs",
			description: "Typed clients for Node, Python, Go, and more.",
			href: "/sdk",
			icon: "book-open",
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
			href: "/docs/self-host",
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

	return (
		<section
			id="features"
			className="relative flex min-h-dvh flex-col overflow-x-hidden bg-transparent pt-40 sm:pt-48 lg:pt-56"
		>
			<div className="px-6 sm:px-8 lg:px-12">
				<h1 className="max-w-[12em] font-medium text-[2.5rem] text-text-strong-950 leading-[1.02] tracking-[-0.045em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
					Email API for Developers
					<br />
					With agent inboxes built in
				</h1>
				<p className="mt-5 max-w-[52rem] text-[15px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[17px] dark:text-white/55">
					Open-source email infrastructure on GitHub. Extend, customize, and own
					every email workflow.
				</p>
				<div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7">
					<FancyButton.Root asChild variant="neutral" size="small">
						<a href={hostedSignupHref}>Start Building</a>
					</FancyButton.Root>
					<FancyButton.Root asChild variant="basic" size="small">
						<a href="/docs">Documentation</a>
					</FancyButton.Root>
				</div>
			</div>

			<div className="mt-8 flex min-h-0 flex-1 flex-col sm:mt-10">
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

				<div className="relative flex flex-1 flex-col overflow-hidden bg-bg-white-0 px-3 pt-3 pb-6 sm:px-6 sm:pt-5 sm:pb-8 lg:px-8 lg:pt-6 lg:pb-10 dark:bg-black">
					<HeroAtmosphere />
					<div
						id={`${tablistId}-panel`}
						role="tabpanel"
						aria-labelledby={`${tablistId}-${active}`}
						className="relative z-10 mx-auto flex min-h-[40rem] w-full max-w-5xl flex-1 flex-col sm:min-h-[48rem] lg:min-h-[56rem]"
					>
						<HeroWindowChrome>
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
					</div>
				</div>
			</div>
		</section>
	);
}

function HeroAtmosphere() {
	const fx = {
		glow: "radial-gradient(ellipse 110% 160% at 82% 100%, rgba(0, 111, 254, 0.3) 0%, transparent 62%)",
		glowAlt:
			"radial-gradient(ellipse 90% 140% at 6% 0%, rgba(56, 189, 248, 0.22) 0%, transparent 60%)",
		line: "rgba(0, 111, 254, 0.16)",
	};
	const lineMask =
		"radial-gradient(ellipse 85% 95% at 88% 110%, black 0%, transparent 68%), radial-gradient(ellipse 70% 90% at 4% -5%, black 0%, transparent 62%)";

	return (
		<div aria-hidden className="pointer-events-none absolute inset-0 z-0">
			<div className="absolute inset-0" style={{ backgroundImage: fx.glow }} />
			<div
				className="absolute inset-0"
				style={{ backgroundImage: fx.glowAlt }}
			/>
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: `repeating-linear-gradient(-45deg, transparent 0, transparent 3px, ${fx.line} 3px, ${fx.line} 3.55px)`,
					maskImage: lineMask,
					WebkitMaskImage: lineMask,
				}}
			/>
		</div>
	);
}

function HeroWindowChrome({ children }: { children: ReactNode }) {
	return (
		<div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] bg-[#F5F6F8] p-[7px] pt-8 sm:rounded-[24px] sm:p-2 sm:pt-9 dark:bg-[#1C1C1E] dark:ring-1 dark:ring-white/10">
			<div
				aria-hidden
				className="absolute top-[11px] left-3.5 flex items-center gap-[7px] sm:top-3 sm:left-4"
			>
				<span className="size-[11px] rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] sm:size-3" />
				<span className="size-[11px] rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] sm:size-3" />
				<span className="size-[11px] rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] sm:size-3" />
			</div>
			<div className="relative min-h-0 flex-1 overflow-hidden rounded-[13px] bg-bg-white-0 sm:rounded-[16px] dark:bg-black">
				{children}
			</div>
		</div>
	);
}

function HeroTabBanner({
	tabId,
	reduceMotion,
}: {
	tabId: HeroTabId;
	reduceMotion: boolean;
}) {
	const tab = TABS.find((item) => item.id === tabId) ?? TABS[0];
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
