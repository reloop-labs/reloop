"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdKey } from "@reloop/ui/kbd-key";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useHeroDemoPlayback } from "./hero-demo-playback";
import { PAGE_EASE } from "./domain/_shared/page-motion";

export interface EmailItem {
	id: string;
	to: string;
	subject: string;
	status: string;
	time: string;
}

const INITIAL_EMAILS: EmailItem[] = [
	{
		id: "em_01",
		to: "maya@northwind.io",
		subject: "Welcome to Acme",
		status: "delivered",
		time: "2 min ago",
	},
	{
		id: "em_02",
		to: "alex@orbit.dev",
		subject: "Reset your password",
		status: "opened",
		time: "11 min ago",
	},
	{
		id: "em_03",
		to: "billing@northwind.io",
		subject: "Invoice #1024 is ready",
		status: "delivered",
		time: "28 min ago",
	},
	{
		id: "em_04",
		to: "team@lumen.app",
		subject: "Confirm your email",
		status: "clicked",
		time: "1 hour ago",
	},
	{
		id: "em_05",
		to: "jordan@harbor.co",
		subject: "Your order has shipped",
		status: "delivered",
		time: "2 hours ago",
	},
	{
		id: "em_06",
		to: "priya@folio.io",
		subject: "Weekly usage report",
		status: "sent",
		time: "4 hours ago",
	},
	{
		id: "em_07",
		to: "nina@stackline.dev",
		subject: "Security alert for your account",
		status: "bounced",
		time: "6 hours ago",
	},
	{
		id: "em_08",
		to: "hello@pixeland.co",
		subject: "Payment receipt",
		status: "failed",
		time: "1 day ago",
	},
	{
		id: "em_09",
		to: "sam@harbor.co",
		subject: "Your trial ends tomorrow",
		status: "opened",
		time: "1 day ago",
	},
	{
		id: "em_10",
		to: "ops@reloop.sh",
		subject: "Domain verified — mail.acme.com",
		status: "delivered",
		time: "2 days ago",
	},
];

const INCOMING_STREAM_POOL: Omit<EmailItem, "id" | "time">[] = [
	{
		to: "sarah@vertex.io",
		subject: "Your API key has been created",
		status: "delivered",
	},
	{
		to: "dev@linear.app",
		subject: "Security alert: New login from macOS",
		status: "opened",
	},
	{
		to: "mira@hyper.co",
		subject: "Invoice #2049 has been paid",
		status: "delivered",
	},
	{
		to: "lucas@supabase.io",
		subject: "Confirm your magic link to log in",
		status: "clicked",
	},
	{
		to: "kate@resend.com",
		subject: "Domain verified — mail.acme.com",
		status: "delivered",
	},
	{
		to: "liam@cursor.sh",
		subject: "Weekly usage summary: 2.4M sends",
		status: "sent",
	},
	{
		to: "elena@clerk.dev",
		subject: "One-time passcode: 849-201",
		status: "delivered",
	},
	{
		to: "hugo@prisma.io",
		subject: "Subscription upgraded to Pro",
		status: "opened",
	},
	{
		to: "zoe@stripe.com",
		subject: "Payment of $14,280.00 confirmed",
		status: "delivered",
	},
	{
		to: "noah@vercel.com",
		subject: "Production deployment finished",
		status: "clicked",
	},
	{
		to: "chloe@raycast.com",
		subject: "Welcome to Acme Enterprise",
		status: "delivered",
	},
	{
		to: "felix@posthog.com",
		subject: "Monthly event limit threshold (80%)",
		status: "opened",
	},
];

const emailGridStyle = {
	gridTemplateColumns:
		"32px minmax(0, 1.2fr) minmax(0, 1.8fr) 120px 110px 32px",
};

const AVATAR_GRADIENTS = [
	"from-rose-500 to-pink-600",
	"from-pink-500 to-fuchsia-600",
	"from-fuchsia-500 to-purple-600",
	"from-purple-500 to-indigo-600",
	"from-indigo-500 to-blue-600",
	"from-blue-500 to-cyan-600",
	"from-cyan-500 to-teal-600",
	"from-teal-500 to-emerald-600",
	"from-emerald-500 to-green-600",
	"from-green-500 to-lime-600",
	"from-lime-500 to-yellow-600",
	"from-yellow-500 to-amber-600",
	"from-amber-500 to-orange-600",
	"from-orange-500 to-red-600",
	"from-red-500 to-rose-600",
	"from-sky-500 to-blue-600",
	"from-violet-500 to-purple-600",
	"from-slate-500 to-gray-600",
] as const;

function hashString(str: string): number {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 33) ^ str.charCodeAt(i);
	}
	return Math.abs(hash);
}

function getAvatarGradient(seed: string): string {
	const index = hashString(seed) % AVATAR_GRADIENTS.length;
	return `bg-gradient-to-br ${AVATAR_GRADIENTS[index]}`;
}

function getAvatarInitial(email: string): string {
	const prefix = email.split("@")[0];
	return prefix ? prefix.charAt(0).toUpperCase() : "?";
}

function getEmailStatusColorClass(status: string): string {
	switch (status.toLowerCase()) {
		case "delivered":
		case "sent":
			return "text-success-base";
		case "failed":
		case "bounced":
		case "spam":
			return "text-error-base";
		case "pending":
			return "text-warning-base";
		case "opened":
			return "text-information-base";
		case "clicked":
			return "text-feature-base";
		default:
			return "text-text-sub-600";
	}
}

function getEmailStatusIcon(status: string): string {
	switch (status.toLowerCase()) {
		case "delivered":
		case "sent":
			return "check-circle";
		case "failed":
		case "bounced":
		case "spam":
			return "minus-circle";
		case "pending":
			return "clock";
		case "opened":
			return "eye-outline";
		case "clicked":
			return "cursor-click";
		default:
			return "mail-single";
	}
}

function getEmailStatusLabel(status: string): string {
	switch (status.toLowerCase()) {
		case "delivered":
			return "Delivered";
		case "sent":
			return "Sent";
		case "failed":
			return "Failed";
		case "bounced":
			return "Bounced";
		case "spam":
			return "Spam";
		case "pending":
			return "Pending";
		case "opened":
			return "Opened";
		case "clicked":
			return "Clicked";
		default:
			return status;
	}
}

const toolbarControlClassName = cn(
	"inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-2.5 shadow-none",
	"font-normal text-text-sub-600 text-xs transition duration-200 ease-out",
	"hover:bg-bg-weak-50 hover:text-text-strong-950",
	"dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/40",
);

const selectTriggerClassName = cn(
	"relative inline-flex min-h-9 min-w-0 select-none items-center justify-between gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-left text-sm text-text-strong-950 shadow-none outline-none",
	"dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/40",
);

const kbdClassName = cn(
	"h-4 w-4 min-w-4 rounded-[5px] px-0 text-[10px] leading-none",
	"border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600",
	"shadow-[0_1.5px_0_0_var(--color-stroke-soft-200)]",
	"dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white",
	"dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.06),inset_0_0.5px_0_0_rgba(255,255,255,0.08)]",
);

function ActionKbd({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return <KbdKey className={cn(kbdClassName, className)}>{children}</KbdKey>;
}

const WAVE_DELAY = 0.16;
const WAVE_STAGGER = 0.045;
const CELL_DURATION = 0.44;
const FOOTER_DELAY = 0.58;
const FOOTER_DURATION = 0.38;

function AnimateIn({
	mounted,
	delay = 0,
	y = 14,
	className,
	children,
}: {
	mounted: boolean;
	delay?: number;
	y?: number;
	className?: string;
	children: ReactNode;
}) {
	const reduceMotion = useReducedMotion();
	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y, filter: "blur(4px)" }}
			animate={
				mounted
					? { opacity: 1, y: 0, filter: "blur(0px)" }
					: { opacity: 0, y, filter: "blur(4px)" }
			}
			transition={{
				duration: 0.55,
				delay,
				ease: PAGE_EASE,
			}}
			style={{ willChange: "transform, opacity, filter" }}
		>
			{children}
		</motion.div>
	);
}

function MatrixCell({
	mounted,
	row,
	col,
	className,
	children,
}: {
	mounted: boolean;
	row: number;
	col: number;
	className?: string;
	children: ReactNode;
}) {
	const reduceMotion = useReducedMotion();

	return (
		<div className={cn("flex min-w-0 items-center", className)}>
			{reduceMotion ? (
				children
			) : (
				<motion.div
					className="min-w-0 max-w-full"
					initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
					animate={
						mounted
							? { opacity: 1, y: 0, filter: "blur(0px)" }
							: { opacity: 0, y: 8, filter: "blur(2px)" }
					}
					transition={{
						duration: CELL_DURATION,
						delay: WAVE_DELAY + (row + col) * WAVE_STAGGER,
						ease: PAGE_EASE,
					}}
					style={{ willChange: "transform, opacity, filter" }}
				>
					{children}
				</motion.div>
			)}
		</div>
	);
}

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
			<div className="mx-auto max-w-6xl space-y-6 overflow-hidden p-6 lg:p-8">
				{/* Top Header */}
				<div className="flex flex-col gap-4 pt-2 pb-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="space-y-1">
						<AnimateIn mounted={mounted} delay={0.03} y={14}>
							<div className="flex items-center gap-2.5">
								<Icon
									name="mail-send"
									className="h-6 w-6 shrink-0 text-text-strong-950"
								/>
								<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
									Email Sent
								</h1>
							</div>
						</AnimateIn>
						<AnimateIn mounted={mounted} delay={0.07} y={10}>
							<p className="text-sm text-text-sub-600">
								Track and monitor your outbound transactional emails.
							</p>
						</AnimateIn>
					</div>

					<div className="flex shrink-0 items-center gap-2">
						<AnimateIn mounted={mounted} delay={0.1} y={12}>
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="small"
								tabIndex={-1}
								className="gap-1.5 rounded-xl text-text-strong-950"
							>
								<Icon name="code" className="h-4 w-4 text-text-sub-600" />
								SDK
								<ActionKbd className="w-auto min-w-4 px-1">S</ActionKbd>
							</Button.Root>
						</AnimateIn>
						<AnimateIn mounted={mounted} delay={0.14} y={12}>
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="small"
								tabIndex={-1}
								className="gap-1.5 rounded-xl text-text-strong-950"
							>
								Documentation
								<ActionKbd className="w-auto min-w-4 px-1">D</ActionKbd>
							</Button.Root>
						</AnimateIn>
					</div>
				</div>

				{/* Tabs Navigation */}
				<AnimateIn mounted={mounted} delay={0.12} y={10}>
					<TabMenuHorizontal.Root value="sent">
						<TabMenuHorizontal.List className="relative h-11 gap-0 border-b! py-0">
							<TabMenuHorizontal.Trigger
								value="sent"
								tabIndex={-1}
								className="flex cursor-pointer items-center gap-2 px-3 py-0! font-medium text-sm text-text-strong-950"
							>
								<Icon name="mail-send" className="h-4 w-4" />
								Sent
							</TabMenuHorizontal.Trigger>
							<TabMenuHorizontal.Trigger
								value="received"
								tabIndex={-1}
								className="flex cursor-pointer items-center gap-2 px-3 py-0! font-medium text-sm"
							>
								<Icon name="mail-receive" className="h-4 w-4" />
								Received
							</TabMenuHorizontal.Trigger>
						</TabMenuHorizontal.List>
					</TabMenuHorizontal.Root>
				</AnimateIn>

				<div className="mt-4 pb-8">
					<div className="space-y-4">
						{/* Filters and Search Toolbar */}
						<div className="space-y-3">
							<div className="flex flex-wrap items-center gap-2">
								<AnimateIn mounted={mounted} delay={0.16} y={10}>
									<Button.Root
										type="button"
										variant="neutral"
										mode="stroke"
										size="small"
										tabIndex={-1}
										className="h-9 gap-1.5 whitespace-nowrap rounded-xl text-text-strong-950"
									>
										<Button.Icon>
											<Icon name="calendar" className="h-4 w-4" />
										</Button.Icon>
										All time
										<Button.Icon>
											<Icon name="chevron-down" className="h-3.5 w-3.5" />
										</Button.Icon>
									</Button.Root>
								</AnimateIn>

								<AnimateIn mounted={mounted} delay={0.2} y={10}>
									<button
										type="button"
										tabIndex={-1}
										className={cn(selectTriggerClassName, "w-40")}
									>
										<span className="flex min-w-0 flex-1 items-center gap-2 font-medium text-sm text-text-strong-950">
											<Icon name="activity" className="h-4 w-4 shrink-0" />
											<span className="min-w-0 truncate">All Status</span>
										</span>
										<Icon
											name="chevron-down"
											className="-me-1 size-4 opacity-70"
										/>
									</button>
								</AnimateIn>

								<AnimateIn mounted={mounted} delay={0.24} y={10}>
									<button
										type="button"
										tabIndex={-1}
										className={cn(selectTriggerClassName, "w-44")}
									>
										<span className="flex min-w-0 flex-1 items-center gap-2 font-medium text-sm text-text-strong-950">
											<Icon
												name="globe"
												className="h-4 w-4 shrink-0 text-text-sub-600"
											/>
											<span className="min-w-0 truncate">All Domains</span>
										</span>
										<Icon
											name="chevron-down"
											className="-me-1 size-4 opacity-70"
										/>
									</button>
								</AnimateIn>

								<AnimateIn mounted={mounted} delay={0.28} y={10}>
									<button
										type="button"
										tabIndex={-1}
										className={cn(selectTriggerClassName, "w-44")}
									>
										<span className="flex min-w-0 flex-1 items-center gap-2 font-medium text-sm text-text-strong-950">
											<Icon
												name="key-new"
												className="h-4 w-4 shrink-0 text-text-sub-600"
											/>
											<span className="min-w-0 truncate">All API Keys</span>
										</span>
										<Icon
											name="chevron-down"
											className="-me-1 size-4 opacity-70"
										/>
									</button>
								</AnimateIn>

								<AnimateIn mounted={mounted} delay={0.32} y={10} className="ml-auto">
									<div className="flex items-center gap-2">
										<button
											type="button"
											tabIndex={-1}
											className={cn(toolbarControlClassName, "gap-2 px-1.5")}
											aria-label="Refresh sent emails"
										>
											<Icon name="rotate-cw" className="h-3.5 w-3.5 shrink-0" />
											<ActionKbd>R</ActionKbd>
										</button>
									</div>
								</AnimateIn>
							</div>

							<AnimateIn mounted={mounted} delay={0.34} y={10}>
								<Input.Root size="small" className="w-full rounded-xl">
									<Input.Wrapper>
										<Input.Icon as={Icon} name="search" size="small" />
										<Input.Input
											readOnly
											tabIndex={-1}
											placeholder="Search subject or sender..."
										/>
										<button
											type="button"
											tabIndex={-1}
											aria-label="Focus search"
											className="shrink-0 cursor-pointer rounded-[5px] outline-none"
										>
											<ActionKbd>/</ActionKbd>
										</button>
									</Input.Wrapper>
								</Input.Root>
							</AnimateIn>
						</div>

						{/* Emails Table */}
						<AnimateIn mounted={mounted} delay={0.2} y={10}>
							<div className="mt-4">
								<div className="w-full text-paragraph-sm">
									<div
										style={emailGridStyle}
										className="grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40"
									>
										<MatrixCell mounted={mounted} row={0} col={0}>
											<span className="flex size-4 shrink-0 rounded-sm border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5" />
										</MatrixCell>
										<MatrixCell mounted={mounted} row={0} col={1}>
											<div className="flex items-center gap-1">
												<Icon name="user" className="h-3 w-3" />
												<span className="text-xs">To</span>
											</div>
										</MatrixCell>
										<MatrixCell mounted={mounted} row={0} col={2}>
											<div className="flex items-center gap-1">
												<Icon name="file-text" className="h-3 w-3" />
												<span className="text-xs">Subject</span>
											</div>
										</MatrixCell>
										<MatrixCell mounted={mounted} row={0} col={3}>
											<div className="flex items-center gap-1">
												<Icon name="check-circle" className="h-3 w-3" />
												<span className="text-xs">Status</span>
											</div>
										</MatrixCell>
										<MatrixCell mounted={mounted} row={0} col={4}>
											<div className="flex items-center gap-1">
												<Icon name="clock" className="h-3 w-3" />
												<span className="text-xs">Time</span>
											</div>
										</MatrixCell>
										<MatrixCell mounted={mounted} row={0} col={5} className="justify-end">
											<span />
										</MatrixCell>
									</div>

									<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-visible rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
										<AnimatePresence initial={false}>
											{emails.map((email, rowIndex) => {
												const row = rowIndex + 1;
												const isHighlighted = highlightedId === email.id;

												return (
													<motion.div
														key={email.id}
														layout="position"
														initial={{
															opacity: 0,
															height: 0,
															y: -16,
															filter: "blur(4px)",
														}}
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
															transition: { duration: 0.35, ease: PAGE_EASE },
														}}
														transition={{
															duration: 0.42,
															ease: PAGE_EASE,
															layout: { duration: 0.45, ease: PAGE_EASE },
														}}
														style={{ overflow: "hidden" }}
													>
														<div
															style={emailGridStyle}
															className={cn(
																"group/row grid w-full cursor-pointer items-center px-4 py-2 text-left transition-colors duration-300 hover:bg-bg-weak-50",
																isHighlighted && "bg-blue-500/10 dark:bg-blue-400/10",
															)}
														>
															<MatrixCell mounted={mounted} row={row} col={0}>
																<span className="flex size-4 shrink-0 rounded-sm border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5" />
															</MatrixCell>
															<MatrixCell mounted={mounted} row={row} col={1}>
																<div className="flex min-w-0 items-center gap-2 pr-4">
																	<span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full">
																		<span
																			className={cn(
																				"flex h-full w-full items-center justify-center rounded-full font-semibold text-white text-xs uppercase tracking-wide shadow-sm",
																				getAvatarGradient(email.to),
																			)}
																		>
																			{getAvatarInitial(email.to)}
																		</span>
																	</span>
																	<span className="truncate font-medium text-label-sm text-text-strong-950">
																		{email.to}
																	</span>
																</div>
															</MatrixCell>
															<MatrixCell mounted={mounted} row={row} col={2}>
																<div className="min-w-0 truncate pr-4">
																	<span className="truncate font-medium text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2">
																		{email.subject}
																	</span>
																</div>
															</MatrixCell>
															<MatrixCell mounted={mounted} row={row} col={3}>
																<div className="flex items-center">
																	<div
																		className={cn(
																			"flex items-center gap-2 rounded-lg py-0.5 font-medium text-[13px] capitalize",
																			getEmailStatusColorClass(email.status),
																		)}
																	>
																		<Icon
																			name={getEmailStatusIcon(email.status)}
																			className="h-3.5 w-3.5"
																		/>
																		{getEmailStatusLabel(email.status)}
																	</div>
																</div>
															</MatrixCell>
															<MatrixCell mounted={mounted} row={row} col={4}>
																<div className="flex items-center">
																	<span className="whitespace-nowrap font-medium text-[13px] text-text-sub-600">
																		{email.time}
																	</span>
																</div>
															</MatrixCell>
															<MatrixCell mounted={mounted} row={row} col={5} className="justify-end">
																<span className="inline-flex aspect-square h-7 w-7 items-center justify-center rounded-lg">
																	<Icon
																		name="more-horizontal"
																		className="h-3.5 w-3.5 text-text-sub-600"
																	/>
																</span>
															</MatrixCell>
														</div>
													</motion.div>
												);
											})}
										</AnimatePresence>

										<motion.div
											layout="position"
											className="flex items-center justify-between px-4 py-2 text-label-xs text-text-sub-600"
											initial={reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(3px)" }}
											animate={
												reduceMotion || mounted
													? { opacity: 1, y: 0, filter: "blur(0px)" }
													: { opacity: 0, y: 16, filter: "blur(3px)" }
											}
											transition={{
												duration: FOOTER_DURATION,
												delay: FOOTER_DELAY,
												ease: PAGE_EASE,
												layout: { duration: 0.45, ease: PAGE_EASE },
											}}
										>
											<div className="flex items-center gap-3">
												<span>0 of 10 row(s) selected.</span>
												<button
													type="button"
													tabIndex={-1}
													className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-label-xs text-text-sub-600 uppercase outline-none"
												>
													10
													<Icon name="chevron-down" className="h-3 w-3" />
												</button>
											</div>
											<div className="flex items-center gap-1">
												<Button.Root
													variant="neutral"
													mode="stroke"
													size="xxsmall"
													tabIndex={-1}
													disabled
													className="h-5 w-5 rounded-md! p-1"
												>
													<Icon name="chevron-left" className="h-3.5 w-3.5" />
												</Button.Root>
												<span className="px-2 text-text-sub-600 text-xs">
													Page 1 of 5
												</span>
												<Button.Root
													variant="neutral"
													mode="stroke"
													size="xxsmall"
													tabIndex={-1}
													className="h-5 w-5 rounded-md! p-1"
												>
													<Icon name="chevron-right" className="h-3.5 w-3.5" />
												</Button.Root>
											</div>
										</motion.div>
									</div>
								</div>
							</div>
						</AnimateIn>
					</div>
				</div>
			</div>
		</div>
	);
}
