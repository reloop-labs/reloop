"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdKey } from "@reloop/ui/kbd-key";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { HeroDemoCursor } from "./hero-demo-cursor";
import {
	HeroDomainDetailPage,
	HeroDomainSetupPage,
} from "./hero-domain-demo-pages";

type DomainStatus = "pending" | "verifying" | "active" | "suspended" | "failed";

type DomainRow = {
	id: string;
	domain: string;
	status: DomainStatus;
	time: string;
};

const DOMAINS: DomainRow[] = [
	{ id: "dom_01", domain: "acme.com", status: "active", time: "11 days ago" },
	{
		id: "dom_02",
		domain: "mail.acme.com",
		status: "active",
		time: "11 days ago",
	},
	{
		id: "dom_03",
		domain: "updates.acme.com",
		status: "verifying",
		time: "2 days ago",
	},
	{
		id: "dom_04",
		domain: "inbox.acme.com",
		status: "active",
		time: "8 days ago",
	},
	{
		id: "dom_05",
		domain: "staging.acme.com",
		status: "pending",
		time: "1 day ago",
	},
	{
		id: "dom_06",
		domain: "track.acme.com",
		status: "failed",
		time: "3 days ago",
	},
];

const NEW_DOMAIN: DomainRow = {
	id: "dom_07",
	domain: "send.acme.com",
	status: "pending",
	time: "Just now",
};

const PAGE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const domainGridStyle = {
	gridTemplateColumns: "32px minmax(0,1fr) 120px 140px 32px",
};

const toolbarControlClassName = cn(
	"inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-2.5 shadow-none",
	"font-normal text-text-sub-600 text-xs transition duration-200 ease-out",
	"hover:bg-bg-weak-50 hover:text-text-strong-950",
	"dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/40",
);

const kbdClassName = cn(
	"h-4 w-4 min-w-4 rounded-[5px] px-0 text-[10px] leading-none",
	"border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600",
	"shadow-[0_1.5px_0_0_var(--color-stroke-soft-200)]",
	"dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white",
	"dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.06),inset_0_0.5px_0_0_rgba(255,255,255,0.08)]",
);

const resourceCardClassName = cn(
	"group flex w-full cursor-pointer flex-col rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 text-left",
	"transition-[border-color,background-color,transform] duration-150 ease-out",
	"hover:border-stroke-soft-200 hover:bg-bg-weak-50/50",
	"active:scale-[0.99]",
	"dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20 dark:hover:bg-bg-weak-50/40",
);

function ActionKbd({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<KbdKey className={cn(kbdClassName, className)}>{children}</KbdKey>
	);
}

function getStatusLabel(status: DomainStatus): string {
	switch (status) {
		case "active":
			return "Active";
		case "verifying":
			return "Verifying";
		case "pending":
			return "Not Started";
		case "suspended":
			return "Suspended";
		case "failed":
			return "Failed";
		default:
			return status;
	}
}

function getStatusColorClass(status: DomainStatus): string {
	switch (status) {
		case "pending":
			return "text-text-sub-600";
		case "verifying":
			return "text-warning-base";
		case "active":
			return "text-success-base";
		case "failed":
		case "suspended":
			return "text-error-base";
		default:
			return "text-text-sub-600";
	}
}

function getStatusIcon(status: DomainStatus): string {
	switch (status) {
		case "pending":
			return "minus-circle";
		case "verifying":
			return "time";
		case "active":
			return "check-circle";
		case "failed":
			return "cross-circle";
		default:
			return "minus-circle";
	}
}

function pointIn(container: HTMLElement, el: HTMLElement) {
	const c = container.getBoundingClientRect();
	const r = el.getBoundingClientRect();
	const scaleX = c.width / container.offsetWidth || 1;
	const scaleY = c.height / container.offsetHeight || 1;
	return {
		x: (r.left - c.left + r.width * 0.58) / scaleX,
		y: (r.top - c.top + r.height * 0.52) / scaleY,
	};
}

function DomainTableRow({ domain }: { domain: DomainRow }) {
	return (
		<div
			style={domainGridStyle}
			className="group/row grid w-full items-center px-4 py-2 text-left hover:bg-bg-weak-50"
		>
			<div className="flex items-center">
				<span className="flex size-4 shrink-0 rounded-sm border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5" />
			</div>
			<div className="flex min-w-0 items-center gap-2">
				<Icon
					name="globe"
					className={cn(
						"h-4 w-4 shrink-0",
						getStatusColorClass(domain.status),
					)}
				/>
				<span className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2">
					{domain.domain}
				</span>
			</div>
			<div className="flex items-center">
				<div
					className={cn(
						"flex items-center gap-2 rounded-lg py-0.5 font-medium text-[13px] capitalize",
						getStatusColorClass(domain.status),
					)}
				>
					<Icon
						name={getStatusIcon(domain.status)}
						className="h-3.5 w-3.5"
					/>
					{getStatusLabel(domain.status)}
				</div>
			</div>
			<div className="flex items-center">
				<span className="whitespace-nowrap font-medium text-sm text-text-sub-600">
					{domain.time}
				</span>
			</div>
			<div className="flex items-center justify-end">
				<span className="inline-flex aspect-square h-7 w-7 items-center justify-center rounded-lg">
					<Icon
						name="more-horizontal"
						className="h-3.5 w-3.5 text-text-sub-600"
					/>
				</span>
			</div>
		</div>
	);
}

export function HeroDomainPreview() {
	const reduceMotion = useReducedMotion();
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
		if (reduceMotion) return;

		let cancelled = false;
		const timers = new Set<number>();

		const sleep = (ms: number) =>
			new Promise<void>((resolve) => {
				const id = window.setTimeout(() => {
					timers.delete(id);
					resolve();
				}, ms);
				timers.add(id);
			});

		const moveTo = async (el: HTMLElement | null) => {
			const root = containerRef.current;
			if (!root || !el) return;
			const { x, y } = pointIn(root, el);
			await Promise.all([
				animate(cursorX, x, {
					type: "spring",
					stiffness: 160,
					damping: 22,
					mass: 0.7,
				}),
				animate(cursorY, y, {
					type: "spring",
					stiffness: 160,
					damping: 22,
					mass: 0.7,
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
			await animate(cursorOpacity, 1, { duration: 0.22, ease: PAGE_EASE });
			if (cancelled) return;

			await sleep(280);
			if (cancelled) return;
			await moveTo(addBtnRef.current);
			if (cancelled) return;
			await sleep(140);
			await click(setAddPressed);
			if (cancelled) return;

			setView("add");
			await sleep(360);
			if (cancelled) return;

			await moveTo(inputWrapRef.current);
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
			await moveTo(submitRef.current);
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
			await sleep(420);
			if (cancelled) return;

			await moveTo(cloudflareRef.current);
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

			await sleep(280);
			if (cancelled) return;
			await animate(cursorOpacity, 0, { duration: 0.28, ease: PAGE_EASE });

			await sleep(2400);
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

	const addedDomain: DomainRow = {
		...NEW_DOMAIN,
		status: newStatus,
	};
	const rows = added ? [addedDomain, ...DOMAINS] : DOMAINS;
	const domainParts = typed.split(".").filter(Boolean);
	const isValid =
		/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(
			typed,
		);
	const isSubdomain = isValid && domainParts.length > 2;

	return (
		<div
			ref={containerRef}
			aria-hidden
			className="relative h-full overflow-hidden bg-bg-white-0 select-none dark:bg-black"
		>
			<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
				<div className="flex flex-col gap-4 pt-2 pb-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<div className="flex items-center gap-2.5">
							<Icon
								name="globe"
								className="h-6 w-6 shrink-0 text-text-strong-950"
							/>
							<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
								Domains
							</h1>
						</div>
						<p className="mt-1 text-sm text-text-sub-600">
							Add and verify custom domains to send emails with maximum
							deliverability.
						</p>
					</div>

					<div className="flex shrink-0 items-center gap-2">
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
							<ActionKbd>S</ActionKbd>
						</Button.Root>
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							tabIndex={-1}
							className="gap-1.5 rounded-xl text-text-strong-950"
						>
							Documentation
							<ActionKbd>D</ActionKbd>
						</Button.Root>
						<div
							ref={addBtnRef}
							className={cn(
								"inline-flex transition-transform duration-100 ease-out",
								addPressed && "scale-[0.97]",
							)}
						>
							<FancyButton.Root
								type="button"
								variant="blue"
								size="small"
								tabIndex={-1}
								className="gap-1.5 rounded-xl"
							>
								<Icon name="plus" className="h-4 w-4" />
								Add domain
								<ActionKbd className="border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]">
									C
								</ActionKbd>
							</FancyButton.Root>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
					<div className="lg:col-span-9 xl:col-span-9">
						<div className="space-y-4">
							<div
								role="toolbar"
								aria-orientation="horizontal"
								className="flex w-full items-start justify-between gap-2"
							>
								<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
									<Input.Root
										size="small"
										className="w-40 rounded-xl shadow-none! lg:w-56"
									>
										<Input.Wrapper>
											<Input.Icon as={Icon} name="search" size="small" />
											<Input.Input
												readOnly
												tabIndex={-1}
												placeholder="Search domains..."
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

									<button
										type="button"
										tabIndex={-1}
										className={toolbarControlClassName}
									>
										<Icon name="plus-circle" className="size-4" />
										Status
									</button>
								</div>

								<div className="flex shrink-0 items-center gap-2">
									<button
										type="button"
										tabIndex={-1}
										aria-label="Toggle columns"
										className={toolbarControlClassName}
									>
										<Icon name="gear" className="size-4 text-text-soft-400" />
										View
									</button>
									<button
										type="button"
										tabIndex={-1}
										className={cn(toolbarControlClassName, "gap-2 px-1.5")}
										aria-label="Refresh domains"
									>
										<Icon
											name="rotate-cw"
											className="h-3.5 w-3.5 shrink-0"
										/>
										<ActionKbd>R</ActionKbd>
									</button>
								</div>
							</div>

							<div className="w-full text-paragraph-sm">
								<div
									style={domainGridStyle}
									className="grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40"
								>
									<div className="flex items-center">
										<span className="flex size-4 shrink-0 rounded-sm border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5" />
									</div>
									<div className="flex items-center gap-1">
										<Icon name="globe" className="h-3 w-3" />
										<span className="text-xs">Domain</span>
									</div>
									<div className="flex items-center gap-1">
										<Icon name="activity" className="h-3 w-3" />
										<span className="text-xs">Status</span>
									</div>
									<div className="flex items-center gap-1">
										<Icon name="clock" className="h-3 w-3" />
										<span className="text-xs">Created At</span>
									</div>
									<div />
								</div>

								<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-visible rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
									<AnimatePresence initial={false}>
										{added && (
											<motion.div
												key={NEW_DOMAIN.id}
												initial={
													reduceMotion
														? { opacity: 1 }
														: { opacity: 0, y: -8, filter: "blur(2px)" }
												}
												animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
												exit={
													reduceMotion
														? { opacity: 0 }
														: { opacity: 0, y: -6, filter: "blur(2px)" }
												}
												transition={{ duration: 0.28, ease: PAGE_EASE }}
												className="bg-primary-alpha-10"
											>
												<DomainTableRow domain={addedDomain} />
											</motion.div>
										)}
									</AnimatePresence>
									{DOMAINS.map((domain) => (
										<DomainTableRow key={domain.id} domain={domain} />
									))}

									<div className="flex items-center justify-between px-4 py-2 text-label-xs text-text-sub-600">
										<div className="flex items-center gap-3">
											<span>0 of {rows.length} row(s) selected.</span>
											<button
												type="button"
												tabIndex={-1}
												className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-label-xs text-text-sub-600 uppercase outline-none"
											>
												10
												<Icon name="chevron-down" className="h-3 w-3" />
											</button>
										</div>
										<span className="px-2 text-text-sub-600 text-xs">
											Page 1 of 1
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="lg:col-span-3 xl:col-span-3">
						<aside className="space-y-3 lg:sticky lg:top-6">
							<div>
								<h2 className="font-semibold text-lg text-text-strong-950 tracking-tight">
									Domain resources
								</h2>
								<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
									Guides & documentation for domain management.
								</p>
							</div>
							<div className={resourceCardClassName}>
								<div className="flex items-start justify-between gap-3">
									<h3 className="font-semibold text-sm text-text-strong-950">
										Configure DNS by provider
									</h3>
									<Icon
										name="chevron-right"
										className="mt-0.5 h-4 w-4 shrink-0 text-text-soft-400"
									/>
								</div>
								<p className="mt-1.5 text-text-sub-600 text-xs leading-relaxed">
									Step-by-step guides for Cloudflare, GoDaddy, Route 53,
									Namecheap, and more.
								</p>
							</div>
							<div className={resourceCardClassName}>
								<div className="flex items-start justify-between gap-3">
									<h3 className="font-semibold text-sm text-text-strong-950">
										Domain verification guide
									</h3>
									<Icon
										name="chevron-right"
										className="mt-0.5 h-4 w-4 shrink-0 text-text-soft-400"
									/>
								</div>
								<p className="mt-1.5 text-text-sub-600 text-xs leading-relaxed">
									Add a sending domain and verify SPF, DKIM, and DMARC for
									deliverability.
								</p>
							</div>
						</aside>
					</div>
				</div>
			</div>

			<AnimatePresence>
				{view === "setup" && (
					<motion.div
						key="setup"
						className="absolute inset-0 z-20 overflow-hidden bg-bg-white-0 dark:bg-black"
						initial={
							reduceMotion
								? { opacity: 1 }
								: { opacity: 0, scale: 0.96, y: 10 }
						}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={
							reduceMotion
								? { opacity: 0 }
								: { opacity: 0, scale: 0.96, y: 8 }
						}
						transition={{ duration: 0.25, ease: PAGE_EASE }}
					>
						<HeroDomainSetupPage
							domain={NEW_DOMAIN.domain}
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
						initial={
							reduceMotion
								? { opacity: 1 }
								: { opacity: 0, scale: 0.96, y: 10 }
						}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={
							reduceMotion
								? { opacity: 0 }
								: { opacity: 0, scale: 0.96, y: 8 }
						}
						transition={{ duration: 0.25, ease: PAGE_EASE }}
					>
						<HeroDomainDetailPage domain={NEW_DOMAIN.domain} />
					</motion.div>
				)}
				{view === "add" && (
					<motion.div
						key="add"
						className="absolute inset-0 z-20 overflow-hidden bg-bg-white-0 dark:bg-black"
						initial={
							reduceMotion
								? { opacity: 1 }
								: { opacity: 0, scale: 0.96, y: 10 }
						}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={
							reduceMotion
								? { opacity: 0 }
								: { opacity: 0, scale: 0.96, y: 8 }
						}
						transition={{ duration: 0.25, ease: PAGE_EASE }}
					>
						<div className="mx-auto w-full max-w-md px-6 pt-10 sm:px-8 sm:pt-12">
							<h2 className="font-semibold text-[22px] text-text-strong-950 leading-8 tracking-tight">
								Add Domain
							</h2>
							<p className="text-text-sub-600 text-xs">
								Send emails from a domain you control
							</p>

							<div className="mt-6 space-y-1">
								<div className="font-medium text-sm text-text-strong-950">
									Domain Name
									<span className="ml-0.5 text-error-base">*</span>
								</div>
								<div ref={inputWrapRef}>
									<Input.Root size="small" className="w-full rounded-xl">
										<Input.Wrapper>
											<Input.Input
												readOnly
												tabIndex={-1}
												value={typed}
												placeholder="send.example.com"
											/>
											{isSubdomain ? (
												<Input.Icon>
													<Icon
														name="check"
														className="h-4 w-4 text-green-500"
													/>
												</Input.Icon>
											) : null}
										</Input.Wrapper>
									</Input.Root>
								</div>
								<div className="mt-3 space-y-2">
									<div className="font-medium text-text-sub-600 text-xs">
										Domain Recommendations:
									</div>
									<div className="space-y-1.5">
										<RecommendRow
											ok={isSubdomain}
											title="Use a subdomain"
											detail="(e.g., mail.acme.com, send.acme.com, m.acme.com)"
										/>
										<RecommendRow
											ok={isSubdomain}
											title="Avoid using your root domain"
										/>
										<RecommendRow ok={isValid} title="Valid domain format" />
									</div>
								</div>
							</div>

							<div className="mt-6 flex items-center gap-3">
								<div
									ref={submitRef}
									className={cn(
										"inline-flex transition-transform duration-100 ease-out",
										submitPressed && "scale-[0.97]",
									)}
								>
									<FancyButton.Root
										type="button"
										variant="blue"
										size="small"
										tabIndex={-1}
										className="min-w-[134px] justify-center overflow-hidden rounded-xl"
									>
										{submitting ? (
											<span>Adding Domain...</span>
										) : (
											<>
												<span>Add Domain</span>
												<ActionKbd className="w-auto min-w-4 px-1 border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]">
													↵
												</ActionKbd>
											</>
										)}
									</FancyButton.Root>
								</div>
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="small"
									tabIndex={-1}
									className="gap-1.5 rounded-xl"
								>
									Cancel
								</Button.Root>
							</div>
						</div>
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

function RecommendRow({
	ok,
	title,
	detail,
}: {
	ok: boolean;
	title: string;
	detail?: string;
}) {
	return (
		<div className="flex items-start gap-2 text-text-sub-600 text-xs">
			<Icon
				name="check-circle"
				className={
					ok
						? "mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500"
						: "mt-0.5 h-3.5 w-3.5 shrink-0 text-text-soft-400"
				}
			/>
			<div>
				<div>{title}</div>
				{detail ? (
					<div className="text-text-soft-400 text-xs">{detail}</div>
				) : null}
			</div>
		</div>
	);
}
