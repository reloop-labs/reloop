"use client";

import {
	AnimatePresence,
	animate,
	motion,
	useMotionValue,
	useReducedMotion,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
	PAGE_EASE,
	PAGE_TRANSITION_MS,
	stageVariants,
} from "../domain/_shared/page-motion";
import { HeroDemoCursor } from "../hero-demo-cursor";
import { useHeroDemoPlayback } from "../hero-demo-playback";
import {
	type EmailItem,
	INCOMING_STREAM_POOL,
	INITIAL_EMAILS,
} from "./_shared/data";
import { type DetailTabId, EmailDetailPage } from "./detail/page";
import { EmailsListPage } from "./list/page";

const DETAIL_TABS: { id: DetailTabId; dwell: number }[] = [
	{ id: "preview", dwell: 1600 },
	{ id: "plain", dwell: 1400 },
	{ id: "html", dwell: 1400 },
	{ id: "raw", dwell: 1400 },
	{ id: "insights", dwell: 1800 },
];

function shuffleTabs<T>(items: T[]): T[] {
	const next = [...items];
	for (let i = next.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		const current = next[i];
		const swap = next[j];
		if (current === undefined || swap === undefined) continue;
		next[i] = swap;
		next[j] = current;
	}
	return next;
}

function pointIn(
	container: HTMLElement,
	el: HTMLElement,
	alignX = 0.5,
	alignY = 0.5,
) {
	const c = container.getBoundingClientRect();
	const r = el.getBoundingClientRect();
	const scaleX = c.width / container.offsetWidth || 1;
	const scaleY = c.height / container.offsetHeight || 1;
	return {
		x: (r.left - c.left + r.width * alignX) / scaleX,
		y: (r.top - c.top + r.height * alignY) / scaleY,
	};
}

function frame() {
	return new Promise<void>((resolve) => {
		requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
	});
}

export function HeroEmailsPreview() {
	const [mounted, setMounted] = useState(false);
	const [emails, setEmails] = useState<EmailItem[]>(INITIAL_EMAILS);
	const [highlightedId, setHighlightedId] = useState<string | null>(null);
	const [view, setView] = useState<"list" | "detail">("list");
	const [selectedEmail, setSelectedEmail] = useState<EmailItem>(
		INITIAL_EMAILS[0]!,
	);
	const [isRowPressed, setIsRowPressed] = useState(false);
	const [detailTab, setDetailTab] = useState("preview");

	const containerRef = useRef<HTMLDivElement>(null);
	const targetRowRef = useRef<HTMLDivElement>(null);
	const backBtnRef = useRef<HTMLButtonElement>(null);
	const tabRefs = useRef<Record<DetailTabId, HTMLButtonElement | null>>({
		preview: null,
		plain: null,
		html: null,
		raw: null,
		insights: null,
	});

	const inViewRef = useRef(true);
	const isInitialMountRef = useRef(true);
	const cursorShownRef = useRef(false);
	const streamIndexRef = useRef(0);
	const nextIdRef = useRef(1);

	const cursorX = useMotionValue(80);
	const cursorY = useMotionValue(220);
	const cursorScale = useMotionValue(1);
	const cursorOpacity = useMotionValue(0);

	const reduceMotion = useReducedMotion();
	const playback = useHeroDemoPlayback();
	const paused = playback?.paused ?? false;
	const pausedRef = useRef(paused);
	pausedRef.current = paused;

	useEffect(() => {
		setMounted(true);
		const timer = setTimeout(() => {
			isInitialMountRef.current = false;
		}, 1200);
		return () => clearTimeout(timer);
	}, []);

	// Observe viewport visibility
	useEffect(() => {
		const root = containerRef.current;
		if (!root) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				inViewRef.current = Boolean(entry?.isIntersecting);
			},
			{ threshold: 0.2 },
		);
		observer.observe(root);
		return () => observer.disconnect();
	}, []);

	// Cursor opacity on pause/play
	useEffect(() => {
		if (paused) {
			void animate(cursorOpacity, 0, { duration: 0.18, ease: PAGE_EASE });
			return;
		}
		if (cursorShownRef.current) {
			void animate(cursorOpacity, 1, { duration: 0.18, ease: PAGE_EASE });
		}
	}, [cursorOpacity, paused]);

	// Live email incoming stream (only runs when on list view)
	useEffect(() => {
		if (reduceMotion) return;

		const interval = setInterval(() => {
			if (
				pausedRef.current ||
				!inViewRef.current ||
				isInitialMountRef.current ||
				view !== "list"
			) {
				return;
			}

			const template =
				INCOMING_STREAM_POOL[
					streamIndexRef.current % INCOMING_STREAM_POOL.length
				];
			if (!template) return;
			streamIndexRef.current += 1;
			const newId = `em_live_${nextIdRef.current++}`;

			const newEmail: EmailItem = {
				id: newId,
				to: template.to,
				subject: template.subject,
				status: template.initialStatus,
				time: "Just now",
			};

			setHighlightedId(newId);
			setEmails((prev) => [newEmail, ...prev.slice(0, 9)]);

			setTimeout(() => {
				setHighlightedId((current) => (current === newId ? null : current));
			}, 2200);
		}, 4000);

		return () => clearInterval(interval);
	}, [reduceMotion, view]);

	// Organic status transition loop for items below the top row
	useEffect(() => {
		if (reduceMotion) return;

		const statusInterval = setInterval(() => {
			if (
				pausedRef.current ||
				!inViewRef.current ||
				isInitialMountRef.current ||
				view !== "list"
			) {
				return;
			}

			setEmails((prev) => {
				const eligibleIndices: { index: number; nextStatus: string }[] = [];

				for (let i = 1; i < prev.length; i++) {
					const item = prev[i];
					if (!item) continue;

					if (item.status === "delivered" || item.status === "sent") {
						if (Math.random() < 0.6) {
							eligibleIndices.push({ index: i, nextStatus: "opened" });
						}
					} else if (item.status === "opened") {
						if (Math.random() < 0.35) {
							eligibleIndices.push({ index: i, nextStatus: "clicked" });
						}
					}
				}

				if (eligibleIndices.length === 0) return prev;

				const target =
					eligibleIndices[Math.floor(Math.random() * eligibleIndices.length)];
				if (!target) return prev;

				return prev.map((item, idx) =>
					idx === target.index ? { ...item, status: target.nextStatus } : item,
				);
			});
		}, 1800);

		return () => clearInterval(statusInterval);
	}, [reduceMotion, view]);

	// Interactive Cursor Choreography
	useEffect(() => {
		if (reduceMotion) return;

		let cancelled = false;
		const timers = new Set<number>();

		const sleepRaw = (ms: number) =>
			new Promise<void>((resolve) => {
				const id = window.setTimeout(() => {
					timers.delete(id);
					resolve();
				}, ms);
				timers.add(id);
			});

		const waitIfPaused = async () => {
			while (pausedRef.current && !cancelled) {
				await sleepRaw(40);
			}
		};

		const sleep = async (ms: number) => {
			let remaining = ms;
			while (remaining > 0 && !cancelled) {
				await waitIfPaused();
				if (cancelled) return;
				const started = performance.now();
				await sleepRaw(Math.min(remaining, 40));
				if (pausedRef.current) continue;
				remaining -= performance.now() - started;
			}
		};

		const waitForTarget = async (getEl: () => HTMLElement | null) => {
			for (let i = 0; i < 24; i += 1) {
				const el = getEl();
				if (el && el.getBoundingClientRect().width > 1) {
					await frame();
					return el;
				}
				await sleep(16);
			}
			return getEl();
		};

		const moveTo = async (
			getEl: () => HTMLElement | null,
			alignX = 0.5,
			alignY = 0.5,
		) => {
			const root = containerRef.current;
			const el = await waitForTarget(getEl);
			if (!root || !el) return;
			const { x, y } = pointIn(root, el, alignX, alignY);
			await Promise.all([
				animate(cursorX, x, {
					type: "spring",
					stiffness: 180,
					damping: 24,
					mass: 0.65,
				}),
				animate(cursorY, y, {
					type: "spring",
					stiffness: 180,
					damping: 24,
					mass: 0.65,
				}),
			]);
		};

		const click = async (onPressState?: (next: boolean) => void) => {
			onPressState?.(true);
			await animate(cursorScale, 0.82, { duration: 0.08, ease: "easeOut" });
			await animate(cursorScale, 1, {
				duration: 0.16,
				ease: PAGE_EASE,
			});
			await sleep(70);
			onPressState?.(false);
		};

		const playChoreography = async () => {
			const root = containerRef.current;
			if (!root) return;

			// Reset to list view
			setView("list");
			setDetailTab("preview");
			setIsRowPressed(false);

			// Let user see the live email stream in list view for a bit
			await sleep(3200);
			if (cancelled) return;

			// Spawn demo cursor
			cursorX.set(root.offsetWidth * 0.35);
			cursorY.set(root.offsetHeight * 0.7);
			cursorScale.set(1);
			cursorShownRef.current = true;
			await animate(cursorOpacity, pausedRef.current ? 0 : 1, {
				duration: 0.22,
				ease: PAGE_EASE,
			});
			if (cancelled) return;

			await sleep(400);
			if (cancelled) return;

			// Move to the target email row
			await moveTo(() => targetRowRef.current, 0.35, 0.5);
			if (cancelled) return;
			await sleep(220);

			// Click email row
			await click(setIsRowPressed);
			if (cancelled) return;

			// Pick current first email or selected
			setSelectedEmail((prev) => emails[0] || prev);
			setView("detail");

			await sleep(PAGE_TRANSITION_MS);
			if (cancelled) return;

			await sleep(700);
			if (cancelled) return;

			const tour = shuffleTabs(DETAIL_TABS);
			let current = "preview";
			for (const tab of tour) {
				if (cancelled) return;
				await moveTo(() => tabRefs.current[tab.id]);
				if (cancelled) return;
				await sleep(160);
				if (current !== tab.id) {
					await click();
					setDetailTab(tab.id);
					current = tab.id;
				}
				await sleep(tab.dwell);
				if (cancelled) return;
			}

			// Move to Back button
			await moveTo(() => backBtnRef.current);
			if (cancelled) return;
			await sleep(180);
			await click();
			if (cancelled) return;

			// Return to List View
			setView("list");
			await sleep(PAGE_TRANSITION_MS);
			if (cancelled) return;

			// Fade cursor out and let live stream breathe
			cursorShownRef.current = false;
			await animate(cursorOpacity, 0, { duration: 0.25, ease: PAGE_EASE });
			await sleep(3500);
		};

		const loop = async () => {
			while (!cancelled) {
				if (!inViewRef.current) {
					cursorOpacity.set(0);
					await sleep(320);
					continue;
				}
				await playChoreography();
			}
		};

		void loop();

		return () => {
			cancelled = true;
			for (const id of timers) window.clearTimeout(id);
		};
	}, [cursorOpacity, cursorScale, cursorX, cursorY, emails, reduceMotion]);

	const handleRowClick = (email: EmailItem) => {
		setSelectedEmail(email);
		setView("detail");
	};

	const handleBack = () => {
		setView("list");
	};

	return (
		<div
			ref={containerRef}
			className="relative h-full overflow-hidden bg-bg-white-0 dark:bg-black"
		>
			<HeroDemoCursor
				x={cursorX}
				y={cursorY}
				scale={cursorScale}
				opacity={cursorOpacity}
			/>

			<AnimatePresence mode="wait">
				{view === "list" && (
					<motion.div
						key="emails-list"
						variants={stageVariants}
						initial="hidden"
						animate="show"
						exit="exit"
						className="w-full"
					>
						<EmailsListPage
							emails={emails}
							mounted={mounted}
							highlightedId={highlightedId}
							onRowClick={handleRowClick}
							targetRowRef={targetRowRef}
							targetEmailId={emails[0]?.id}
							isRowPressed={isRowPressed}
						/>
					</motion.div>
				)}

				{view === "detail" && (
					<motion.div
						key="email-detail"
						variants={stageVariants}
						initial="hidden"
						animate="show"
						exit="exit"
						className="w-full"
					>
						<EmailDetailPage
							email={selectedEmail}
							onBack={handleBack}
							backButtonRef={backBtnRef}
							tabRefs={tabRefs}
							activeTab={detailTab}
							onTabChange={setDetailTab}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
