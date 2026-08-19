"use client";

import { cn } from "@reloop/ui/cn";
import { useReducedMotion } from "framer-motion";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { EmailAnalyticsSection } from "./email-analytics";
import { MarketingEmailsSection } from "./marketing-emails";
import { SceneGlyph } from "./_shared/scene-header";
import { TemplatesSection } from "./templates";
import { TransactionalEmailSection } from "./transactional-email";
import { WorkflowsSection } from "./workflows";

const SECTIONS = [
	{
		id: "transactional",
		nav: "Transactional Email",
		Component: TransactionalEmailSection,
	},
	{
		id: "analytics",
		nav: "Email Analytics",
		Component: EmailAnalyticsSection,
	},
	{
		id: "templates",
		nav: "AI Email Templates",
		Component: TemplatesSection,
	},
	{
		id: "workflows",
		nav: "AI Workflow",
		Component: WorkflowsSection,
	},
	{
		id: "marketing",
		nav: "Marketing Emails",
		Component: MarketingEmailsSection,
	},
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/** Matches `scroll-mt-24` so spy and click land on the same item. */
const SCROLL_MARKER = 96;
const INDICATOR_INSET = 4;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

export default function EmailSystem() {
	const [active, setActive] = useState<SectionId>(SECTIONS[0].id);
	const [indicator, setIndicator] = useState({
		top: 0,
		height: 0,
		ready: false,
	});
	const reduceMotion = useReducedMotion();
	const panelRefs = useRef<Record<string, HTMLElement | null>>({});
	const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
	const navRef = useRef<HTMLElement>(null);
	const scrollingTo = useRef<SectionId | null>(null);
	const activeRef = useRef(active);
	activeRef.current = active;

	const placeIndicator = useCallback((id: SectionId) => {
		const button = buttonRefs.current[id];
		const nav = navRef.current;
		if (!button || !nav) return;
		const navBox = nav.getBoundingClientRect();
		const btnBox = button.getBoundingClientRect();
		setIndicator({
			top: btnBox.top - navBox.top + INDICATOR_INSET,
			height: Math.max(btnBox.height - INDICATOR_INSET * 2, 0),
			ready: true,
		});
	}, []);

	const pickActiveFromScroll = useCallback(() => {
		if (scrollingTo.current) return;

		let next: SectionId = SECTIONS[0].id;
		for (const section of SECTIONS) {
			const el = panelRefs.current[section.id];
			if (!el) continue;
			if (el.getBoundingClientRect().top <= SCROLL_MARKER + 8) {
				next = section.id;
			}
		}

		if (next !== activeRef.current) {
			setActive(next);
		}
	}, []);

	useLayoutEffect(() => {
		placeIndicator(active);
	}, [active, placeIndicator]);

	useEffect(() => {
		const nav = navRef.current;
		if (!nav) return;
		const observer = new ResizeObserver(() =>
			placeIndicator(activeRef.current),
		);
		observer.observe(nav);
		return () => observer.disconnect();
	}, [placeIndicator]);

	useEffect(() => {
		let frame = 0;
		const onScroll = () => {
			if (frame) return;
			frame = window.requestAnimationFrame(() => {
				frame = 0;
				pickActiveFromScroll();
			});
		};

		const unlock = () => {
			scrollingTo.current = null;
			pickActiveFromScroll();
		};

		pickActiveFromScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		window.addEventListener("scrollend", unlock);
		return () => {
			window.cancelAnimationFrame(frame);
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			window.removeEventListener("scrollend", unlock);
		};
	}, [pickActiveFromScroll]);

	const goTo = useCallback(
		(id: SectionId) => {
			setActive(id);
			scrollingTo.current = id;
			panelRefs.current[id]?.scrollIntoView({
				behavior: reduceMotion ? "auto" : "smooth",
				block: "start",
			});
			window.setTimeout(() => {
				if (scrollingTo.current === id) {
					scrollingTo.current = null;
					pickActiveFromScroll();
				}
			}, 800);
		},
		[pickActiveFromScroll, reduceMotion],
	);

	return (
		<section
			id="product"
			aria-labelledby="email-system-heading"
			className="w-full"
		>
			<div className="px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
				<div className="flex items-center gap-2">
					<SceneGlyph icon="agent" color="violet" />
					<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
						Agentic AI
					</span>
				</div>
				<h2
					id="email-system-heading"
					className="mt-3.5 max-w-3xl font-medium text-4xl text-text-strong-950 text-balance leading-[1.05] tracking-tighter sm:text-5xl dark:text-white"
				>
					Convert your email stream into revenue.
				</h2>
			</div>

			<div className="border-stroke-soft-200 border-t lg:grid lg:grid-cols-[minmax(14rem,18.5rem)_minmax(0,1fr)] dark:border-white/10">
				<div className="border-stroke-soft-200 border-b lg:overflow-visible lg:border-r lg:border-b-0 dark:border-white/10">
					<aside className="top-16 z-10 overflow-visible bg-bg-white-0 lg:sticky dark:bg-black">
						<nav
							ref={navRef}
							aria-label="Product scenes"
							className="relative flex gap-1 overflow-x-auto px-4 py-3 [scrollbar-width:none] lg:flex-col lg:gap-0.5 lg:overflow-visible lg:p-0 lg:py-10 [&::-webkit-scrollbar]:hidden"
						>
							<span
								aria-hidden
								className="pointer-events-none absolute top-0 left-[-1.5px] hidden w-0.5 bg-primary-base lg:block"
								style={{
									top: 0,
									height: indicator.height,
									opacity: indicator.ready ? 1 : 0,
									transform: `translateY(${indicator.top}px)`,
									transition: reduceMotion
										? "opacity 120ms ease"
										: `transform 180ms ${EASE_OUT}, height 180ms ${EASE_OUT}, opacity 120ms ease`,
								}}
							/>
							{SECTIONS.map((section) => {
								const selected = section.id === active;
								return (
									<button
										key={section.id}
										ref={(el) => {
											buttonRefs.current[section.id] = el;
										}}
										type="button"
										onClick={() => goTo(section.id)}
										className={cn(
											"relative w-full shrink-0 px-3.5 py-2 text-left font-medium text-[15px] tracking-[-0.01em] transition-colors duration-150 lg:py-2 lg:pr-6 lg:pl-8 lg:text-[17px]",
											selected
												? "text-text-strong-950 dark:text-white"
												: "text-text-soft-400 hover:text-text-sub-600 dark:text-white/30 dark:hover:text-white/60",
										)}
										aria-current={selected ? "true" : undefined}
									>
										{section.nav}
									</button>
								);
							})}
						</nav>
					</aside>
				</div>

				<div>
					{SECTIONS.map(({ id, Component }, index) => (
						<div
							key={id}
							id={`email-system-${id}`}
							data-scene={id}
							ref={(el) => {
								panelRefs.current[id] = el;
							}}
							className={cn(
								"scroll-mt-24",
								index < SECTIONS.length - 1 &&
									"border-stroke-soft-200 border-b dark:border-white/10",
							)}
						>
							<Component />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
