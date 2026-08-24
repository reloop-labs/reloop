"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon, type IconName } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
	type FormEvent,
	type ReactNode,
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { CheckRequestError, runCheck } from "./check-api";
import "./checker-field.css";
import {
	type CheckResult,
	type CheckVerdict,
	type SignalStatus,
	toCheckResult,
} from "./presenter";
import { FIELD_ERROR_MESSAGE, validateCheckerInput } from "./syntax";
import { saveTestedEmail } from "./tested-emails-store";

function readShakeMs(): number {
	if (typeof window === "undefined") return 280;
	const cs = getComputedStyle(document.documentElement);
	const ms = (name: string, fallback: number) => {
		const v = Number.parseFloat(cs.getPropertyValue(name));
		return Number.isFinite(v) ? v : fallback;
	};
	return ms("--shake-dur-a", 80) * 2 + ms("--shake-dur-b", 60) * 2;
}

const SPRING_TRANSITION = {
	type: "spring" as const,
	bounce: 0,
	duration: 0.36,
};

const HEIGHT_MORPH = {
	duration: 0.28,
	ease: [0.22, 1, 0.36, 1] as const,
};

const CROSSFADE = {
	duration: 0.22,
	ease: [0.22, 1, 0.36, 1] as const,
};

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

	useLayoutEffect(() => {
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

function HowItWorksSteps() {
	return (
		<div className="space-y-3 px-4 pt-3.5 pb-2.5 text-xs sm:px-5 sm:pt-4 sm:pb-3">
			<div className="pb-0.5">
				<p className="font-mono font-semibold text-[11px] text-text-strong-950 uppercase tracking-wider dark:text-white">
					How It Works
				</p>
			</div>

			<div className="relative pt-0.5 pl-0.5">
				<div className="relative flex items-center gap-3.5 pb-4">
					<div className="absolute top-5 left-[12px] h-full w-px bg-stroke-soft-200 dark:bg-white/10" />
					<div className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 font-mono font-semibold text-[11px] text-text-strong-950 dark:border-white/12 dark:bg-[#111] dark:text-white">
						1
					</div>
					<div className="flex flex-1 items-center justify-between">
						<span className="font-medium text-text-strong-950 text-xs dark:text-white">
							Enter email
						</span>
						<code className="rounded-md border border-stroke-soft-200 bg-bg-white-0 px-2 py-0.5 font-mono text-[11px] text-text-sub-600 dark:border-white/10 dark:bg-[#0b0b0b] dark:text-white/70">
							Email
						</code>
					</div>
				</div>

				<div className="relative flex items-center gap-3.5 pb-4">
					<div className="absolute top-5 left-[12px] h-full w-px bg-stroke-soft-200 dark:bg-white/10" />
					<div className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 font-mono font-semibold text-[11px] text-text-strong-950 dark:border-white/12 dark:bg-[#111] dark:text-white">
						2
					</div>
					<div className="flex flex-1 items-center justify-between">
						<span className="font-medium text-text-strong-950 text-xs dark:text-white">
							Analyze domain
						</span>
						<code className="rounded-md border border-stroke-soft-200 bg-bg-white-0 px-2 py-0.5 font-mono text-[11px] text-text-sub-600 dark:border-white/10 dark:bg-[#0b0b0b] dark:text-white/70">
							Signals
						</code>
					</div>
				</div>

				<div className="relative flex items-center gap-3.5">
					<div className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 font-mono font-semibold text-[11px] text-text-strong-950 dark:border-white/12 dark:bg-[#111] dark:text-white">
						3
					</div>
					<div className="flex flex-1 items-center justify-between">
						<span className="font-medium text-text-strong-950 text-xs dark:text-white">
							Get result
						</span>
						<code className="rounded-md border border-stroke-soft-200 bg-bg-white-0 px-2 py-0.5 font-mono text-[11px] text-text-sub-600 dark:border-white/10 dark:bg-[#0b0b0b] dark:text-white/70">
							Risk Result
						</code>
					</div>
				</div>
			</div>
		</div>
	);
}

const VERDICT_THEME: Record<
	CheckVerdict,
	{
		title: string;
		subtitle: string;
		confidence: string;
		icon: IconName;
		dotColor: string;
		titleClass: string;
		badgeBg: string;
		badgeBorder: string;
		recommendation: string;
		recommendationIcon: string;
		whyResult: string;
	}
> = {
	disposable: {
		title: "TEMPORARY EMAIL",
		subtitle: "Disposable email",
		confidence: "98% confidence",
		icon: "shield-cross",
		dotColor: "bg-rose-500",
		titleClass: "text-rose-500 dark:text-rose-400",
		badgeBg: "bg-rose-500/[0.04] dark:bg-rose-500/[0.08]",
		badgeBorder: "border-rose-500/20 dark:border-rose-500/30",
		recommendation: "Treat this address as disposable when verifying identity.",
		recommendationIcon: "alert-triangle",
		whyResult:
			"We found multiple signals associated with temporary email services. The strongest signal is the domain classification matching known throwaway mailboxes.",
	},
	risky: {
		title: "RISKY",
		subtitle: "Role-based or shared mailbox",
		confidence: "Medium Confidence",
		icon: "alert-triangle",
		dotColor: "bg-amber-500",
		titleClass: "text-amber-500 dark:text-amber-400",
		badgeBg: "bg-amber-500/[0.04] dark:bg-amber-500/[0.08]",
		badgeBorder: "border-amber-500/20 dark:border-amber-500/30",
		recommendation:
			"Accept with caution. Verify individual recipient identity if access control requires single-user ownership.",
		recommendationIcon: "shield-alert",
		whyResult:
			"This mailbox uses a shared or role-based prefix (such as admin@, support@, or billing@). Multiple users may access this inbox, making deliverability and accountability unpredictable.",
	},
	deliverable: {
		title: "SAFE",
		subtitle: "Standard mailbox with valid records",
		confidence: "High Confidence",
		icon: "check-circle",
		dotColor: "bg-emerald-500",
		titleClass: "text-emerald-600 dark:text-emerald-400",
		badgeBg: "bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08]",
		badgeBorder: "border-emerald-500/20 dark:border-emerald-500/30",
		recommendation:
			"Safe to accept and send. Domain has valid MX records and no flags for disposable providers.",
		recommendationIcon: "check-circle",
		whyResult:
			"The domain possesses legitimate mail exchanger (MX) infrastructure with no history of temporary mailbox provisioning. Deliverability indicators are standard.",
	},
	invalid: {
		title: "INVALID",
		subtitle: "Malformed address or hostname",
		confidence: "Syntax Error",
		icon: "cross-circle",
		dotColor: "bg-neutral-400",
		titleClass: "text-neutral-500 dark:text-white/60",
		badgeBg: "bg-neutral-500/[0.04] dark:bg-white/[0.04]",
		badgeBorder: "border-neutral-500/20 dark:border-white/15",
		recommendation:
			"Prompt user to correct syntax errors before accepting submission.",
		recommendationIcon: "cross-circle",
		whyResult:
			"Input failed basic RFC 5322 syntax validation. The format does not represent a deliverable email address or hostname.",
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
					: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 dark:border-white/10 dark:bg-[#0b0b0b] dark:text-white/70";

	return (
		<div className="flex items-center justify-between py-2.5">
			<div className="flex items-center gap-2.5">
				<span className={cn("size-2 rounded-full", dotColor)} />
				<span className="font-medium text-text-strong-950 text-xs dark:text-white">
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
}: {
	result: CheckResult;
	onReset: () => void;
}) {
	const theme = VERDICT_THEME[result.verdict];
	const [showEvidence, setShowEvidence] = useState(false);

	const isDisposable = result.verdict === "disposable";
	const isRole = result.verdict === "risky";
	const isValidSyntax = result.verdict !== "invalid";

	return (
		<div className="space-y-3.5 text-xs">
			{/* Verdict Hero Card */}
			<div
				className={cn(
					"rounded-xl border p-4 transition-colors sm:p-4.5",
					theme.badgeBg,
					theme.badgeBorder,
				)}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className={cn("size-2 rounded-full", theme.dotColor)} />
						<span
							className={cn(
								"font-bold font-mono text-[13px] uppercase tracking-wider",
								theme.titleClass,
							)}
						>
							{theme.title}
						</span>
						<span className="text-text-sub-600 dark:text-white/40">·</span>
						<span className="font-medium text-text-strong-950 text-xs dark:text-white">
							{theme.subtitle}
						</span>
					</div>
					<span className="font-mono text-[11px] text-text-soft-400 dark:text-white/40">
						{theme.confidence}
					</span>
				</div>
			</div>
			{/* Signals */}
			<div className="overflow-hidden rounded-[14px] border border-stroke-soft-200 bg-bg-weak-50 p-0.5 dark:border-white/10 dark:bg-white/[0.03]">
				<div className="px-3 pt-2 pb-2.5">
					<p className="font-mono font-semibold text-[11px] text-text-strong-950 uppercase tracking-wider dark:text-white">
						Signals & Detection
					</p>
				</div>

				<div className="divide-y divide-stroke-soft-200/50 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-1 dark:divide-white/5 dark:border-white/10 dark:bg-[#070707]">
					<SignalItem
						label="Disposable provider"
						value={isDisposable ? "Detected" : "Clean"}
						status={isDisposable ? "fail" : "pass"}
					/>
					<SignalItem
						label="Domain reputation"
						value={isDisposable ? "Suspicious" : "Valid"}
						status={isDisposable ? "warn" : "pass"}
					/>
					<SignalItem
						label="Mailbox pattern"
						value={
							isDisposable
								? "Random / Burner"
								: isRole
									? "Shared Role"
									: "Standard"
						}
						status={isDisposable ? "warn" : isRole ? "warn" : "pass"}
					/>
					<SignalItem
						label="Email syntax"
						value={isValidSyntax ? "Valid" : "Malformed"}
						status={isValidSyntax ? "pass" : "fail"}
					/>
				</div>
			</div>

			{/* Recommendation */}
			<div className="flex items-start gap-3 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3.5 sm:p-4 dark:border-white/10 dark:bg-white/[0.02]">
				<Icon
					name={isDisposable || isRole ? "alert-triangle" : "check-circle"}
					className={cn(
						"mt-0.5 size-4 shrink-0",
						isDisposable || isRole ? "text-amber-500" : "text-emerald-500",
					)}
				/>
				<div className="space-y-0.5">
					<p className="font-medium text-text-strong-950 text-xs dark:text-white">
						Recommendation
					</p>
					<p className="text-text-sub-600 text-xs leading-relaxed dark:text-white/60">
						{theme.recommendation}
					</p>
				</div>
			</div>

			{/* Actions Footer */}
			<div className="flex items-center justify-between pt-0.5">
				<button
					type="button"
					onClick={() => setShowEvidence((prev) => !prev)}
					className="cursor-pointer font-mono text-[11px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
				>
					{showEvidence ? "Hide Raw Data" : "View Raw Data"}
				</button>
				<button
					type="button"
					onClick={onReset}
					className="cursor-pointer font-medium text-primary-base text-xs hover:underline"
				>
					Clear result
				</button>
			</div>

			<AnimatePresence>
				{showEvidence && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={SPRING_TRANSITION}
						className="overflow-hidden"
					>
						<div className="rounded-xl border border-stroke-soft-200 bg-neutral-950 p-3 font-mono text-[11px] text-emerald-400 dark:border-white/10">
							<pre className="overflow-x-auto whitespace-pre-wrap">
								{JSON.stringify(
									{
										input: result.input,
										domain: result.domain,
										verdict: result.verdict,
										signals: result.signals.map((s) => ({
											id: s.id,
											label: s.label,
											status: s.status,
											detail: s.detail,
										})),
									},
									null,
									2,
								)}
							</pre>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export function CheckerPanel() {
	const [value, setValue] = useState("");
	const [isPending, setIsPending] = useState(false);
	const [result, setResult] = useState<CheckResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [fieldError, setFieldError] = useState<string | null>(null);
	const [fieldErrorCopy, setFieldErrorCopy] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const fieldRef = useRef<HTMLDivElement>(null);
	const shakeTimerRef = useRef<number | null>(null);
	const fieldErrorId = useId();
	const shouldReduceMotion = useReducedMotion();
	const hasFieldError = fieldError !== null;

	useEffect(() => {
		return () => {
			if (shakeTimerRef.current !== null) {
				window.clearTimeout(shakeTimerRef.current);
			}
		};
	}, []);

	const clearFieldError = () => {
		setFieldError(null);
		const field = fieldRef.current;
		if (field) field.classList.remove("is-shaking");
	};

	const showFieldError = (message: string) => {
		setFieldError(message);
		setFieldErrorCopy(message);
		setResult(null);
		setError(null);
		inputRef.current?.focus();

		const field = fieldRef.current;
		if (!field || shouldReduceMotion) return;

		field.classList.remove("is-shaking");
		void field.offsetWidth;
		field.classList.add("is-shaking");

		if (shakeTimerRef.current !== null) {
			window.clearTimeout(shakeTimerRef.current);
		}
		shakeTimerRef.current = window.setTimeout(() => {
			field.classList.remove("is-shaking");
			shakeTimerRef.current = null;
		}, readShakeMs() + 20);
	};

	const run = async (raw: string) => {
		const validity = validateCheckerInput(raw);
		if (!validity.ok) {
			showFieldError(FIELD_ERROR_MESSAGE);
			return;
		}

		clearFieldError();
		const query = raw.trim();

		setIsPending(true);
		setError(null);

		try {
			const response = await runCheck(query);
			const checkRes = toCheckResult(response);
			setResult(checkRes);
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

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		void run(value);
	};

	const handleReset = () => {
		setResult(null);
		setError(null);
		clearFieldError();
		setValue("");
		setTimeout(() => inputRef.current?.focus(), 50);
	};

	return (
		<div className="mx-auto w-full max-w-xl font-sans">
			{/* Dashboard Modal / Card Container */}
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-weak-50 p-0.5 dark:border-white/10 dark:bg-white/[0.03]">
				{/* Top White Card: Input + Results with dynamic height morphing */}
				<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 sm:p-6 dark:border-white/10 dark:bg-[#0c0c0c]">
					{/* Input Check Zone */}
					<form onSubmit={onSubmit} noValidate className="space-y-4">
						<div className="space-y-2">
							<Label.Root
								htmlFor="checker-input"
								className="font-medium text-text-strong-950 text-xs dark:text-white"
							>
								Email or domain
								<Label.Asterisk />
							</Label.Root>

							<div className={cn("t-input-wrap", hasFieldError && "is-error")}>
								<div
									ref={fieldRef}
									className={cn("t-input w-full", hasFieldError && "is-error")}
								>
									<Input.Root
										size="medium"
										hasError={hasFieldError}
										className={cn(
											"!shadow-none w-full rounded-xl",
											hasFieldError
												? "has-[input:focus]:!shadow-button-error-focus has-[input:focus]:before:!ring-error-base"
												: "has-[input:focus]:before:!ring-primary-base has-[input:focus]:!shadow-button-primary-focus",
										)}
									>
										<Input.Wrapper className="h-11 pr-1.5 pl-3.5 dark:bg-[#0c0c0c]">
											<Input.Icon>
												<Icon name="mail-single" className="size-4" />
											</Input.Icon>
											<Input.Input
												id="checker-input"
												ref={inputRef}
												type="text"
												inputMode="email"
												autoComplete="off"
												autoCapitalize="none"
												spellCheck={false}
												value={value}
												aria-invalid={hasFieldError}
												aria-describedby={
													hasFieldError ? fieldErrorId : undefined
												}
												onChange={(e) => {
													setValue(e.target.value);
													if (fieldError) clearFieldError();
												}}
												placeholder="you@example.com or domain.com"
												className="font-medium text-[14.5px]"
											/>
											{value ? (
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														setValue("");
														setResult(null);
														setError(null);
														clearFieldError();
														inputRef.current?.focus();
													}}
													className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white"
													aria-label="Clear input"
												>
													<Icon name="close" className="size-3.5" />
												</button>
											) : null}
											<FancyButton.Root
												type="submit"
												variant="primary"
												size="xsmall"
												className="!p-0 flex size-7.5 shrink-0 cursor-pointer items-center justify-center rounded-lg"
												aria-label="Verify email or domain"
											>
												{isPending ? (
													<span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
												) : (
													<FancyButton.Icon className="mx-0 size-3.5">
														<Icon name="arrow-right" className="size-3.5" />
													</FancyButton.Icon>
												)}
											</FancyButton.Root>
										</Input.Wrapper>
									</Input.Root>
								</div>
								<p
									id={fieldErrorId}
									role="alert"
									className="t-error-msg text-error-base text-xs leading-relaxed"
								>
									{fieldErrorCopy}
								</p>
							</div>
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

				<MorphSlot
					activeKey={result || error ? null : "idle"}
					reduceMotion={shouldReduceMotion}
				>
					<HowItWorksSteps />
				</MorphSlot>
			</div>
		</div>
	);
}
