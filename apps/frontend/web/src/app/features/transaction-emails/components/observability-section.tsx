"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

type Tab = {
	id: string;
	label: string;
	icon: string;
	description: string;
	light: string;
	dark: string;
};

const TABS: Tab[] = [
	{
		id: "email",
		label: "Email details",
		icon: "mail-single",
		description: "Track every message from sent to clicked.",
		light: "/platform/observability/email-light.png",
		dark: "/platform/observability/email-dark.png",
	},
	{
		id: "logs",
		label: "Logs",
		icon: "logs",
		description: "Inspect the request and response of every API call.",
		light: "/platform/observability/logs-light.png",
		dark: "/platform/observability/logs-dark.png",
	},
	{
		id: "webhooks",
		label: "Webhooks",
		icon: "webhook",
		description: "Stream every event into your own database.",
		light: "/platform/observability/webhooks-light.png",
		dark: "/platform/observability/webhooks-dark.png",
	},
];

const TAB_DURATION = 6000;

export function ObservabilitySection() {
	const [active, setActive] = useState(0);
	const [autoplay, setAutoplay] = useState(true);
	const [failed, setFailed] = useState<Record<string, boolean>>({});

	useEffect(() => {
		if (!autoplay) return;
		const timer = window.setInterval(
			() => setActive((current) => (current + 1) % TABS.length),
			TAB_DURATION,
		);
		return () => window.clearInterval(timer);
	}, [autoplay]);

	const tab = TABS[active] ?? TABS[0];
	if (!tab) return null;

	return (
		<section
			id="observability"
			aria-labelledby="observability-heading"
			className="w-full bg-bg-white-0 dark:bg-black"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-16 text-center sm:px-8 sm:py-20 lg:px-12 dark:border-white/10">
				<span className="inline-flex items-center gap-1.5 font-medium text-[13px] text-text-sub-600 dark:text-white/60">
					<Icon name="eye-outline" className="size-3.5" aria-hidden />
					Observability
				</span>
				<h2
					id="observability-heading"
					className="mt-3 text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.6rem] dark:text-white"
				>
					Complete visibility of every send
				</h2>
				<p className="mx-auto mt-3 max-w-2xl text-balance text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60">
					Every email generates events like opens, clicks, and bounces. See them
					in the dashboard or store them in your own database with webhooks.
				</p>
			</div>

			<div
				role="tablist"
				aria-label="Observability views"
				className="grid grid-cols-3 gap-px border-stroke-soft-100 border-b bg-stroke-soft-100 dark:border-white/10 dark:bg-white/10"
			>
				{TABS.map((t, index) => {
					const selected = index === active;
					return (
						<button
							key={t.id}
							type="button"
							role="tab"
							id={`observability-tab-${t.id}`}
							aria-selected={selected}
							aria-controls="observability-panel"
							onClick={() => {
								setActive(index);
								setAutoplay(false);
							}}
							className={cn(
								"relative flex items-start gap-4 px-4 py-6 text-left transition-colors sm:px-8 sm:py-7 lg:px-10",
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
								<span className="hidden text-[13px] text-text-sub-600 leading-relaxed sm:line-clamp-2 sm:text-[14px] dark:text-white/50">
									{t.description}
								</span>
							</span>
							<span className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
								{selected &&
									(autoplay ? (
										<motion.span
											key={active}
											className="block h-full origin-left bg-text-strong-950 motion-reduce:hidden dark:bg-white"
											initial={{ scaleX: 0 }}
											animate={{ scaleX: 1 }}
											transition={{
												duration: TAB_DURATION / 1000,
												ease: "linear",
											}}
										/>
									) : (
										<span className="block h-full bg-text-strong-950 dark:bg-white" />
									))}
							</span>
						</button>
					);
				})}
			</div>

			<div
				id="observability-panel"
				role="tabpanel"
				aria-labelledby={`observability-tab-${tab.id}`}
				className="relative h-[420px] w-full overflow-hidden bg-gradient-to-b from-orange-100 via-amber-50 to-bg-white-0 px-6 pt-6 sm:h-[560px] sm:px-10 sm:pt-10 lg:h-[640px] lg:px-14 lg:pt-14 dark:from-orange-950/40 dark:via-orange-950/10 dark:to-black"
			>
				<div className="relative h-full w-full overflow-hidden rounded-t-xl border border-stroke-soft-100 border-b-0 bg-bg-white-0 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)] sm:rounded-t-2xl dark:border-white/10 dark:bg-black dark:shadow-black/60">
					{failed[tab.id] ? (
						<div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-soft-400 dark:text-white/30">
							<Icon name={tab.icon} className="size-6" aria-hidden />
							<span className="text-[13px]">{tab.label}</span>
						</div>
					) : (
						<>
							<Image
								key={`${tab.id}-light`}
								src={tab.light}
								alt={`${tab.label} in the Reloop dashboard`}
								fill
								className="object-cover object-top dark:hidden"
								sizes="(max-width: 1280px) 100vw, 1200px"
								onError={() => setFailed((f) => ({ ...f, [tab.id]: true }))}
							/>
							<Image
								key={`${tab.id}-dark`}
								src={tab.dark}
								alt=""
								fill
								className="hidden object-cover object-top dark:block"
								sizes="(max-width: 1280px) 100vw, 1200px"
								onError={() => setFailed((f) => ({ ...f, [tab.id]: true }))}
							/>
						</>
					)}
				</div>
			</div>
		</section>
	);
}
