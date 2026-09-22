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
import { CheckRequestError, runCheck } from "./check-api";
import {
	type CheckResult,
	type CheckVerdict,
	type SignalStatus,
	toCheckResult,
} from "./presenter";
import { FIELD_ERROR_MESSAGE, validateCheckerInput } from "./syntax";
import { saveTestedEmail } from "./tested-emails-store";

const HEIGHT_MORPH = {
	duration: 0.28,
	ease: [0.22, 1, 0.36, 1] as const,
};

const CROSSFADE = {
	duration: 0.22,
	ease: [0.22, 1, 0.36, 1] as const,
};

function getEmailParam(): string | null {
	if (typeof window === "undefined") return null;
	try {
		const param = new URLSearchParams(window.location.search).get("email");
		return param && param.trim().length > 0 ? param.trim().slice(0, 320) : null;
	} catch {
		return null;
	}
}

function syncEmailParam(value: string | null) {
	if (typeof window === "undefined") return;
	try {
		const url = new URL(window.location.href);
		if (value && value.trim().length > 0) {
			url.searchParams.set("email", value.trim());
		} else {
			url.searchParams.delete("email");
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
			: "/tools/temp-email-checker";
	return `${base}?email=${encodeURIComponent(input)}`;
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
	CheckVerdict,
	{
		label: string;
		icon: IconName;
		iconClass: string;
	}
> = {
	deliverable: {
		label: "Valid email",
		icon: "check-circle",
		iconClass: "text-emerald-500",
	},
	disposable: {
		label: "Disposable email",
		icon: "alert-triangle",
		iconClass: "text-rose-500",
	},
	risky: {
		label: "Risky email",
		icon: "shield-alert",
		iconClass: "text-amber-500",
	},
	invalid: {
		label: "Invalid email",
		icon: "cross-circle",
		iconClass: "text-rose-500 dark:text-rose-400",
	},
};

function SignalItem({
	label,
	value,
	status,
}: {
	label: string;
	value: string;
	status: SignalStatus;
}) {
	const dotColor =
		status === "fail"
			? "bg-rose-500"
			: status === "warn"
				? "bg-amber-500"
				: status === "pass"
					? "bg-emerald-500"
					: "bg-neutral-400";

	const badgeStyles =
		status === "fail"
			? "border-rose-500/20 bg-rose-500/[0.08] text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400"
			: status === "warn"
				? "border-amber-500/20 bg-amber-500/[0.08] text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400"
				: status === "pass"
					? "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400"
					: "border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 dark:border-white/10 dark:bg-[#0b0b0b] dark:text-white/70";

	return (
		<div className="flex items-center justify-between py-2.5">
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
				{value}
			</code>
		</div>
	);
}

function ResultCardDetailed({
	result,
	onReset,
	shouldReduceMotion,
}: {
	result: CheckResult;
	onReset: () => void;
	shouldReduceMotion?: boolean | null;
}) {
	const status = VERDICT_STATUS_CONFIG[result.verdict];
	const [showDetails, setShowDetails] = useState(false);
	const [copiedLink, setCopiedLink] = useState(false);
	const [copiedJson, setCopiedJson] = useState(false);

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(buildShareUrl(result.input));
			setCopiedLink(true);
			setTimeout(() => setCopiedLink(false), 2000);
		} catch {
			// Clipboard may be unavailable outside a secure context.
		}
	};

	const handleCopyJson = async () => {
		try {
			await navigator.clipboard.writeText(
				JSON.stringify(result.rawJson, null, 2),
			);
			setCopiedJson(true);
			setTimeout(() => setCopiedJson(false), 2000);
		} catch {
			// Clipboard may be unavailable outside a secure context.
		}
	};

	return (
		<div className="space-y-2 text-left text-xs">
			{/* Unified Status Card */}
			<div className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 dark:border-white/10 dark:bg-white/[0.02]">
				<div className="flex items-center justify-between gap-3 px-3.5 py-2 pr-2.5! sm:px-4 sm:py-2.5">
					<div className="flex min-w-0 items-center gap-2">
						<Icon
							name={status.icon}
							className={cn("size-4 shrink-0", status.iconClass)}
						/>
						<p className="font-semibold text-sm text-text-strong-950 dark:text-white">
							{status.label}
						</p>
						<span className="text-text-soft-400 dark:text-white/30">•</span>
						<span className="font-normal text-text-sub-600 text-xs dark:text-white/50">
							{result.confidenceLabel}
						</span>
					</div>

					<button
						type="button"
						onClick={() => setShowDetails((prev) => !prev)}
						aria-expanded={showDetails}
						aria-controls="signals-detection-panel"
						className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1 font-medium text-text-sub-600 text-xs shadow-2xs transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<span>Details</span>
						<Icon
							name="chevron-down"
							className={cn(
								"size-3 transition-transform duration-200",
								showDetails && "rotate-180",
							)}
						/>
					</button>
				</div>

				{/* Signals & Detection (Expandable inside the card) */}
				<AnimatePresence initial={false}>
					{showDetails && (
						<motion.div
							id="signals-detection-panel"
							key="signals-details"
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
							<div className="p-2 pt-0! sm:p-2.5">
								<div className="divide-y divide-stroke-soft-100/50 rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-4 py-1 dark:divide-white/5 dark:border-white/10 dark:bg-[#070707]">
									{result.displaySignals.map((item) => (
										<SignalItem
											key={item.label}
											label={item.label}
											value={item.value}
											status={item.status}
										/>
									))}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Actions Footer */}
			<div className="flex flex-wrap items-center justify-between gap-2 pr-4">
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
					className="cursor-pointer font-medium text-primary-base text-xs hover:underline"
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
	const [result, setResult] = useState<CheckResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const field = useFieldError();
	const shouldReduceMotion = useReducedMotion();
	const hasFieldError = field.hasError;
	const autoRanRef = useRef(false);

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
		const query = raw.trim();

		setIsPending(true);
		setError(null);

		try {
			const response = await runCheck(query);
			const checkRes = toCheckResult(response);
			setResult(checkRes);
			syncEmailParam(response.input);
			saveTestedEmail({
				email: response.input,
				domain: response.domain || query,
				verdict: response.verdict,
				isDisposable: response.isDisposable,
				isAllowlisted: response.isAllowlisted,
				isRole: response.isRoleAddress,
				summary: checkRes.summary,
			});
		} catch (err) {
			setResult(null);
			setError(
				err instanceof CheckRequestError
					? err.message
					: "Something went wrong running that check.",
			);
		} finally {
			setIsPending(false);
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
			setValue(pasted);
			if (hasFieldError) field.clear();
			setResult(null);
			setError(null);
			void run(pasted);
		}
	};

	const handleReset = () => {
		setResult(null);
		setError(null);
		field.clear();
		setValue("");
		syncEmailParam(null);
		setTimeout(() => field.inputRef.current?.focus(), 50);
	};

	// Deep-link support: /tools/temp-email-checker?email=foo@bar.com
	// auto-fills and runs once so results are shareable.
	// biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
	useEffect(() => {
		if (autoRanRef.current) return;
		autoRanRef.current = true;
		const initial = getEmailParam();
		if (initial) {
			setValue(initial);
			void run(initial);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="mx-auto w-full max-w-xl text-left font-sans">
			{/* Input Check Zone */}
			<form onSubmit={onSubmit} noValidate className="space-y-2.5">
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
									aria-label="Email or domain"
									{...field.controlProps}
									type="text"
									inputMode="email"
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
									placeholder="you@example.com or domain.com"
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
										aria-label="Verify email or domain"
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
						<ResultCardDetailed
							result={result}
							onReset={handleReset}
							shouldReduceMotion={shouldReduceMotion}
						/>
					) : null}
				</MorphSlot>
			</form>
		</div>
	);
}
