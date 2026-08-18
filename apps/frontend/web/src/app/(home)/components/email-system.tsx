"use client";

import { cn } from "@reloop/ui/cn";
import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeroPreview, type HeroTabId } from "./hero-preview";

const SCENES = [
	{
		id: "send",
		nav: "Send transactional",
		title: "Receipts and resets that actually arrive.",
		body: "One API, one SMTP relay. Same payload from Node, Python, or a cron on the box.",
		preview: "dashboard" as HeroTabId,
	},
	{
		id: "deliver",
		nav: "Land in the inbox",
		title: "Authentication first. Placement after.",
		body: "SPF, DKIM, and DMARC on your domain. Watch bounce and complaint rates before they become a listing.",
		preview: "cloud" as HeroTabId,
	},
	{
		id: "inbound",
		nav: "Receive inbound",
		title: "Mail hits your domain. Your app gets the payload.",
		body: "Parse the body, pull the attachments, POST a webhook. No extra inbox to babysit.",
		preview: "dashboard" as HeroTabId,
	},
	{
		id: "agents",
		nav: "Run agent inbox",
		title: "Agents draft. You approve the ones that matter.",
		body: "MCP, CLI, and a human-in-the-loop queue. The agent writes the reply; you tap approve.",
		preview: "agents" as HeroTabId,
	},
	{
		id: "track",
		nav: "Watch every send",
		title: "Opens, clicks, bounces — as they happen.",
		body: "A live console for the mail you just sent. No waiting on a daily dump.",
		preview: "analytics" as HeroTabId,
	},
] as const;

type SceneId = (typeof SCENES)[number]["id"];

export default function EmailSystem() {
	const [active, setActive] = useState<SceneId>(SCENES[0].id);
	const reduceMotion = useReducedMotion();
	const panelRefs = useRef<Record<string, HTMLElement | null>>({});

	useEffect(() => {
		const nodes = SCENES.map((scene) => panelRefs.current[scene.id]).filter(
			(el): el is HTMLElement => Boolean(el),
		);
		if (nodes.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
				const id = visible[0]?.target.getAttribute("data-scene");
				if (id) setActive(id as SceneId);
			},
			{
				rootMargin: "-28% 0px -48% 0px",
				threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
			},
		);

		for (const node of nodes) observer.observe(node);
		return () => observer.disconnect();
	}, []);

	const goTo = useCallback(
		(id: SceneId) => {
			setActive(id);
			panelRefs.current[id]?.scrollIntoView({
				behavior: reduceMotion ? "auto" : "smooth",
				block: "start",
			});
		},
		[reduceMotion],
	);

	return (
		<section
			id="product"
			aria-labelledby="email-system-heading"
			className="w-full"
		>
			<div className="px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
				<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/45">
					Product
				</p>
				<h2
					id="email-system-heading"
					className="mt-4 max-w-4xl font-serif text-[2.4rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3rem] lg:text-[3.4rem] dark:text-white"
				>
					The email system that never sleeps.
				</h2>
				<p className="mt-5 max-w-3xl text-[17px] text-text-sub-600 leading-snug sm:text-[20px] lg:text-[22px] dark:text-white/50">
					Sends at 2am. Catches bounces before they pile up. Hands you the draft
					before you ask.
				</p>
			</div>

			<div className="border-stroke-soft-200 border-t lg:grid lg:grid-cols-[minmax(13rem,17.5rem)_minmax(0,1fr)] dark:border-white/10">
				<aside className="top-16 z-10 border-stroke-soft-200 border-b bg-bg-white-0 lg:sticky lg:self-start lg:border-r lg:border-b-0 dark:border-white/10 dark:bg-black">
					<nav
						aria-label="Product scenes"
						className="flex gap-1 overflow-x-auto px-4 py-3 [scrollbar-width:none] lg:flex-col lg:gap-0 lg:px-0 lg:py-10 lg:pr-6 lg:pl-8 [&::-webkit-scrollbar]:hidden"
					>
						{SCENES.map((scene) => {
							const selected = scene.id === active;
							return (
								<button
									key={scene.id}
									type="button"
									onClick={() => goTo(scene.id)}
									className={cn(
										"relative shrink-0 px-3 py-2 text-left font-medium text-[14px] tracking-[-0.01em] transition-colors lg:px-4 lg:py-2.5 lg:text-[15px]",
										selected
											? "text-text-strong-950 dark:text-white"
											: "text-text-soft-400 hover:text-text-sub-600 dark:text-white/35 dark:hover:text-white/55",
									)}
									aria-current={selected ? "true" : undefined}
								>
									{selected ? (
										<span className="absolute top-2 bottom-2 left-0 hidden w-[2px] bg-text-strong-950 lg:block dark:bg-white" />
									) : null}
									{scene.nav}
								</button>
							);
						})}
					</nav>
				</aside>

				<div>
					{SCENES.map((scene, index) => (
						<article
							key={scene.id}
							id={`email-system-${scene.id}`}
							data-scene={scene.id}
							ref={(el) => {
								panelRefs.current[scene.id] = el;
							}}
							className={cn(
								"scroll-mt-28 px-4 py-12 sm:px-8 sm:py-16 lg:min-h-[78vh] lg:px-12 lg:py-16",
								index < SCENES.length - 1 &&
									"border-stroke-soft-200 border-b dark:border-white/10",
							)}
						>
							<h3 className="max-w-xl font-medium text-[1.35rem] text-text-strong-950 leading-snug tracking-tight sm:text-[1.6rem] dark:text-white">
								{scene.title}
							</h3>
							<p className="mt-3 max-w-lg text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/50">
								{scene.body}
							</p>
							<div className="relative mt-10 min-h-[20rem] overflow-hidden rounded-t-xl border border-stroke-soft-200 border-b-0 bg-bg-white-0 sm:min-h-[24rem] sm:rounded-t-2xl dark:border-white/10 dark:bg-black">
								<HeroPreview tab={scene.preview} />
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
