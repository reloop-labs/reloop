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
	type BimiCheckResponse,
	type CheckStatus,
	runBimiCheck,
} from "./check-api";
import {
	FIELD_ERROR_MESSAGE,
	normalizeDomainInput,
	validateCheckerInput,
} from "./syntax";

const HEIGHT_MORPH = {
	duration: 0.28,
	ease: [0.22, 1, 0.36, 1] as const,
};

const CROSSFADE = {
	duration: 0.22,
	ease: [0.22, 1, 0.36, 1] as const,
};

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

function buildShareUrl(input: string): string {
	const base =
		typeof window !== "undefined"
			? `${window.location.origin}${window.location.pathname}`
			: "/tools/bimi-checker";
	return `${base}?domain=${encodeURIComponent(input)}`;
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

	useEffect(() => {
		setCanAnimate(true);
	}, []);

	useEffect(() => {
		if (!activeKey) {
			setHeight(0);
			return;
		}

		const el = innerRef.current;
		if (!el) return;

		const update = () => {
			setHeight(Math.ceil(el.getBoundingClientRect().height));
		};

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
			transition={reduceMotion || !canAnimate ? { duration: 0 } : HEIGHT_MORPH}
			className="relative overflow-hidden"
		>
			<AnimatePresence initial={false} mode="sync">
				{activeKey ? (
					<motion.div
						key={activeKey}
						initial={reduceMotion ? false : { opacity: 0, filter: "blur(2px)" }}
						animate={{
							opacity: 1,
							filter: "blur(0px)",
							pointerEvents: "auto",
						}}
						exit={
							reduceMotion
								? { opacity: 0, pointerEvents: "none" }
								: {
										opacity: 0,
										filter: "blur(2px)",
										pointerEvents: "none",
									}
						}
						transition={reduceMotion ? { duration: 0 } : CROSSFADE}
						className="absolute inset-x-0 top-0"
					>
						<div ref={setInnerRef}>{children}</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</motion.div>
	);
}

const VERDICT_STATUS_CONFIG: Record<
	CheckStatus,
	{
		label: string;
		hint: string;
		icon: IconName;
		iconClass: string;
	}
> = {
	pass: {
		label: "BIMI ready",
		hint: "Your logo can show next to your mail in inboxes that support BIMI.",
		icon: "check-circle",
		iconClass: "text-emerald-500",
	},
	warn: {
		label: "BIMI with warnings",
		hint: "Your logo may show in some inboxes. Fix the warnings below to show it everywhere.",
		icon: "alert-triangle",
		iconClass: "text-amber-500",
	},
	fail: {
		label: "BIMI not ready",
		hint: "Your logo won't show anywhere until the failing checks below are fixed.",
		icon: "cross-circle",
		iconClass: "text-rose-500 dark:text-rose-400",
	},
};

/** Solid scalloped badge with a cut-out check, like X's verified mark. */
function VerifiedBadge({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 22 22"
			aria-label="Verified"
			role="img"
			className={cn("text-emerald-500", className)}
		>
			<path
				fill="currentColor"
				d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
			/>
		</svg>
	);
}

const STATUS_LABEL: Record<CheckStatus, string> = {
	pass: "Pass",
	warn: "Warning",
	fail: "Fail",
};

function CheckItem({
	label,
	status,
	detail,
	record,
	fix,
}: {
	label: string;
	status: CheckStatus;
	detail: string;
	record?: string;
	fix?: string;
}) {
	const dotColor =
		status === "fail"
			? "bg-rose-500"
			: status === "warn"
				? "bg-amber-500"
				: "bg-emerald-500";

	const badgeStyles =
		status === "fail"
			? "border-rose-500/20 bg-rose-500/[0.08] text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400"
			: status === "warn"
				? "border-amber-500/20 bg-amber-500/[0.08] text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400"
				: "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400";

	return (
		<div className="py-3 last:pb-0">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2.5">
					<span className={cn("size-2 rounded-full", dotColor)} />
					<span className="font-semibold text-sm text-text-strong-950 dark:text-white">
						{label}
					</span>
				</div>
				<code
					className={cn(
						"rounded-md border px-2 py-0.5 font-medium font-mono text-[11px] tracking-tight",
						badgeStyles,
					)}
				>
					{STATUS_LABEL[status]}
				</code>
			</div>
			<p className="mt-1.5 pl-[18px] text-text-sub-600 text-xs leading-relaxed dark:text-white/55">
				{detail}
			</p>
			{record && (
				<code className="mt-2 ml-[18px] block overflow-x-auto rounded-lg bg-bg-weak-50 p-2 font-mono text-[11px] leading-relaxed dark:bg-black">
					{record}
				</code>
			)}
			{fix && status !== "pass" && (
				<p className="mt-1.5 pl-[18px] text-text-strong-950 text-xs leading-relaxed dark:text-white/80">
					<span className="font-semibold">How to fix:</span> {fix}
				</p>
			)}
		</div>
	);
}

function isPreviewableLogoUrl(url: string | null): url is string {
	if (!url) return false;
	try {
		return new URL(url).protocol === "https:";
	} catch {
		return false;
	}
}

/** "resend.com" -> "Resend": a plausible sender name for the preview. */
function senderName(domain: string): string {
	const label = domain.replace(/^www\./, "").split(".")[0] ?? domain;
	return label.charAt(0).toUpperCase() + label.slice(1);
}

const OTHER_SENDERS = [
	{ name: "Alex Rivera", subject: "Re: Q3 planning", time: "9:12 AM" },
	{ name: "Team Updates", subject: "Weekly digest", time: "Yesterday" },
];

/**
 * A mock inbox showing the logo where it lands: a round sender avatar.
 * Neighbouring rows use plain initials so the difference is obvious.
 */
function InboxPreview({
	logoUrl,
	domain,
	verified,
}: {
	logoUrl: string;
	domain: string;
	verified: boolean;
}) {
	const [failed, setFailed] = useState(false);
	const name = senderName(domain);
	return (
		<div className="overflow-hidden rounded-lg border border-stroke-soft-100 bg-bg-white-0 dark:border-white/10 dark:bg-[#070707]">
			<div className="flex items-center justify-between gap-3 border-stroke-soft-100 border-b px-4 py-2.5 dark:border-white/10">
				<p className="font-semibold text-sm text-text-strong-950 dark:text-white">
					How it looks in the inbox
				</p>
				<span className="text-[11px] text-text-soft-400 dark:text-white/40">
					Preview
				</span>
			</div>
			<ul className="divide-y divide-stroke-soft-100/60 dark:divide-white/5">
				<li className="flex items-center gap-3 bg-bg-weak-50/60 px-4 py-3 dark:bg-white/[0.03]">
					<span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stroke-soft-200 bg-white dark:border-white/10">
						{failed ? (
							<span className="font-semibold text-[13px] text-text-sub-600">
								{name.charAt(0)}
							</span>
						) : (
							<img
								src={logoUrl}
								alt={`${name} logo`}
								className="size-full object-cover"
								referrerPolicy="no-referrer"
								onError={() => setFailed(true)}
							/>
						)}
					</span>
					<div className="min-w-0 flex-1">
						<div className="flex items-center justify-between gap-2">
							<span className="flex min-w-0 items-center gap-1">
								<span className="truncate font-semibold text-[13px] text-text-strong-950 dark:text-white">
									{name}
								</span>
								{verified ? (
									<VerifiedBadge className="size-3.5 shrink-0" />
								) : null}
							</span>
							<span className="shrink-0 font-semibold text-[11px] text-text-strong-950 dark:text-white">
								10:24 AM
							</span>
						</div>
						<p className="truncate text-[12px] text-text-sub-600 dark:text-white/60">
							<span className="font-medium text-text-strong-950 dark:text-white/90">
								Your account update
							</span>{" "}
							· Here's what's new from {name} this week
						</p>
					</div>
				</li>
				{OTHER_SENDERS.map((row) => (
					<li key={row.name} className="flex items-center gap-3 px-4 py-3">
						<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 font-semibold text-[13px] text-text-soft-400 dark:bg-white/[0.06] dark:text-white/40">
							{row.name.charAt(0)}
						</span>
						<div className="min-w-0 flex-1">
							<div className="flex items-center justify-between gap-2">
								<span className="truncate text-[13px] text-text-sub-600 dark:text-white/60">
									{row.name}
								</span>
								<span className="shrink-0 text-[11px] text-text-soft-400 dark:text-white/40">
									{row.time}
								</span>
							</div>
							<p className="truncate text-[12px] text-text-soft-400 dark:text-white/40">
								{row.subject}
							</p>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

function LogoPreview({ url, domain }: { url: string; domain: string }) {
	const [failed, setFailed] = useState(false);

	return (
		<div className="shrink-0 text-center">
			<div className="flex size-14 items-center justify-center overflow-hidden rounded-xl border border-stroke-soft-200 bg-white p-1.5 dark:border-white/10">
				{failed ? (
					<p className="px-1 font-mono text-[9px] text-text-sub-600 leading-snug dark:text-black/55">
						No preview
					</p>
				) : (
					<img
						src={url}
						alt={`BIMI logo for ${domain}`}
						className="size-full object-contain"
						referrerPolicy="no-referrer"
						onError={() => setFailed(true)}
					/>
				)}
			</div>
		</div>
	);
}

function ResultCardDetailed({
	result,
	onReset,
}: {
	result: BimiCheckResponse;
	onReset: () => void;
}) {
	const status = VERDICT_STATUS_CONFIG[result.verdict];
	// Most recommendations repeat a check's own "How to fix"; only list new ones.
	const shownFixes = new Set(
		result.checks.filter((c) => c.status !== "pass").map((c) => c.fix),
	);
	// A passing result's only "recommendation" restates the verdict.
	const extraRecommendations =
		result.verdict === "pass"
			? []
			: result.recommendations.filter((rec) => !shownFixes.has(rec));
	const [copiedLink, setCopiedLink] = useState(false);
	const [copiedJson, setCopiedJson] = useState(false);

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(buildShareUrl(result.domain));
			setCopiedLink(true);
			setTimeout(() => setCopiedLink(false), 2000);
		} catch {
			// Clipboard may be unavailable outside a secure context.
		}
	};

	const handleCopyJson = async () => {
		try {
			await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
			setCopiedJson(true);
			setTimeout(() => setCopiedJson(false), 2000);
		} catch {
			// Clipboard may be unavailable outside a secure context.
		}
	};

	return (
		<div className="space-y-2 text-left text-xs">
			<div className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 dark:border-white/10 dark:bg-white/[0.02]">
				{/* Verdict */}
				<div className="flex items-start gap-3 px-3.5 py-3 sm:px-4">
					{isPreviewableLogoUrl(result.logoUrl) ? (
						<LogoPreview url={result.logoUrl} domain={result.domain} />
					) : null}
					<div className="min-w-0">
						<div className="flex items-center gap-1.5">
							{result.verdict === "pass" ? (
								<VerifiedBadge className="size-[18px] shrink-0" />
							) : (
								<Icon
									name={status.icon}
									className={cn("size-4 shrink-0", status.iconClass)}
								/>
							)}
							<p className="font-semibold text-sm text-text-strong-950 dark:text-white">
								{status.label}
							</p>
						</div>
						<p className="mt-1 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
							{status.hint}
						</p>
						<p className="mt-1 truncate font-mono text-[11px] text-text-soft-400 dark:text-white/40">
							{result.queryName}
						</p>
					</div>
				</div>

				{/* Checks */}
				<div className="p-2 pt-0 sm:p-2.5 sm:pt-0">
					{isPreviewableLogoUrl(result.logoUrl) ? (
						<div className="mb-2">
							<InboxPreview
								logoUrl={result.logoUrl}
								domain={result.domain}
								verified={Boolean(result.authorityUrl)}
							/>
						</div>
					) : null}
					<div className="rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-4 py-3 dark:border-white/10 dark:bg-[#070707]">
						<p className="font-semibold text-sm text-text-strong-950 dark:text-white">
							What we checked
						</p>
						<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed dark:text-white/50">
							Inboxes only show your logo when every check below passes.
						</p>
						<div className="mt-2 divide-y divide-stroke-soft-100/50 border-stroke-soft-100/50 border-t dark:divide-white/5 dark:border-white/5">
							{result.checks.map((check) => (
								<CheckItem
									key={check.id}
									label={check.label}
									status={check.status}
									detail={check.detail}
									record={check.record}
									fix={check.fix}
								/>
							))}
						</div>
					</div>
					{extraRecommendations.length > 0 && (
						<div className="mt-2 rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-4 py-3 dark:border-white/10 dark:bg-[#070707]">
							<p className="font-semibold text-sm text-text-strong-950 dark:text-white">
								What to fix next
							</p>
							<ul className="mt-1.5 list-disc space-y-1 pl-4 text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
								{extraRecommendations.map((rec) => (
									<li key={rec}>{rec}</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</div>

			{/* Actions Footer */}
			<div className="-mx-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
				<div className="flex items-center gap-1.5">
					<button
						type="button"
						onClick={handleCopyLink}
						className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 font-medium text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<Icon name={copiedLink ? "check" : "link"} className="size-3.5" />
						{copiedLink ? "Link copied" : "Copy link"}
					</button>
					<button
						type="button"
						onClick={handleCopyJson}
						className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 font-medium text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<Icon name={copiedJson ? "check" : "copy"} className="size-3.5" />
						{copiedJson ? "Copied" : "Copy JSON"}
					</button>
				</div>
				<button
					type="button"
					onClick={onReset}
					className="cursor-pointer rounded-lg px-2 py-1.5 font-medium text-primary-base text-xs hover:underline"
				>
					Clear result
				</button>
			</div>
		</div>
	);
}

export function CheckerPanel() {
	const [value, setValue] = useState("");
	const [isPending, setIsPending] = useState(false);
	const [result, setResult] = useState<BimiCheckResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const field = useFieldError();
	const shouldReduceMotion = useReducedMotion();
	const hasFieldError = field.hasError;
	const abortRef = useRef<AbortController | null>(null);

	const showFieldError = (message: string) => {
		setResult(null);
		setError(null);
		field.show(message);
	};

	const run = async (raw: string) => {
		const validity = validateCheckerInput(raw);
		if (!validity.ok) {
			showFieldError(FIELD_ERROR_MESSAGE);
			return;
		}

		field.clear();
		const domain = normalizeDomainInput(raw);

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setIsPending(true);
		setError(null);

		try {
			const response = await runBimiCheck(domain, controller.signal);
			if (controller.signal.aborted) return;
			setResult(response);
			syncDomainParam(response.domain);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setResult(null);
			setError(
				err instanceof Error
					? err.message
					: "Something went wrong running that check.",
			);
		} finally {
			if (!controller.signal.aborted) setIsPending(false);
		}
	};

	const hasChecked = Boolean(result || error);

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (hasChecked) return;
		void run(value);
	};

	const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
		if (isPending) return;
		const pasted = e.clipboardData.getData("text").trim();
		if (!pasted) return;

		const validity = validateCheckerInput(pasted);
		if (validity.ok) {
			e.preventDefault();
			setValue(normalizeDomainInput(pasted));
			if (hasFieldError) field.clear();
			setResult(null);
			setError(null);
			void run(pasted);
		}
	};

	const handleReset = () => {
		abortRef.current?.abort();
		setResult(null);
		setError(null);
		field.clear();
		setValue("");
		syncDomainParam(null);
		setTimeout(() => field.inputRef.current?.focus(), 50);
	};

	useEffect(
		() => () => {
			abortRef.current?.abort();
		},
		[],
	);

	// Deep-link support: /tools/bimi-checker?domain=paypal.com
	// auto-fills and runs once so results are shareable. The timeout defers
	// past StrictMode's remount simulation (whose cleanup would otherwise
	// abort the only run); the cleanup clears the first timer so the check
	// still runs exactly once.
	// biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
	useEffect(() => {
		const initial = getDomainParam();
		if (!initial) return;
		setValue(normalizeDomainInput(initial));
		const t = setTimeout(() => {
			void run(initial);
		}, 0);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="mx-auto w-full max-w-2xl text-left font-sans">
			{/* Input Check Zone */}
			<form onSubmit={onSubmit} noValidate className="space-y-2.5">
				<div className="mx-auto w-full max-w-xl">
					<FieldError field={field} messageClassName="text-xs leading-relaxed">
						<div className="relative w-full">
							<Input.Root
								size="medium"
								hasError={hasFieldError}
								className={cn(
									"relative z-10 w-full rounded-xl bg-bg-white-0 transition-shadow sm:rounded-2xl dark:bg-[#0c0c0c]",
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
										value={value}
										onPaste={handlePaste}
										onChange={(e) => {
											setValue(e.target.value);
											if (hasFieldError) field.clear();
											if (result) setResult(null);
											if (error) setError(null);
										}}
										placeholder="example.com"
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
											aria-label="Check BIMI record"
										>
											{isPending ? (
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
						<div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 text-text-sub-600 text-xs dark:text-white/60">
							<Icon
								name="alert-triangle"
								className="mt-0.5 size-4 shrink-0 text-rose-500"
							/>
							<p className="text-rose-600 leading-relaxed dark:text-rose-400">
								{error}
							</p>
						</div>
					) : result ? (
						<ResultCardDetailed result={result} onReset={handleReset} />
					) : null}
				</MorphSlot>
			</form>
		</div>
	);
}
