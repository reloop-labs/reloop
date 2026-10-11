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
		icon: "mail",
		description: "Track every message from sent to clicked.",
		light: "/platform/observability/email-light.png",
		dark: "/platform/observability/email-dark.png",
	},
	{
		id: "logs",
		label: "Logs",
		icon: "eye-outline",
		description: "Inspect the request and response of every API call.",
		light: "/platform/observability/logs-light.png",
		dark: "/platform/observability/logs-dark.png",
	},
	{
		id: "webhooks",
		label: "Webhooks",
		icon: "arrow-swap",
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
								"relative flex flex-col gap-1.5 px-4 py-6 text-left transition-colors sm:px-8 sm:py-7 lg:px-10",
								selected
									? "bg-bg-white-0 dark:bg-black"
									: "bg-bg-white-0 hover:bg-bg-weak-50 dark:bg-black dark:hover:bg-white/[0.03]",
							)}
						>
							<span
								className={cn(
									"font-medium text-[14px] sm:text-[16px]",
									selected
										? "text-text-strong-950 dark:text-white"
										: "text-text-sub-600 dark:text-white/50",
								)}
							>
								{t.label}
							</span>
							<span className="hidden text-[13px] text-text-sub-600 leading-relaxed sm:block sm:text-[15px] dark:text-white/50">
								{t.description}
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
				className="px-4 py-6 sm:px-8 sm:py-8 lg:px-12"
			>
				<div className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-weak-50 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[#080808] dark:shadow-black/60">
					<div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/9]">
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
									className="object-cover object-left-top dark:hidden"
									sizes="(max-width: 1280px) 100vw, 1200px"
									onError={() => setFailed((f) => ({ ...f, [tab.id]: true }))}
								/>
								<Image
									key={`${tab.id}-dark`}
									src={tab.dark}
									alt=""
									fill
									className="hidden object-cover object-left-top dark:block"
									sizes="(max-width: 1280px) 100vw, 1200px"
									onError={() => setFailed((f) => ({ ...f, [tab.id]: true }))}
								/>
							</>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
