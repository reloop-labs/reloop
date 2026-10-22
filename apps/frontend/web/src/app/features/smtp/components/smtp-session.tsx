"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SMTP_HOST, SMTP_PORT } from "./smtp-data";

const MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

type Line = { from: "C" | "S"; text: string; note?: string };

const TRANSCRIPT: Line[] = [
	{ from: "S", text: `220 ${SMTP_HOST} ESMTP ready` },
	{ from: "C", text: "EHLO app.acme.com" },
	{ from: "S", text: "250 STARTTLS AUTH PLAIN LOGIN" },
	{ from: "C", text: "STARTTLS" },
	{ from: "S", text: "220 Ready to start TLS" },
	{ from: "C", text: "AUTH PLAIN ••••••••••••" },
	{ from: "S", text: "235 Authentication successful", note: "API key" },
	{ from: "C", text: "MAIL FROM:<receipts@acme.com>" },
	{ from: "S", text: "250 OK", note: "domain verified" },
	{ from: "C", text: "RCPT TO:<jane@example.com>" },
	{ from: "S", text: "250 OK" },
	{ from: "C", text: "DATA" },
	{ from: "S", text: "250 Queued as msg_01jh8q4x", note: "accepted" },
];

const TIMELINE: { label: string; detail: string; icon: string }[] = [
	{ label: "Accepted", detail: "via SMTP · port 587", icon: "smtp" },
	{ label: "DKIM signed", detail: "d=acme.com", icon: "shield" },
	{ label: "Delivered", detail: "gmail.com · 1.2s", icon: "mail-send" },
	{ label: "Opened", detail: "Chrome · macOS", icon: "eye-outline" },
	{ label: "Webhook sent", detail: "email.delivered → 200", icon: "webhook" },
];

const LINE_MS = 170;
const STEP_MS = 420;

/**
 * Hero visual: an SMTP conversation on the left, and what Reloop does with
 * the message after `250 Queued` on the right. Every row is rendered up front
 * and only fades in, so the card never changes height while it plays.
 */
export function SmtpSession() {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { once: true, amount: 0.35 });
	const reduceMotion = useReducedMotion();
	const total = TRANSCRIPT.length + TIMELINE.length;
	const [shown, setShown] = useState(0);

	useEffect(() => {
		if (!inView) return;
		if (reduceMotion) {
			setShown(total);
			return;
		}
		if (shown >= total) return;
		const delay = shown < TRANSCRIPT.length ? LINE_MS : STEP_MS;
		const timer = window.setTimeout(() => setShown((n) => n + 1), delay);
		return () => window.clearTimeout(timer);
	}, [inView, reduceMotion, shown, total]);

	const stepsShown = Math.max(0, shown - TRANSCRIPT.length);
	const done = shown >= total;

	return (
		<div
			ref={ref}
			className="grid w-full overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)] sm:rounded-2xl lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] dark:border-white/10 dark:bg-black dark:shadow-black/60"
		>
			<span className="sr-only">
				An SMTP session with {SMTP_HOST}, followed by the delivery timeline
				Reloop records for the message.
			</span>

			{/* SMTP transcript */}
			<div
				aria-hidden
				className="flex min-w-0 flex-col border-stroke-soft-100 border-b lg:border-r lg:border-b-0 dark:border-white/10"
			>
				<div
					className="flex h-12 items-center gap-3 border-stroke-soft-100 border-b px-5 text-[12px] text-zinc-500 sm:px-6 dark:border-white/10 dark:text-zinc-400"
					style={{ fontFamily: MONO }}
				>
					<span className="flex gap-1.5">
						<span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
						<span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
						<span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
					</span>
					<span className="truncate">
						{SMTP_HOST}:{SMTP_PORT}
					</span>
				</div>
				<ol
					className="flex flex-1 flex-col gap-[3px] px-5 py-5 text-[11.5px] leading-[1.6] sm:px-6 sm:py-6 sm:text-[12.5px]"
					style={{ fontFamily: MONO }}
				>
					{TRANSCRIPT.map((line, index) => (
						<li
							key={`${index}-${line.text}`}
							className={cn(
								"flex min-w-0 items-baseline gap-3 transition-opacity duration-300",
								index < shown ? "opacity-100" : "opacity-0",
							)}
						>
							<span
								className={cn(
									"w-3 shrink-0 font-semibold",
									line.from === "C"
										? "text-zinc-400 dark:text-zinc-500"
										: "text-zinc-950 dark:text-white",
								)}
							>
								{line.from}
							</span>
							<span
								className={cn(
									"truncate",
									line.from === "C"
										? "text-zinc-500 dark:text-zinc-400"
										: "text-zinc-900 dark:text-zinc-100",
								)}
							>
								{line.text}
							</span>
							{line.note && (
								<span className="ml-auto hidden shrink-0 rounded-full border border-stroke-soft-200 px-2 py-px text-[10.5px] text-text-sub-600 sm:inline dark:border-white/10 dark:text-white/50">
									{line.note}
								</span>
							)}
						</li>
					))}
				</ol>
			</div>

			{/* What Reloop does after 250 Queued */}
			<div aria-hidden className="flex min-w-0 flex-col">
				<div className="flex h-12 items-center justify-between gap-3 border-stroke-soft-100 border-b px-5 sm:px-6 dark:border-white/10">
					<span className="truncate font-medium text-[13px] text-text-strong-950 dark:text-white">
						Your receipt from Acme
					</span>
					<span
						className={cn(
							"shrink-0 rounded-full px-2 py-0.5 font-medium text-[11px] transition-colors duration-300",
							done
								? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
								: "bg-bg-weak-50 text-text-sub-600 dark:bg-white/[0.06] dark:text-white/50",
						)}
					>
						{done ? "Delivered" : "Sending"}
					</span>
				</div>
				<ol className="flex flex-1 flex-col justify-center gap-1 px-5 py-5 sm:px-6 sm:py-6">
					{TIMELINE.map((step, index) => {
						const visible = index < stepsShown;
						const last = index === TIMELINE.length - 1;
						return (
							<li
								key={step.label}
								className={cn(
									"relative flex items-start gap-3.5 pb-4 transition-opacity duration-300 last:pb-0",
									visible ? "opacity-100" : "opacity-0",
								)}
							>
								{!last && (
									<span className="absolute top-8 bottom-0 left-[15px] w-px bg-stroke-soft-200 dark:bg-white/10" />
								)}
								<span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
									<Icon name={step.icon} className="size-4" />
								</span>
								<span className="flex min-w-0 flex-col pt-0.5">
									<span className="font-medium text-[13.5px] text-text-strong-950 dark:text-white">
										{step.label}
									</span>
									<span
										className="truncate text-[12px] text-text-sub-600 dark:text-white/50"
										style={{ fontFamily: MONO }}
									>
										{step.detail}
									</span>
								</span>
							</li>
						);
					})}
				</ol>
			</div>
		</div>
	);
}
