"use client";

import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { EmailAnalyticsSection } from "./email-analytics";
import type { AnalyticsTabId } from "./email-analytics/preview-scenes";
import { MarketingEmailsSection } from "./marketing-emails";
import type { MarketingTabId } from "./marketing-emails/preview-scenes";
import { SceneGlyph } from "./_shared/scene-header";
import { TemplatesSection } from "./templates";
import type { TemplateTabId } from "./templates/preview-scenes";
import { TransactionalEmailSection } from "./transactional-email";
import type { PreviewTabId } from "./transactional-email/preview-scenes";
import { WorkflowsSection } from "./workflows";

const SECTIONS = [
	{
		id: "transactional",
		nav: "Transactional Email",
		Component: TransactionalEmailSection,
		subItems: [
			{ id: "send", label: "Send API" },
			{ id: "templates", label: "React Email supported" },
			{ id: "events", label: "Webhooks" },
		],
	},
	{
		id: "analytics",
		nav: "Email Analytics",
		Component: EmailAnalyticsSection,
		subItems: [
			{ id: "metrics", label: "Metrics" },
			{ id: "engagement", label: "Engagement & clicks" },
			{ id: "bounces", label: "Bounces & Diagnostics" },
		],
	},
	{
		id: "templates",
		nav: "AI Email Templates",
		Component: TemplatesSection,
		subItems: [
			{ id: "ai-templates", label: "AI-powered templates" },
			{ id: "realtime-editor", label: "Real-time editor" },
			{ id: "version-history", label: "Version history" },
		],
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
		subItems: [
			{ id: "upload-data", label: "Upload data" },
			{ id: "manage-funnels", label: "Manage funnels" },
			{ id: "analytics", label: "Analytics" },
		],
	},
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/** Matches `scroll-mt-24` so spy and click land on the same item. */
const SCROLL_MARKER = 96;
const INDICATOR_INSET = 4;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

export default function EmailSystem() {
	const [active, setActive] = useState<SectionId>(SECTIONS[0].id);
	const [transactionalTab, setTransactionalTab] =
		useState<PreviewTabId>("send");
	const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTabId>("metrics");
	const [templateTab, setTemplateTab] =
		useState<TemplateTabId>("ai-templates");
	const [marketingTab, setMarketingTab] =
		useState<MarketingTabId>("upload-data");

	const reduceMotion = useReducedMotion();
	const panelRefs = useRef<Record<string, HTMLElement | null>>({});
	const navRef = useRef<HTMLElement>(null);
	const scrollingTo = useRef<SectionId | null>(null);
	const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const activeRef = useRef(active);
	activeRef.current = active;

	const pickActiveFromScroll = useCallback(() => {
		if (scrollingTo.current) return;

		// If user scrolled to near the bottom of the page, pick the last section
		const lastSection = SECTIONS[SECTIONS.length - 1];
		if (
			typeof window !== "undefined" &&
			lastSection &&
			window.innerHeight + window.scrollY >=
				document.documentElement.scrollHeight - 60
		) {
			if (lastSection.id !== activeRef.current) {
				setActive(lastSection.id);
			}
			return;
		}

		const marker = 160;
		let next: SectionId = SECTIONS[0].id;
		for (const section of SECTIONS) {
			const el = panelRefs.current[section.id];
			if (!el) continue;
			if (el.getBoundingClientRect().top <= marker) {
				next = section.id;
			}
		}

		if (next !== activeRef.current) {
			setActive(next);
		}
	}, []);

	useEffect(() => {
		let ticking = false;
		const onScroll = () => {
			if (scrollingTo.current) return;
			if (!ticking) {
				window.requestAnimationFrame(() => {
					pickActiveFromScroll();
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current);
			}
		};
	}, [pickActiveFromScroll]);

	const goTo = useCallback(
		(id: SectionId, isSubItem = false) => {
			setActive(id);
			scrollingTo.current = id;

			const stageEl = isSubItem
				? document.getElementById(`email-stage-${id}`)
				: null;
			const targetEl = stageEl ?? panelRefs.current[id];

			if (targetEl) {
				const headerOffset = 72;
				const elementPosition = targetEl.getBoundingClientRect().top;
				const offsetPosition =
					elementPosition + window.scrollY - headerOffset;
				window.scrollTo({
					top: offsetPosition,
					behavior: reduceMotion ? "auto" : "smooth",
				});
			}

			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current);
			}
			scrollTimeoutRef.current = setTimeout(() => {
				scrollingTo.current = null;
			}, 900);
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
							{SECTIONS.map((section) => {
								const selected = section.id === active;
								const hasSubItems =
									"subItems" in section && section.subItems;

								return (
									<div key={section.id} className="relative w-full shrink-0">
										<button
											type="button"
											onClick={() => goTo(section.id, false)}
											className={cn(
												"relative w-full shrink-0 px-3.5 py-2 text-left font-medium text-[15px] tracking-[-0.01em] transition-colors duration-150 focus:outline-hidden lg:py-2 lg:pr-6 lg:pl-8 lg:text-[17px]",
												selected
													? "text-text-strong-950 dark:text-white"
													: "text-text-soft-400 hover:text-text-sub-600 dark:text-white/30 dark:hover:text-white/60",
											)}
											aria-current={selected ? "true" : undefined}
										>
											{selected && (
												<motion.span
													layoutId="email-system-active-indicator"
													className="pointer-events-none absolute -left-[1.5px] top-1.5 bottom-1.5 hidden w-0.5 bg-primary-base lg:block"
													transition={
														reduceMotion
															? { duration: 0 }
															: {
																	type: "spring",
																	bounce: 0.15,
																	duration: 0.28,
																}
													}
												/>
											)}
											{section.nav}
										</button>

										{selected && hasSubItems && (
											<div className="relative ml-8 my-1.5 hidden flex-col lg:flex animate-in fade-in duration-150">
												{/* Vertical dotted trunk line */}
												<div
													aria-hidden="true"
													className="pointer-events-none absolute left-0 top-0 bottom-3 w-px border-l border-dotted border-stroke-sub-300 dark:border-white/20"
												/>

												{section.subItems.map((sub) => {
													const currentSubTab =
														section.id === "transactional"
															? transactionalTab
															: section.id === "analytics"
																? analyticsTab
																: section.id === "templates"
																	? templateTab
																	: marketingTab;
													const isSubActive = currentSubTab === sub.id;

													const handleSubClick = () => {
														if (section.id === "transactional") {
															setTransactionalTab(sub.id as PreviewTabId);
														} else if (section.id === "analytics") {
															setAnalyticsTab(sub.id as AnalyticsTabId);
														} else if (section.id === "templates") {
															setTemplateTab(sub.id as TemplateTabId);
														} else if (section.id === "marketing") {
															setMarketingTab(sub.id as MarketingTabId);
														}
														goTo(section.id, true);
													};

													return (
														<button
															key={sub.id}
															type="button"
															onClick={handleSubClick}
															className={cn(
																"group relative flex w-full items-center py-1.5 pl-4 pr-3 text-left text-[13.5px] transition-colors duration-150 focus:outline-hidden",
																isSubActive
																	? "font-semibold text-text-strong-950 dark:text-white"
																	: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white",
															)}
														>
															{/* Horizontal dotted connector branch directly touching vertical line */}
															<span
																aria-hidden="true"
																className={cn(
																	"pointer-events-none absolute left-0 top-1/2 w-2.5 -translate-y-1/2 border-b border-dotted transition-colors duration-150",
																	isSubActive
																		? "border-text-strong-950 dark:border-white"
																		: "border-stroke-sub-300 dark:border-white/20 group-hover:border-text-sub-600 dark:group-hover:border-white/50",
																)}
															/>
															<span className="truncate">{sub.label}</span>
														</button>
													);
												})}
											</div>
										)}
									</div>
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
							{id === "transactional" ? (
								<TransactionalEmailSection
									activeTab={transactionalTab}
									onTabChange={setTransactionalTab}
								/>
							) : id === "analytics" ? (
								<EmailAnalyticsSection
									activeTab={analyticsTab}
									onTabChange={setAnalyticsTab}
								/>
							) : id === "templates" ? (
								<TemplatesSection
									activeTab={templateTab}
									onTabChange={setTemplateTab}
								/>
							) : id === "marketing" ? (
								<MarketingEmailsSection
									activeTab={marketingTab}
									onTabChange={setMarketingTab}
								/>
							) : (
								<Component />
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
