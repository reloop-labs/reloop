"use client";

import { cn } from "@reloop/ui/cn";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import {
	PLATFORM_ALT,
	type PlatformTabId,
	TAB_SCREENSHOT,
	TABS,
} from "./platform-tabs-data";

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

			{/* Tab header: mirrors reference: 5 columns, dividers, active underline */}
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

			{/* Preview panel: stable shell. Screenshots do a plain crisp crossfade with
		    no movement, scale, or blur so text stays sharp. */}
			<div className="relative h-[560px] w-full overflow-hidden bg-bg-white-0 sm:h-[640px] lg:h-[720px] dark:bg-black">
				{/* Stable screenshot frame, never remounts */}
				<div className="relative h-full w-full px-10 pt-10">
					<div className="relative h-full w-full overflow-hidden border border-stroke-soft-100 border-b-0 bg-bg-white-0 dark:border-white/10 dark:bg-black">
						{TABS.map((tab) => {
							const selected = tab.id === active;
							const shot = TAB_SCREENSHOT[tab.id];
							return (
								<div
									key={tab.id}
									aria-hidden={!selected}
									className={`absolute inset-0 transition-opacity ease-out ${
										reduceMotion ? "duration-150" : "duration-300"
									} ${selected ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"}`}
								>
									<Image
										src={shot.src}
										alt={selected ? PLATFORM_ALT[tab.id] : ""}
										fill
										sizes="100vw"
										className="object-cover object-top dark:hidden"
										priority={tab.id === "domains"}
										loading={tab.id === "domains" ? undefined : "eager"}
										draggable={false}
									/>
									<Image
										src={shot.darkSrc}
										alt=""
										aria-hidden
										fill
										sizes="100vw"
										className="hidden object-cover object-top dark:block"
										priority={tab.id === "domains"}
										loading={tab.id === "domains" ? undefined : "eager"}
										draggable={false}
									/>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
