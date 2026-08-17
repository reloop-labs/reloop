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
				status: template.status,
				time: "Just now",
			};

			setHighlightedId(newId);
			setEmails((prev) => [newEmail, ...prev.slice(0, 9)]);

			setTimeout(() => {
				setHighlightedId((current) => (current === newId ? null : current));
			}, 1400);
		}, 1900);

		return () => clearInterval(interval);
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
