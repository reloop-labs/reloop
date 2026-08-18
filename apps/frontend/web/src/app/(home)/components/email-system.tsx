"use client";

import { cn } from "@reloop/ui/cn";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { EmailAnalyticsSection } from "./email-analytics";
import { MarketingEmailsSection } from "./marketing-emails";
import { TemplatesSection } from "./templates";
import { TransactionalEmailSection } from "./transactional-email";
import { WorkflowsSection } from "./workflows";

const SECTIONS = [
	{
		id: "transactional",
		nav: "Transactional email",
		Component: TransactionalEmailSection,
	},
	{
		id: "analytics",
		nav: "Email analytics",
		Component: EmailAnalyticsSection,
	},
	{
		id: "templates",
		nav: "Templates",
		Component: TemplatesSection,
	},
	{
		id: "workflows",
		nav: "Workflows",
		Component: WorkflowsSection,
	},
	{
		id: "marketing",
		nav: "Marketing emails",
		Component: MarketingEmailsSection,
	},
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function EmailSystem() {
	const [active, setActive] = useState<SectionId>(SECTIONS[0].id);
	const reduceMotion = useReducedMotion();
	const panelRefs = useRef<Record<string, HTMLElement | null>>({});

	useEffect(() => {
		const nodes = SECTIONS.map(
			(section) => panelRefs.current[section.id],
		).filter((el): el is HTMLElement => Boolean(el));
		if (nodes.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
				const id = visible[0]?.target.getAttribute("data-scene");
				if (id) setActive(id as SectionId);
			},
			{
				rootMargin: "-20% 0px -40% 0px",
				threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
			},
		);

		for (const node of nodes) observer.observe(node);
		return () => observer.disconnect();
	}, []);

	const goTo = useCallback(
		(id: SectionId) => {
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
				<h2
					id="email-system-heading"
					className="mt-3 max-w-4xl font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl lg:text-4xl dark:text-white"
				>
					Convert your email stream into revenue.
				</h2>
				<p className="mt-3 max-w-3xl text-sm text-text-sub-600 leading-relaxed sm:text-base lg:text-[17px] dark:text-white/60">
					Sends at 2am. Catches bounces before they pile up. Hands you the draft
					before you ask.
				</p>
			</div>

			<div className="border-stroke-soft-200 border-t lg:grid lg:grid-cols-[minmax(14rem,18.5rem)_minmax(0,1fr)] dark:border-white/10">
				<div className="border-stroke-soft-200 border-b lg:border-r lg:border-b-0 dark:border-white/10">
					<aside className="top-16 z-10 bg-bg-white-0 lg:sticky dark:bg-black">
						<nav
							aria-label="Product scenes"
							className="flex gap-1 overflow-x-auto px-4 py-3 [scrollbar-width:none] lg:flex-col lg:gap-0.5 lg:p-0 lg:py-10 [&::-webkit-scrollbar]:hidden"
						>
							{SECTIONS.map((section) => {
								const selected = section.id === active;
								return (
									<button
										key={section.id}
										type="button"
										onClick={() => goTo(section.id)}
										className={cn(
											"relative w-full shrink-0 px-3.5 py-2 text-left font-medium text-[15px] tracking-[-0.01em] transition-colors lg:py-2 lg:pr-6 lg:pl-8 lg:text-[17px]",
											selected
												? "font-semibold text-text-strong-950 dark:text-white"
												: "text-text-soft-400 hover:text-text-sub-600 dark:text-white/30 dark:hover:text-white/60",
										)}
										aria-current={selected ? "true" : undefined}
									>
										{selected ? (
											<motion.span
												layoutId="sidebar-active-indicator"
												className="-left-px absolute top-1 bottom-1 hidden w-[3.5px] rounded-r-full bg-blue-600 lg:block dark:bg-blue-500"
												transition={{
													type: "spring",
													stiffness: 380,
													damping: 30,
												}}
											/>
										) : null}
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
