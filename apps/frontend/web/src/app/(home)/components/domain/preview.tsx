"use client";

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { HeroDemoCursor } from "../hero-demo-cursor";
import { useHeroDemoPlayback } from "../hero-demo-playback";
import { DomainAddPage } from "./add/page";
import { LIST_DOMAINS, NEW_DOMAIN, type DemoDomain } from "./_shared/data";
import {
	PAGE_EASE,
	PAGE_TRANSITION_MS,
	stageVariants,
} from "./_shared/page-motion";
import type { DomainStatus } from "./_shared/status";
import { DomainDetailPage } from "./detail/page";
import { DomainListPage } from "./list/page";
import { DomainSetupPage } from "./setup/page";

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

export function HeroDomainPreview() {
	const reduceMotion = useReducedMotion();
	const playback = useHeroDemoPlayback();
	const paused = playback?.paused ?? false;
	const pausedRef = useRef(paused);
	pausedRef.current = paused;
	const cursorShownRef = useRef(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const addBtnRef = useRef<HTMLDivElement>(null);
	const inputWrapRef = useRef<HTMLDivElement>(null);
	const submitRef = useRef<HTMLDivElement>(null);
	const cloudflareRef = useRef<HTMLDivElement>(null);
	const inViewRef = useRef(false);

	const cursorX = useMotionValue(72);
	const cursorY = useMotionValue(240);
	const cursorScale = useMotionValue(1);
	const cursorOpacity = useMotionValue(0);

	const [view, setView] = useState<"list" | "add" | "setup" | "detail">(
		"list",
	);
	const [typed, setTyped] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [added, setAdded] = useState(false);
	const [addPressed, setAddPressed] = useState(false);
	const [submitPressed, setSubmitPressed] = useState(false);
	const [cloudflarePressed, setCloudflarePressed] = useState(false);
	const [connecting, setConnecting] = useState(false);
	const [newStatus, setNewStatus] = useState<DomainStatus>("pending");

	useEffect(() => {
		const root = containerRef.current;
		if (!root) return;
		const io = new IntersectionObserver(
			([entry]) => {
				inViewRef.current = Boolean(entry?.isIntersecting);
			},
			{ threshold: 0.28 },
		);
		io.observe(root);
		return () => io.disconnect();
	}, []);

	useEffect(() => {
		if (paused) {
			void animate(cursorOpacity, 0, { duration: 0.18, ease: PAGE_EASE });
			return;
		}
		if (cursorShownRef.current) {
			void animate(cursorOpacity, 1, { duration: 0.18, ease: PAGE_EASE });
		}
	}, [cursorOpacity, paused]);

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

		const click = async (setPressed: (next: boolean) => void) => {
			setPressed(true);
			await animate(cursorScale, 0.82, { duration: 0.08, ease: "easeOut" });
			await animate(cursorScale, 1, {
				duration: 0.16,
				ease: PAGE_EASE,
			});
			await sleep(70);
			setPressed(false);
		};

		const playOnce = async () => {
			const root = containerRef.current;
			if (!root) return;

			setAdded(false);
			setTyped("");
			setSubmitting(false);
			setConnecting(false);
			setCloudflarePressed(false);
			setNewStatus("pending");
			setView("list");
			setAddPressed(false);
			setSubmitPressed(false);

			cursorX.set(root.offsetWidth * 0.28);
			cursorY.set(root.offsetHeight * 0.62);
			cursorScale.set(1);
			cursorShownRef.current = true;
			await animate(cursorOpacity, pausedRef.current ? 0 : 1, {
				duration: 0.22,
				ease: PAGE_EASE,
			});
			if (cancelled) return;

			await sleep(480);
			if (cancelled) return;
			await moveTo(() => addBtnRef.current);
			if (cancelled) return;
			await sleep(140);
			await click(setAddPressed);
			if (cancelled) return;

			setView("add");
			await sleep(PAGE_TRANSITION_MS);
			if (cancelled) return;

			await moveTo(() => inputWrapRef.current, 0.22, 0.5);
			if (cancelled) return;
			inputWrapRef.current
				?.querySelector("input")
				?.focus({ preventScroll: true });
			await sleep(120);

			const nextDomain = NEW_DOMAIN.domain;
			for (let i = 1; i <= nextDomain.length; i += 1) {
				if (cancelled) return;
				setTyped(nextDomain.slice(0, i));
				await sleep(68);
			}

			await sleep(280);
			if (cancelled) return;
			await moveTo(() => submitRef.current);
			if (cancelled) return;
			await sleep(120);
			await click(setSubmitPressed);
			if (cancelled) return;

			setSubmitting(true);
			await sleep(720);
			if (cancelled) return;
			setSubmitting(false);
			setAdded(true);
			setView("setup");
			await sleep(720);
			if (cancelled) return;

			await moveTo(() => cloudflareRef.current);
			if (cancelled) return;
			await sleep(160);
			await click(setCloudflarePressed);
			if (cancelled) return;

			setConnecting(true);
			await sleep(780);
			if (cancelled) return;
			setConnecting(false);
			setNewStatus("verifying");
			setView("detail");

			await sleep(PAGE_TRANSITION_MS);
			if (cancelled) return;
			cursorShownRef.current = false;
			await animate(cursorOpacity, 0, { duration: 0.28, ease: PAGE_EASE });

			await sleep(2500);
			if (cancelled) return;
			setNewStatus("active");
			await sleep(3600);
			if (cancelled) return;
			setView("list");
			await sleep(1800);
			if (cancelled) return;
			setAdded(false);
			setTyped("");
			await sleep(700);
		};

		const loop = async () => {
			while (!cancelled) {
				if (!inViewRef.current) {
					cursorOpacity.set(0);
					await sleep(320);
					continue;
				}
				await playOnce();
			}
		};

		void loop();

		return () => {
			cancelled = true;
			for (const id of timers) window.clearTimeout(id);
		};
	}, [cursorOpacity, cursorScale, cursorX, cursorY, reduceMotion]);

	const addedDomain: DemoDomain = {
		...NEW_DOMAIN,
		status: newStatus,
		dnsRecords: NEW_DOMAIN.dnsRecords.map((record) => ({
			...record,
			status: newStatus,
		})),
	};
	const listDomains = added ? [addedDomain, ...LIST_DOMAINS] : LIST_DOMAINS;

	return (
		<div
			ref={containerRef}
			aria-hidden
			className="relative h-full overflow-hidden bg-bg-white-0 select-none dark:bg-black"
		>
			<AnimatePresence>
				{view === "list" && (
					<motion.div
						key="list"
						className="absolute inset-0 overflow-hidden bg-bg-white-0 dark:bg-black"
						variants={stageVariants}
						initial={reduceMotion ? false : "hidden"}
						animate="show"
						exit="exit"
					>
						<DomainListPage
							domains={listDomains}
							addBtnRef={addBtnRef}
							addPressed={addPressed}
							highlightId={added ? NEW_DOMAIN.id : null}
						/>
					</motion.div>
				)}
				{view === "add" && (
					<motion.div
						key="add"
						className="absolute inset-0 z-20 overflow-hidden bg-bg-white-0 dark:bg-black"
						variants={stageVariants}
						initial={reduceMotion ? false : "hidden"}
						animate="show"
						exit="exit"
					>
						<DomainAddPage
							domain={typed}
							isLoading={submitting}
							inputWrapRef={inputWrapRef}
							submitRef={submitRef}
							submitPressed={submitPressed}
						/>
					</motion.div>
				)}
				{view === "setup" && (
					<motion.div
						key="setup"
						className="absolute inset-0 z-20 overflow-hidden bg-bg-white-0 dark:bg-black"
						initial={{ opacity: 1 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.26, ease: PAGE_EASE }}
					>
						<DomainSetupPage
							domain={addedDomain}
							cloudflareRef={cloudflareRef}
							cloudflarePressed={cloudflarePressed}
							connecting={connecting}
						/>
					</motion.div>
				)}
				{view === "detail" && (
					<motion.div
						key="detail"
						className="absolute inset-0 z-20 overflow-hidden bg-bg-white-0 dark:bg-black"
						variants={stageVariants}
						initial={reduceMotion ? false : "hidden"}
						animate="show"
						exit="exit"
					>
						<DomainDetailPage domain={addedDomain} />
					</motion.div>
				)}
			</AnimatePresence>

			<HeroDemoCursor
				x={cursorX}
				y={cursorY}
				scale={cursorScale}
				opacity={cursorOpacity}
			/>
		</div>
	);
}
