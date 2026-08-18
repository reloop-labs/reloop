"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PAGE_EASE } from "../domain/_shared/page-motion";
import {
	type EmailItem,
	INCOMING_STREAM_POOL,
	INITIAL_EMAILS,
	getAvatarGradient,
	getAvatarInitial,
	getEmailStatusColorClass,
	getEmailStatusIcon,
	getEmailStatusLabel,
} from "../emails/_shared/data";

const VISIBLE_ROWS = 6;

export function IncomingEmails() {
	const [emails, setEmails] = useState<EmailItem[]>(
		INITIAL_EMAILS.slice(0, VISIBLE_ROWS),
	);
	const [highlightedId, setHighlightedId] = useState<string | null>(null);
	const reduceMotion = useReducedMotion();
	const rootRef = useRef<HTMLDivElement>(null);
	const inViewRef = useRef(true);
	const streamIndexRef = useRef(0);
	const nextIdRef = useRef(1);

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				inViewRef.current = Boolean(entry?.isIntersecting);
			},
			{ threshold: 0.25 },
		);
		observer.observe(root);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (reduceMotion) return;

		const interval = window.setInterval(() => {
			if (!inViewRef.current || document.visibilityState === "hidden") return;

			const template =
				INCOMING_STREAM_POOL[
					streamIndexRef.current % INCOMING_STREAM_POOL.length
				];
			if (!template) return;
			streamIndexRef.current += 1;
			const newId = `em_live_${nextIdRef.current++}`;

			setHighlightedId(newId);
			setEmails((prev) => [
				{
					id: newId,
					to: template.to,
					subject: template.subject,
					status: template.initialStatus,
					time: "Just now",
				},
				...prev.slice(0, VISIBLE_ROWS - 1),
			]);

			window.setTimeout(() => {
				setHighlightedId((current) => (current === newId ? null : current));
			}, 1800);
		}, 3200);

		return () => window.clearInterval(interval);
	}, [reduceMotion]);

	return (
		<div ref={rootRef} className="flex h-full min-h-[22rem] flex-col">
			<div className="flex shrink-0 items-center justify-between border-stroke-soft-200 border-b px-4 py-2.5 sm:px-5 dark:border-white/10">
				<div className="flex items-center gap-2">
					<span className="relative flex size-1.5">
						<span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
						<span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
					</span>
					<p className="font-medium text-[12.5px] text-text-strong-950 dark:text-white">
						Live sends
					</p>
				</div>
				<p className="text-[11px] text-text-soft-400 dark:text-white/40">
					Incoming
				</p>
			</div>

			<div className="min-h-0 flex-1 overflow-hidden">
				<AnimatePresence initial={false}>
					{emails.map((email) => {
						const isLive = email.id.startsWith("em_live_");
						const highlighted = highlightedId === email.id;

						return (
							<motion.div
								key={email.id}
								layout="position"
								initial={
									reduceMotion || !isLive
										? false
										: { opacity: 0, y: -10, filter: "blur(3px)" }
								}
								animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
								exit={
									reduceMotion
										? { opacity: 0 }
										: { opacity: 0, y: 8, filter: "blur(2px)" }
								}
								transition={{ duration: 0.28, ease: PAGE_EASE }}
								className={cn(
									"flex items-center gap-2.5 border-stroke-soft-200 border-b px-4 py-2.5 sm:px-5 dark:border-white/10",
									highlighted && "bg-bg-weak-50 dark:bg-white/[0.04]",
								)}
							>
								<span
									className={cn(
										"flex size-6 shrink-0 items-center justify-center rounded-full font-semibold text-[10px] text-white",
										getAvatarGradient(email.to),
									)}
								>
									{getAvatarInitial(email.to)}
								</span>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium text-[12.5px] text-text-strong-950 dark:text-white">
										{email.subject}
									</p>
									<p className="truncate text-[11px] text-text-soft-400 dark:text-white/40">
										{email.to}
									</p>
								</div>
								<div className="hidden shrink-0 items-center gap-1 sm:flex">
									<Icon
										name={getEmailStatusIcon(email.status)}
										className={cn(
											"size-3.5",
											getEmailStatusColorClass(email.status),
										)}
									/>
									<span
										className={cn(
											"font-medium text-[11px]",
											getEmailStatusColorClass(email.status),
										)}
									>
										{getEmailStatusLabel(email.status)}
									</span>
								</div>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>
		</div>
	);
}
