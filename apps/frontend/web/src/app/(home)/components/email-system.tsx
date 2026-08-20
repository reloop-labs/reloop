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
import { Icon, type IconName } from "@reloop/ui/icon";
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

function ReactEmailIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			className={className}
			aria-hidden="true"
		>
			<ellipse cx="12" cy="12" rx="10" ry="4.5" />
			<ellipse
				cx="12"
				cy="12"
				rx="10"
				ry="4.5"
				transform="rotate(60 12 12)"
			/>
			<ellipse
				cx="12"
				cy="12"
				rx="10"
				ry="4.5"
				transform="rotate(120 12 12)"
			/>
			<circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
		</svg>
	);
}

function SubItemIcon({
	icon,
	className,
}: {
	icon: string;
	className?: string;
}) {
	if (icon === "react") {
		return <ReactEmailIcon className={className} />;
	}
	return <Icon name={icon as IconName} className={className} />;
}

const SECTIONS = [
	{
		id: "transactional",
		nav: "Transactional Email",
		Component: TransactionalEmailSection,
		subItems: [
			{ id: "send", label: "Send API", icon: "send-2" },
			{ id: "templates", label: "React Email supported", icon: "react" },
			{ id: "events", label: "Webhooks", icon: "webhook" },
		],
	},
	{
		id: "analytics",
		nav: "Email Analytics",
		Component: EmailAnalyticsSection,
		subItems: [
			{ id: "metrics", label: "Metrics", icon: "graph-up" },
			{ id: "engagement", label: "Engagement & clicks", icon: "cursor-click" },
			{ id: "bounces", label: "Bounces & Diagnostics", icon: "alert-triangle" },
		],
	},
	{
		id: "templates",
		nav: "AI Email Templates",
		Component: TemplatesSection,
		subItems: [
			{ id: "ai-templates", label: "AI-powered templates", icon: "magic-wand" },
			{ id: "realtime-editor", label: "Real-time editor", icon: "cursor" },
			{ id: "version-history", label: "Version history", icon: "history" },
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
			{ id: "upload-data", label: "Upload data", icon: "file-code" },
			{ id: "manage-funnels", label: "Manage funnels", icon: "workflow" },
			{ id: "analytics", label: "Analytics", icon: "graph-up" },
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
												{(() => {
													const currentTabId =
														section.id === "transactional"
															? transactionalTab
															: section.id === "analytics"
																? analyticsTab
																: section.id === "templates"
																	? templateTab
																	: marketingTab;
													const activeIndex = section.subItems.findIndex(
														(sub) => sub.id === currentTabId,
													);

													const totalHeight = section.subItems.length * 34;

													return (
														<>
															{/* SVG Vector Tree Connector: Mathematically continuous, zero gaps, zero alpha-intersection dots */}
															<svg
																aria-hidden="true"
																className="pointer-events-none absolute left-0 top-0 h-full w-5 overflow-visible"
																width="20"
																height={totalHeight}
																viewBox={`0 0 20 ${totalHeight}`}
																fill="none"
															>
																{/* Unified inactive tree path: single path prevents self-intersection alpha blending */}
																<path
																	d={[
																		`M 0.5 0 L 0.5 ${(section.subItems.length - 1) * 34 + 9}`,
																		...section.subItems.map(
																			(_, i) =>
																				`M 0.5 ${i * 34 + 9} Q 0.5 ${i * 34 + 17} 8.5 ${i * 34 + 17} L 14 ${i * 34 + 17}`,
																		),
																	].join(" ")}
																	className="stroke-[#e5e5e7] dark:stroke-[#262628]"
																	strokeWidth="1"
																	strokeLinecap="round"
																	strokeLinejoin="round"
																/>

																{/* Continuous active path from top down to the active sub-item (opaque stroke prevents white dots) */}
																{activeIndex >= 0 && (
																	<path
																		d={`M 0.5 0 L 0.5 ${activeIndex * 34 + 9} Q 0.5 ${activeIndex * 34 + 17} 8.5 ${activeIndex * 34 + 17} L 14 ${activeIndex * 34 + 17}`}
																		className="stroke-[#9ca3af] transition-all duration-150 dark:stroke-[#66666e]"
																		strokeWidth="1"
																		strokeLinecap="round"
																		strokeLinejoin="round"
																	/>
																)}
															</svg>

															{section.subItems.map((sub, sIdx) => {
																const isSubActive = sIdx === activeIndex;

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
																			"group relative flex h-[34px] w-full items-center pl-6 pr-3 text-left text-[13.5px] transition-colors duration-150 focus:outline-hidden",
																			isSubActive
																				? "font-semibold text-text-strong-950 dark:text-white"
																				: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white",
																		)}
																	>
																		{/* Icon matching the preview stage */}
																		<SubItemIcon
																			icon={sub.icon}
																			className={cn(
																				"mr-2 size-3.5 shrink-0 transition-colors duration-150",
																				isSubActive
																					? "text-text-strong-950 dark:text-white"
																					: "text-text-soft-400 group-hover:text-text-sub-600 dark:text-white/40 dark:group-hover:text-white/70",
																			)}
																		/>
																		<span className="truncate">{sub.label}</span>
																	</button>
																);
															})}
														</>
													);
												})()}
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
