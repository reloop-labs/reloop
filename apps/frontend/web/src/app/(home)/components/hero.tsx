"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useId, useState } from "react";
import { HeroPreview, type HeroTabId } from "./hero-preview";

const TABS: {
	id: HeroTabId;
	title: string;
	description: string;
	cloud?: boolean;
}[] = [
	{
		id: "api",
		title: "API",
		description: "Send, receive, and route email for any use case.",
	},
	{
		id: "dashboard",
		title: "Dashboard",
		description: "Customizable console for your email.",
	},
	{
		id: "sdk",
		title: "SDK",
		description: "Guardrails for agents to build email workflows.",
	},
	{
		id: "cloud",
		title: "Infrastructure",
		description: "Push from GitHub to the fastest infrastructure.",
		cloud: true,
	},
	{
		id: "agents",
		title: "Agent Inbox",
		description: "MCP, CLI, Skills, and Agent Previews.",
		cloud: true,
	},
];

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function Hero() {
	const [active, setActive] = useState<HeroTabId>("cloud");
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
			className="relative flex min-h-dvh flex-col overflow-hidden bg-transparent pt-40 sm:pt-48 lg:pt-56"
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
					className="flex overflow-x-auto border-stroke-soft-200 border-t [scrollbar-width:none] lg:grid lg:grid-cols-5 dark:border-white/10 [&::-webkit-scrollbar]:hidden"
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

				<div className="relative flex min-h-0 flex-1 flex-col bg-bg-weak-50 px-3 pt-3 sm:px-6 sm:pt-5 lg:px-8 lg:pt-6 dark:bg-white/[0.03]">
					<div
						id={`${tablistId}-panel`}
						role="tabpanel"
						aria-labelledby={`${tablistId}-${active}`}
						className="relative min-h-[22rem] flex-1 overflow-hidden rounded-t-xl border border-stroke-soft-200 border-b-0 bg-bg-white-0 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] sm:min-h-[26rem] sm:rounded-t-2xl dark:border-white/10 dark:bg-black dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
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
					</div>
				</div>
			</div>
		</section>
	);
}
