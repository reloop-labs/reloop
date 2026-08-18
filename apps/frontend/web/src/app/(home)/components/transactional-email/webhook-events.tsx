"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PAGE_EASE } from "../domain/_shared/page-motion";
import { getAvatarGradient, getAvatarInitial } from "../emails/_shared/data";

type WebhookKind = "delivered" | "opened" | "clicked" | "bounced" | "sent";

type WebhookEvent = {
	id: string;
	kind: WebhookKind;
	name: string;
	email: string;
	subject: string;
	event: string;
};

const EVENT_POOL: Omit<WebhookEvent, "id">[] = [
	{
		kind: "opened",
		name: "Maya Chen",
		email: "maya@northwind.io",
		subject: "Welcome to Acme",
		event: "email.opened",
	},
	{
		kind: "clicked",
		name: "Noah Blake",
		email: "noah@gmail.com",
		subject: "Hello world",
		event: "email.clicked",
	},
	{
		kind: "bounced",
		name: "Jackson Lee",
		email: "jackson@figma.com",
		subject: "Invoice #2049",
		event: "email.bounced",
	},
	{
		kind: "delivered",
		name: "Drew Austin",
		email: "drew@orbit.dev",
		subject: "Reset your password",
		event: "email.delivered",
	},
	{
		kind: "sent",
		name: "Priya Shah",
		email: "priya@folio.io",
		subject: "Confirm your email",
		event: "email.sent",
	},
	{
		kind: "opened",
		name: "Alex Kim",
		email: "alex@harbor.co",
		subject: "Your trial ends tomorrow",
		event: "email.opened",
	},
	{
		kind: "clicked",
		name: "Elena Voss",
		email: "elena@clerk.dev",
		subject: "One-time passcode",
		event: "email.clicked",
	},
];

const KIND_STYLE: Record<
	WebhookKind,
	{ badge: string; icon: string }
> = {
	sent: {
		badge: "bg-bg-weak-50 text-text-sub-600 dark:bg-white/10 dark:text-white/70",
		icon: "send-2",
	},
	delivered: {
		badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
		icon: "check-circle",
	},
	opened: {
		badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
		icon: "eye-outline",
	},
	clicked: {
		badge: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
		icon: "cursor-click",
	},
	bounced: {
		badge: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
		icon: "minus-circle",
	},
};

const VISIBLE = 3;

/** Pure smooth cubic-bezier ease with zero bounce or spring */
const SMOOTH_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const ANIMATION_DURATION = 0.68;

function seedEvents(): WebhookEvent[] {
	return EVENT_POOL.slice(0, VISIBLE).map((event, index) => ({
		...event,
		id: `wh_seed_${index}`,
	}));
}

export function WebhookEvents({ active }: { active: boolean }) {
	const [events, setEvents] = useState<WebhookEvent[]>(seedEvents);
	const reduceMotion = useReducedMotion();
	const rootRef = useRef<HTMLDivElement>(null);
	const inViewRef = useRef(true);
	const streamIndexRef = useRef(VISIBLE);
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
		if (reduceMotion || !active) return;

		const interval = window.setInterval(() => {
			if (!inViewRef.current || document.visibilityState === "hidden") return;

			const template = EVENT_POOL[streamIndexRef.current % EVENT_POOL.length];
			if (!template) return;
			streamIndexRef.current += 1;

			setEvents((prev) => [
				{ ...template, id: `wh_live_${nextIdRef.current++}` },
				...prev.slice(0, VISIBLE - 1),
			]);
		}, 3800);

		return () => window.clearInterval(interval);
	}, [active, reduceMotion]);

	return (
		<div
			ref={rootRef}
			className="w-full max-w-sm overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.14)] sm:p-5 dark:border-white/10 dark:bg-[#141414] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
		>
			<div className="mb-2.5 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Icon name="webhook" className="size-4 text-text-sub-600" />
					<p className="font-semibold text-[14px] text-text-strong-950 dark:text-white">
						Webhook captured
					</p>
				</div>
				<span className="relative flex size-1.5">
					<span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
					<span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
				</span>
			</div>

			<div
				className="relative max-h-[22.5rem] overflow-hidden pt-3 sm:pt-4"
				style={{
					maskImage:
						"linear-gradient(to bottom, transparent 0%, black 2.5%, black 86%, transparent 100%)",
					WebkitMaskImage:
						"linear-gradient(to bottom, transparent 0%, black 2.5%, black 86%, transparent 100%)",
				}}
			>
				<AnimatePresence initial={false}>
					{events.map((item) => {
						const style = KIND_STYLE[item.kind];
						const isLive = item.id.startsWith("wh_live_");

						return (
							<motion.div
								key={item.id}
								layout="position"
								className="overflow-hidden pb-3 last:pb-0"
								initial={
									reduceMotion || !isLive
										? false
										: {
												opacity: 0,
												height: 0,
												y: -14,
												filter: "blur(4px)",
											}
								}
								animate={{
									opacity: 1,
									height: "auto",
									y: 0,
									filter: "blur(0px)",
								}}
								exit={{
									opacity: 0,
									height: 0,
									y: 10,
									filter: "blur(2px)",
									transition: { duration: 0.45, ease: SMOOTH_EASE },
								}}
								transition={
									isLive
										? {
												height: {
													duration: ANIMATION_DURATION,
													ease: SMOOTH_EASE,
												},
												y: {
													duration: ANIMATION_DURATION,
													ease: SMOOTH_EASE,
												},
												opacity: {
													duration: 0.5,
													delay: 0.1,
													ease: SMOOTH_EASE,
												},
												filter: {
													duration: 0.5,
													delay: 0.1,
													ease: SMOOTH_EASE,
												},
												layout: {
													duration: ANIMATION_DURATION,
													ease: SMOOTH_EASE,
												},
											}
										: {
												duration: 0.3,
												ease: SMOOTH_EASE,
												layout: {
													duration: ANIMATION_DURATION,
													ease: SMOOTH_EASE,
												},
											}
								}
							>
								<div className="pt-0.5">
									<div className="mb-1.5 flex items-center gap-2">
										<span
											className={cn(
												"flex size-5 shrink-0 items-center justify-center rounded-full font-semibold text-[9px] text-white",
												getAvatarGradient(item.email),
											)}
										>
											{getAvatarInitial(item.email)}
										</span>
										<p className="truncate font-medium text-[13px] text-text-strong-950 underline decoration-stroke-soft-200 underline-offset-2 dark:text-white">
											{item.name}
										</p>
									</div>
									<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-3.5 py-3 dark:border-white/10 dark:bg-[#1a1a1a]">
										<div className="flex items-center gap-2">
											<span
												className={cn(
													"inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium text-[11px]",
													style.badge,
												)}
											>
												<Icon name={style.icon} className="size-3" />
												{item.kind.charAt(0).toUpperCase() + item.kind.slice(1)}
											</span>
											<span className="truncate font-mono text-[11px] text-text-soft-400 dark:text-white/40">
												{item.event}
											</span>
										</div>
										<p className="mt-2 truncate text-[13px] text-text-sub-600 dark:text-white/55">
											{item.email}
										</p>
										<p className="mt-0.5 truncate font-medium text-[13px] text-text-strong-950 dark:text-white">
											{item.subject}
										</p>
									</div>
								</div>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>
		</div>
	);
}
