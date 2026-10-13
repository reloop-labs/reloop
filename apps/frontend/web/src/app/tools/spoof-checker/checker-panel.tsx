"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { FieldError, useFieldError } from "@reloop/ui/field-error";
import { Icon, type IconName } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { LoadingDot } from "@reloop/ui/loading-dot";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
	type ClipboardEvent,
	type FormEvent,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	runSpoofCheck,
	type SpoofCheckResult,
	type SpoofReason,
} from "./check-api";
import { toolPath } from "./content";

const FIELD_ERROR_MESSAGE = "Please enter a valid domain (e.g. stripe.com).";

function getDomainParam(): string | null {
	if (typeof window === "undefined") return null;
	try {
		const param = new URLSearchParams(window.location.search).get("domain");
		return param && param.trim().length > 0 ? param.trim().slice(0, 253) : null;
	} catch {
		return null;
	}
}

function syncDomainParam(value: string | null) {
	if (typeof window === "undefined") return;
	try {
		const url = new URL(window.location.href);
		if (value && value.trim().length > 0) {
			url.searchParams.set("domain", value.trim());
		} else {
			url.searchParams.delete("domain");
		}
		window.history.replaceState(null, "", url.toString());
	} catch {
		// Ignore history errors (e.g. non-HTTP contexts).
	}
}

function buildShareUrl(domain: string): string {
	const base =
		typeof window !== "undefined"
			? `${window.location.origin}${window.location.pathname}`
			: toolPath;
	return `${base}?domain=${encodeURIComponent(domain)}`;
}

function validateInput(raw: string): { ok: boolean } {
	const v = raw.trim();
	if (!v || v.length < 3 || v.length > 253) return { ok: false };
	if (!v.includes(".")) return { ok: false };
	return { ok: true };
}

function normalizeDomainInput(raw: string): string {
	let v = raw.trim().toLowerCase();
	v = v.replace(/^https?:\/\//, "").split("/")[0] ?? "";
	v = v.split("?")[0] ?? "";
	v = v.split("#")[0] ?? "";
	v = v.split(":")[0] ?? "";
	// Accept a pasted email address and check its domain.
	return v.includes("@") ? (v.split("@").pop() ?? "") : v;
}

function MorphSlot({
	activeKey,
	reduceMotion,
	children,
}: {
	activeKey: string | null;
	reduceMotion: boolean | null;
	children: ReactNode;
}) {
	const [height, setHeight] = useState<number | "auto">("auto");
	const [canAnimate, setCanAnimate] = useState(false);
	const innerRef = useRef<HTMLDivElement | null>(null);
	const setInnerRef = (node: HTMLDivElement | null) => {
		if (node) innerRef.current = node;
	};
	useEffect(() => setCanAnimate(true), []);
	useEffect(() => {
		if (!activeKey) {
			setHeight(0);
			return;
		}
		const el = innerRef.current;
		if (!el) return;
		const update = () =>
			setHeight(Math.ceil(el.getBoundingClientRect().height));
		update();
		if (typeof ResizeObserver === "undefined") return;
		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	}, [activeKey]);
	return (
		<motion.div
			initial={false}
			animate={{ height: reduceMotion ? "auto" : height }}
			transition={
				reduceMotion || !canAnimate
					? { duration: 0 }
					: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }
			}
			className="relative overflow-hidden"
		>
			<AnimatePresence initial={false} mode="sync">
				{activeKey ? (
					<motion.div
						key={activeKey}
						initial={reduceMotion ? false : { opacity: 0, filter: "blur(2px)" }}
						animate={{ opacity: 1, filter: "blur(0px)", pointerEvents: "auto" }}
						exit={
							reduceMotion
								? { opacity: 0, pointerEvents: "none" }
								: { opacity: 0, filter: "blur(2px)", pointerEvents: "none" }
						}
						transition={
							reduceMotion
								? { duration: 0 }
								: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }
						}
						className="absolute inset-x-0 top-0"
					>
						<div ref={setInnerRef}>{children}</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</motion.div>
	);
}

const VERDICT: Record<
	SpoofCheckResult["verdict"],
	{ label: string; icon: IconName; iconClass: string }
> = {
	protected: {
		label: "Protected",
		icon: "shield-check",
		iconClass: "text-emerald-500",
	},
	partially_protected: {
		label: "Partially protected",
		icon: "alert-triangle",
		iconClass: "text-amber-500",
	},
	spoofable: {
		label: "Spoofable",
		icon: "cross-circle",
		iconClass: "text-rose-500 dark:text-rose-400",
	},
};

const OUTCOME: Record<
	SpoofCheckResult["inboxOutcome"],
	{ label: string; hint: string; icon: IconName; className: string }
> = {
	delivered: {
		label: "Lands in the inbox",
		hint: "Nothing stops a forged email. Your team or customers would see it like a real one.",
		icon: "alert-triangle",
		className:
			"border-rose-500/20 bg-rose-500/[0.08] text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400",
	},
	spam: {
		label: "Goes to spam",
		hint: "Inboxes are told to quarantine forged mail, so it usually lands in spam instead of the inbox.",
		icon: "alert-triangle",
		className:
			"border-amber-500/20 bg-amber-500/[0.08] text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400",
	},
	rejected: {
		label: "Blocked before the inbox",
		hint: "Inboxes are told to reject forged mail outright, so nobody ever sees it.",
		icon: "shield-check",
		className:
			"border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400",
	},
};

const SEVERITY: Record<
	SpoofReason["severity"],
	{ icon: IconName; className: string }
> = {
	critical: {
		icon: "cross-circle",
		className: "text-rose-500 dark:text-rose-400",
	},
	warning: { icon: "alert-triangle", className: "text-amber-500" },
	success: { icon: "check-circle", className: "text-emerald-500" },
	info: {
		icon: "info-outline",
		className: "text-text-soft-400 dark:text-white/40",
	},
};

/** Which record a reason is about, from its id prefix (e.g. "dmarc-p-none"). */
function reasonTag(id: string): string | null {
	const prefix = id.split("-")[0];
	switch (prefix) {
		case "dmarc":
		case "subdomain":
			return "DMARC";
		case "spf":
			return "SPF";
		case "dkim":
			return "DKIM";
		case "mx":
			return "MX";
		default:
			return null;
	}
}

/** A titled card with a one-line explanation, so every block says what it is. */
function Section({
	title,
	hint,
	action,
	children,
}: {
	title: ReactNode;
	hint: ReactNode;
	action?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 dark:border-white/10 dark:bg-white/[0.02]">
			<div className="flex items-start justify-between gap-3 px-3.5 py-2.5 sm:px-4">
				<div className="min-w-0">
					<p className="font-semibold text-sm text-text-strong-950 dark:text-white">
						{title}
					</p>
					<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed dark:text-white/50">
						{hint}
					</p>
				</div>
				{action}
			</div>
			<div className="p-2 pt-0 sm:p-2.5 sm:pt-0">
				<div className="rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-4 py-3 dark:border-white/10 dark:bg-[#070707]">
					{children}
				</div>
			</div>
		</div>
	);
}

function ResultView({
	result,
	shouldReduceMotion,
}: {
	result: SpoofCheckResult;
	shouldReduceMotion: boolean | null;
}) {
	const verdict = VERDICT[result.verdict];
	const outcome = OUTCOME[result.inboxOutcome];
	const [showRaw, setShowRaw] = useState(false);
	// The subdomain note usually repeats a "subdomain-*" reason; show it once.
	const showSubdomainNote =
		Boolean(result.subdomainNote) &&
		!result.reasons.some((r) => r.id.startsWith("subdomain"));

	return (
		<div className="flex flex-col gap-3 text-left">
			{/* The answer */}
			<div className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 px-3.5 py-3 sm:px-4 dark:border-white/10 dark:bg-white/[0.02]">
				<div className="flex items-start gap-2">
					<Icon
						name={verdict.icon}
						className={cn("mt-0.5 size-4 shrink-0", verdict.iconClass)}
					/>
					<p className="font-semibold text-sm text-text-strong-950 leading-relaxed dark:text-white">
						{result.headline}
					</p>
				</div>
				<p className="mt-1 pl-6 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/55">
					{result.summary}
				</p>
			</div>

			{/* What a fake would do */}
			<Section title="If someone sent a fake email as you" hint={outcome.hint}>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex min-w-0 items-start gap-3">
						<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 font-semibold text-[12px] text-text-sub-600 dark:bg-white/[0.06] dark:text-white/60">
							CEO
						</span>
						<div className="min-w-0">
							<p className="truncate text-[13px]">
								<span className="font-semibold text-text-strong-950 dark:text-white">
									CEO
								</span>{" "}
								<span className="font-mono text-[11.5px] text-text-sub-600 dark:text-white/50">
									&lt;ceo@{result.domain}&gt;
								</span>
							</p>
							<p className="truncate font-medium text-[13px] text-text-strong-950 dark:text-white/90">
								Urgent: please wire $40,000 to vendor account today
							</p>
							<p className="truncate text-[12px] text-text-sub-600 dark:text-white/45">
								Hi team, please process this payment before end of day.
							</p>
						</div>
					</div>
					<span
						className={cn(
							"inline-flex shrink-0 items-center gap-1.5 self-start rounded-md border px-2 py-1 font-medium text-[12px] sm:self-center",
							outcome.className,
						)}
					>
						<Icon name={outcome.icon} className="size-3.5" />
						{outcome.label}
					</span>
				</div>
			</Section>

			{/* Why */}
			<Section
				title="Why"
				hint="What your public DMARC, SPF and DKIM records tell inboxes to do."
				action={
					<button
						type="button"
						onClick={() => setShowRaw((prev) => !prev)}
						aria-expanded={showRaw}
						aria-controls="spoof-raw-records"
						className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1 font-medium text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<span>Raw records</span>
						<Icon
							name="chevron-down"
							className={cn(
								"size-3 transition-transform duration-200",
								showRaw && "rotate-180",
							)}
						/>
					</button>
				}
			>
				<AnimatePresence initial={false}>
					{showRaw ? (
						<motion.div
							id="spoof-raw-records"
							key="raw-records"
							initial={
								shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }
							}
							animate={
								shouldReduceMotion
									? { opacity: 1 }
									: { opacity: 1, height: "auto" }
							}
							exit={
								shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }
							}
							transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
							className="overflow-hidden"
						>
							<div className="mb-3 space-y-2 rounded-lg bg-bg-weak-50 p-3 font-mono text-[11.5px] leading-relaxed dark:bg-white/[0.03]">
								<p className="break-all text-text-strong-950 dark:text-white/85">
									<span className="text-text-sub-600 dark:text-white/40">
										_dmarc.{result.domain} TXT{" "}
									</span>
									{result.dmarc.rawRecord ?? "No record found"}
								</p>
								<p className="break-all text-text-strong-950 dark:text-white/85">
									<span className="text-text-sub-600 dark:text-white/40">
										{result.domain} TXT{" "}
									</span>
									{result.spf.rawRecord ?? "No SPF record found"}
								</p>
							</div>
						</motion.div>
					) : null}
				</AnimatePresence>
				<ul className="-my-3 divide-y divide-stroke-soft-100/50 dark:divide-white/5">
					{result.reasons.map((reason) => {
						const severity = SEVERITY[reason.severity];
						const tag = reasonTag(reason.id);
						return (
							<li key={reason.id} className="flex items-start gap-2.5 py-3">
								<Icon
									name={severity.icon}
									className={cn("mt-0.5 size-4 shrink-0", severity.className)}
								/>
								<div className="min-w-0">
									<div className="flex flex-wrap items-center gap-1.5">
										<span className="font-semibold text-sm text-text-strong-950 dark:text-white">
											{reason.title}
										</span>
										{tag ? (
											<span className="rounded-md border border-stroke-soft-100 bg-bg-weak-50 px-1.5 py-px font-medium font-mono text-[10.5px] text-text-sub-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60">
												{tag}
											</span>
										) : null}
									</div>
									<p className="mt-0.5 text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/55">
										{reason.detail}
									</p>
								</div>
							</li>
						);
					})}
				</ul>
			</Section>

			{showSubdomainNote && result.subdomainNote ? (
				<div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs">
					<Icon
						name="alert-triangle"
						className="mt-px size-4 shrink-0 text-amber-500"
					/>
					<p className="text-amber-700 leading-relaxed dark:text-amber-400">
						{result.subdomainNote.replace(/^Note:\s*/, "")}
					</p>
				</div>
			) : null}

			<a
				href={result.nextStep.href}
				className="group flex items-center justify-between gap-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-3 transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
			>
				<span className="min-w-0">
					<span className="block font-mono text-[10.5px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
						Recommendation
					</span>
					<span className="mt-1 block font-medium text-[13px] text-text-strong-950 dark:text-white">
						{result.nextStep.title}
					</span>
					<span className="mt-0.5 block text-[12px] text-text-sub-600 leading-relaxed dark:text-white/55">
						{result.nextStep.body}
					</span>
				</span>
				<Icon
					name="arrow-right"
					className="size-3.5 shrink-0 text-text-sub-600 transition-transform group-hover:translate-x-0.5 dark:text-white/50"
				/>
			</a>
		</div>
	);
}

export function CheckerPanel() {
	const [domain, setDomain] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<SpoofCheckResult | null>(null);
	const [copied, setCopied] = useState(false);
	const [copiedLink, setCopiedLink] = useState(false);
	const field = useFieldError();
	const shouldReduceMotion = useReducedMotion();
	const hasFieldError = field.hasError;
	const abortRef = useRef<AbortController | null>(null);

	const executeCheck = async (raw: string) => {
		const clean = normalizeDomainInput(raw);
		if (!validateInput(clean).ok) {
			setResult(null);
			setError(null);
			field.show(FIELD_ERROR_MESSAGE);
			return;
		}
		field.clear();
		// Shareable URL from the moment a check starts, so reload or a
		// shared link re-runs the same check even if it errors.
		syncDomainParam(clean);
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;
		setIsLoading(true);
		setError(null);
		try {
			const res = await runSpoofCheck(clean, controller.signal);
			if (controller.signal.aborted) return;
			setResult(res);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setResult(null);
			setError(
				(err as Error).message || "Something went wrong running that check.",
			);
		} finally {
			if (!controller.signal.aborted) setIsLoading(false);
		}
	};

	useEffect(
		() => () => {
			abortRef.current?.abort();
		},
		[],
	);

	// Deep-link support: ?domain= pre-fills and auto-runs. The timeout defers
	// past StrictMode's remount simulation (whose cleanup aborts in-flight
	// fetches); the cleanup clears the first timer so the check runs once.
	// biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
	useEffect(() => {
		const preset = getDomainParam();
		if (!preset) return;
		setDomain(normalizeDomainInput(preset) || preset);
		const t = setTimeout(() => {
			void executeCheck(preset);
		}, 0);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (result || error) return;
		void executeCheck(domain);
	};

	const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
		if (isLoading) return;
		const pasted = e.clipboardData.getData("text").trim();
		if (!pasted) return;
		const norm = normalizeDomainInput(pasted);
		if (validateInput(norm).ok) {
			e.preventDefault();
			setDomain(norm);
			if (hasFieldError) field.clear();
			setResult(null);
			setError(null);
			void executeCheck(norm);
		}
	};

	const handleReset = () => {
		abortRef.current?.abort();
		setIsLoading(false);
		setResult(null);
		setError(null);
		field.clear();
		setDomain("");
		syncDomainParam(null);
		setTimeout(() => field.inputRef.current?.focus(), 50);
	};

	const handleCopyReport = async () => {
		if (!result) return;
		const report = `[Reloop Email Spoofing Check]
Domain: ${result.domain}
Verdict: ${VERDICT[result.verdict].label}
${result.headline}
A fake email from this domain: ${OUTCOME[result.inboxOutcome].label}
DMARC: ${result.dmarc.rawRecord || "Not published"}
SPF: ${result.spf.rawRecord || "Not published"}
https://reloop.sh${toolPath}?domain=${encodeURIComponent(result.domain)}`;
		try {
			await navigator.clipboard.writeText(report);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Clipboard may be unavailable outside a secure context.
		}
	};

	const handleCopyLink = async () => {
		if (!result) return;
		try {
			await navigator.clipboard.writeText(buildShareUrl(result.domain));
			setCopiedLink(true);
			setTimeout(() => setCopiedLink(false), 2000);
		} catch {
			// Clipboard may be unavailable outside a secure context.
		}
	};

	const hasChecked = Boolean(result || error);

	return (
		<div className="mx-auto w-full max-w-2xl text-left font-sans">
			<form onSubmit={handleSubmit} noValidate className="space-y-2.5">
				<div className="mx-auto w-full max-w-xl">
					<FieldError field={field} messageClassName="text-xs leading-relaxed">
						<div className="relative w-full">
							<Input.Root
								size="medium"
								hasError={hasFieldError}
								className={cn(
									"relative z-10 w-full rounded-xl bg-bg-white-0 shadow-xs transition-shadow sm:rounded-2xl dark:bg-[#0c0c0c]",
									hasFieldError
										? "has-[input:focus]:!shadow-button-error-focus has-[input:focus]:before:!ring-error-base"
										: "has-[input:focus]:before:!ring-primary-base has-[input:focus]:!shadow-button-primary-focus",
								)}
							>
								<Input.Wrapper className="h-12 pr-2 pl-4 dark:bg-[#0c0c0c]">
									<Input.Input
										id="checker-input"
										aria-label="Domain"
										{...field.controlProps}
										type="text"
										inputMode="url"
										autoComplete="off"
										autoCapitalize="none"
										spellCheck={false}
										value={domain}
										onPaste={handlePaste}
										onChange={(e) => {
											setDomain(e.target.value);
											if (hasFieldError) field.clear();
											if (result) setResult(null);
											if (error) setError(null);
										}}
										placeholder="stripe.com or https://stripe.com"
										className="font-medium text-[15px]"
									/>
									{hasChecked ? (
										<button
											type="button"
											onClick={handleReset}
											className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white"
											aria-label="Clear check"
										>
											<svg
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2.5"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="size-3.5"
												aria-hidden="true"
											>
												<path d="M18 6L6 18M6 6l12 12" />
											</svg>
										</button>
									) : (
										<FancyButton.Root
											type="submit"
											variant="primary"
											size="xsmall"
											className="!p-0 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg dark:text-black"
											aria-label="Check if this domain can be spoofed"
										>
											{isLoading ? (
												<LoadingDot
													size={13}
													dotSize={2}
													className="text-white dark:text-black"
												/>
											) : (
												<FancyButton.Icon className="mx-0 size-3.5 dark:text-black">
													<Icon
														name="arrow-right"
														className="size-3.5 text-white dark:text-black"
													/>
												</FancyButton.Icon>
											)}
										</FancyButton.Root>
									)}
								</Input.Wrapper>
							</Input.Root>
						</div>
					</FieldError>
				</div>

				<MorphSlot
					activeKey={error ? "error" : result ? "result" : null}
					reduceMotion={shouldReduceMotion}
				>
					{error ? (
						<div className="mx-auto flex max-w-xl items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 text-xs">
							<Icon
								name="alert-triangle"
								className="mt-0.5 size-4 shrink-0 text-rose-500"
							/>
							<p className="text-rose-600 leading-relaxed dark:text-rose-400">
								{error}
							</p>
						</div>
					) : result ? (
						<div className="space-y-2 pt-1">
							<ResultView
								result={result}
								shouldReduceMotion={shouldReduceMotion}
							/>
							<div className="-mx-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
								<div className="flex items-center gap-0.5 sm:gap-1.5">
									<button
										type="button"
										onClick={handleCopyLink}
										className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 font-medium text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
									>
										<Icon
											name={copiedLink ? "check" : "link"}
											className="size-3.5"
										/>
										{copiedLink ? "Link copied" : "Copy link"}
									</button>
									<button
										type="button"
										onClick={handleCopyReport}
										className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 font-medium text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
									>
										<Icon
											name={copied ? "check" : "copy"}
											className="size-3.5"
										/>
										{copied ? "Copied" : "Copy summary"}
									</button>
								</div>
								<button
									type="button"
									onClick={handleReset}
									className="cursor-pointer rounded-lg px-2 py-1.5 font-medium text-primary-base text-xs hover:underline"
								>
									Clear result
								</button>
							</div>
						</div>
					) : null}
				</MorphSlot>
			</form>
		</div>
	);
}
