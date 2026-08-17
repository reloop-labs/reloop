"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useHeroDemoPlayback } from "../hero-demo-playback";
import {
	type EmailItem,
	INITIAL_EMAILS,
	INCOMING_STREAM_POOL,
} from "./_shared/data";
import { EmailsListPage } from "./list/page";

export function HeroEmailsPreview() {
	const [mounted, setMounted] = useState(false);
	const [emails, setEmails] = useState<EmailItem[]>(INITIAL_EMAILS);
	const [highlightedId, setHighlightedId] = useState<string | null>(null);

	const containerRef = useRef<HTMLDivElement>(null);
	const inViewRef = useRef(true);
	const isInitialMountRef = useRef(true);
	const streamIndexRef = useRef(0);
	const nextIdRef = useRef(1);

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

	// Live email incoming stream
	useEffect(() => {
		if (reduceMotion) return;

		const interval = setInterval(() => {
			if (pausedRef.current || !inViewRef.current || isInitialMountRef.current) {
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
			}, 1200);
		}, 2200);

		return () => clearInterval(interval);
	}, [reduceMotion]);

	// Organic status transition loop for items below the top row
	useEffect(() => {
		if (reduceMotion) return;

		const statusInterval = setInterval(() => {
			if (pausedRef.current || !inViewRef.current || isInitialMountRef.current) {
				return;
			}

			setEmails((prev) => {
				// Only target items below the top row (index 1 to length - 1)
				const eligibleIndices: { index: number; nextStatus: string }[] = [];

				for (let i = 1; i < prev.length; i++) {
					const item = prev[i];
					if (!item) continue;

					if (item.status === "delivered" || item.status === "sent") {
						// 50% chance to candidate for "opened"
						if (Math.random() < 0.6) {
							eligibleIndices.push({ index: i, nextStatus: "opened" });
						}
					} else if (item.status === "opened") {
						// 30% chance to candidate for "clicked"
						if (Math.random() < 0.35) {
							eligibleIndices.push({ index: i, nextStatus: "clicked" });
						}
					}
				}

				if (eligibleIndices.length === 0) return prev;

				// Pick one candidate at random
				const target =
					eligibleIndices[Math.floor(Math.random() * eligibleIndices.length)];
				if (!target) return prev;

				return prev.map((item, idx) =>
					idx === target.index ? { ...item, status: target.nextStatus } : item,
				);
			});
		}, 1800);

		return () => clearInterval(statusInterval);
	}, [reduceMotion]);

	return (
		<div
			ref={containerRef}
			className="h-full overflow-hidden bg-bg-white-0 dark:bg-black"
		>
			<EmailsListPage
				emails={emails}
				mounted={mounted}
				highlightedId={highlightedId}
			/>
		</div>
	);
}
