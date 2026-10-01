"use client";

import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const chapters = [
	{
		label: "Send",
		title: "Ship transactional email without babysitting infrastructure.",
		description:
			"Send through REST or SMTP, then follow every delivery event from request to inbox.",
		light: "/platform/email-light.png",
		dark: "/platform/email-dark.png",
	},
	{
		label: "Engage",
		title: "Turn product data into campaigns people care about.",
		description:
			"Build audiences, launch broadcasts, and keep engagement data beside transactional activity.",
		light: "/platform/campaign-light.png",
		dark: "/platform/campaign-dark.png",
	},
	{
		label: "Receive",
		title: "Give every agent an inbox it can act on.",
		description:
			"Receive messages, parse replies and attachments, and route structured events into agent workflows.",
		light: "/platform/agent-inbox-light.png",
		dark: "/platform/agent-inbox-dark.png",
	},
	{
		label: "Understand",
		title: "See what happened after every send.",
		description:
			"Inspect delivery, opens, clicks, bounces, and failures without jumping between separate products.",
		light: "/platform/analytics-light.png",
		dark: "/platform/analytics-dark.png",
	},
] as const;

const CHAPTER_DURATION = 6000;

export function ProductTour() {
	const [active, setActive] = useState(0);
	const [playing, setPlaying] = useState(false);

	useEffect(() => {
		if (!playing) return;
		const timer = window.setInterval(
			() => setActive((current) => (current + 1) % chapters.length),
			CHAPTER_DURATION,
		);
		return () => window.clearInterval(timer);
	}, [playing]);

	const chapter = chapters[active] ?? chapters[0];

	return (
		<section
			aria-labelledby="product-tour-heading"
			className="bg-white dark:bg-black"
		>
			<div className="border-zinc-950/[0.08] border-b px-6 py-14 text-center sm:px-10 sm:py-20 dark:border-white/10">
				<p className="font-medium text-[12px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/45">
					Interactive product tour
				</p>
				<h2
					id="product-tour-heading"
					className="mx-auto mt-4 max-w-3xl text-balance font-semibold text-4xl text-text-strong-950 tracking-[-0.035em] sm:text-5xl dark:text-white"
				>
					See your entire email stack in one place.
				</h2>
				<p className="mx-auto mt-5 max-w-2xl text-balance text-base text-text-sub-600 leading-7 sm:text-lg dark:text-white/55">
					Send transactional messages, launch campaigns, receive replies, and
					give AI agents their own inboxes—from one open platform.
				</p>
			</div>

			<div className="grid gap-px bg-stroke-soft-100 lg:grid-cols-[15rem_minmax(0,1fr)] dark:bg-white/10">
				<div className="grid grid-cols-2 gap-px bg-stroke-soft-100 lg:grid-cols-1 dark:bg-white/10">
					{chapters.map((item, index) => {
						const selected = index === active;
						return (
							<button
								key={item.label}
								type="button"
								onClick={() => {
									setActive(index);
									setPlaying(false);
								}}
								aria-pressed={selected}
								className={`relative min-h-24 bg-white px-5 py-5 text-left transition-colors sm:px-6 lg:min-h-0 dark:bg-black ${
									selected
										? "text-text-strong-950 dark:text-white"
										: "text-text-sub-600 hover:bg-bg-weak-50 dark:text-white/45 dark:hover:bg-white/[0.04]"
								}`}
							>
								<span className="block font-medium text-[11px] uppercase tracking-[0.14em] opacity-60">
									0{index + 1}
								</span>
								<span className="mt-2 block font-semibold text-[15px] tracking-tight">
									{item.label}
								</span>
								{selected ? (
									<span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 lg:inset-y-0 lg:right-auto lg:h-auto lg:w-0.5" />
								) : null}
							</button>
						);
					})}
				</div>

				<div className="min-w-0 bg-white p-3 sm:p-5 lg:p-7 dark:bg-black">
					<div className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-weak-50 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[#080808] dark:shadow-black/60">
						<div className="flex items-center justify-between border-stroke-soft-100 border-b px-4 py-3 dark:border-white/10">
							<div className="flex items-center gap-1.5" aria-hidden>
								<span className="size-2 rounded-full bg-red-400/80" />
								<span className="size-2 rounded-full bg-amber-400/80" />
								<span className="size-2 rounded-full bg-emerald-400/80" />
							</div>
							<span className="font-medium text-[11px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/40">
								{chapter.label} with Reloop
							</span>
							<span className="w-9" />
						</div>

						<div className="group relative aspect-[4/3] overflow-hidden bg-white sm:aspect-video dark:bg-black">
							<Image
								key={`${chapter.label}-light`}
								src={chapter.light}
								alt={`${chapter.label} in the Reloop dashboard`}
								fill
								priority={active === 0}
								className="object-cover object-left-top transition-opacity duration-300 dark:hidden"
								sizes="(max-width: 1024px) 100vw, 850px"
							/>
							<Image
								key={`${chapter.label}-dark`}
								src={chapter.dark}
								alt=""
								fill
								className="hidden object-cover object-left-top transition-opacity duration-300 dark:block"
								sizes="(max-width: 1024px) 100vw, 850px"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
							<button
								type="button"
								onClick={() => setPlaying((current) => !current)}
								className="absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full border border-white/30 bg-black/75 text-white shadow-xl backdrop-blur-sm transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:size-16"
								aria-label={
									playing ? "Pause product tour" : "Play product tour"
								}
							>
								{playing ? (
									<Pause className="size-5" />
								) : (
									<Play className="ml-0.5 size-5" />
								)}
							</button>
						</div>

						<div className="border-stroke-soft-100 border-t px-5 py-5 sm:px-6 sm:py-6 dark:border-white/10">
							<div className="flex items-start justify-between gap-5">
								<div>
									<h3 className="max-w-xl font-semibold text-lg text-text-strong-950 tracking-tight sm:text-xl dark:text-white">
										{chapter.title}
									</h3>
									<p className="mt-2 max-w-2xl text-sm text-text-sub-600 leading-6 sm:text-[15px] dark:text-white/50">
										{chapter.description}
									</p>
								</div>
								<span className="shrink-0 rounded-full border border-stroke-soft-100 px-2.5 py-1 font-medium text-[11px] text-text-sub-600 dark:border-white/10 dark:text-white/45">
									{active + 1} / {chapters.length}
								</span>
							</div>
							{playing ? (
								<div className="mt-5 h-0.5 overflow-hidden rounded-full bg-stroke-soft-100 dark:bg-white/10">
									<motion.div
										key={active}
										className="h-full origin-left bg-blue-500 motion-reduce:hidden"
										initial={{ scaleX: 0 }}
										animate={{ scaleX: 1 }}
										transition={{
											duration: CHAPTER_DURATION / 1000,
											ease: "linear",
										}}
									/>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
