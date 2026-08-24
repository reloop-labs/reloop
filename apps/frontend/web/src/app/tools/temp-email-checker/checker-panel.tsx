"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon, type IconName } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
	type FormEvent,
	useEffect,
	useLayoutEffect,
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
import { saveTestedEmail } from "./tested-emails-store";

const SPRING_TRANSITION = {
	type: "spring" as const,
	bounce: 0,
	duration: 0.36,
};

const resultContainerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.05,
			delayChildren: 0.02,
		},
	},
	exit: {
		opacity: 0,
		scale: 0.98,
		transition: { duration: 0.15 },
	},
};

const resultItemVariants = {
	hidden: { opacity: 0, y: 7, scale: 0.99 },
	show: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { type: "spring" as const, bounce: 0, duration: 0.32 },
	},
};

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
		title: "TEMPORARY",
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

				<p className="mt-2 text-text-sub-600 text-xs leading-relaxed dark:text-white/70">
					{result.summary}
				</p>
			</div>
			{/* Signals */}
			<div className="overflow-hidden rounded-[14px] border border-stroke-soft-200 bg-bg-weak-50 p-0.5 dark:border-white/10 dark:bg-white/[0.03]">
				<div className="flex items-center justify-between px-3 pt-2 pb-2.5">
					<p className="font-mono font-semibold text-[11px] text-text-strong-950 uppercase tracking-wider dark:text-white">
						Signals & Detection
					</p>
					<span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
						<span className="size-1.5 rounded-full bg-emerald-500" />
						Live Scanner
					</span>
				</div>

				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-1 divide-y divide-stroke-soft-200/50 dark:border-white/10 dark:bg-[#070707] dark:divide-white/5">
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
					className="cursor-pointer font-medium text-xs text-primary-base hover:underline"
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
	const inputRef = useRef<HTMLInputElement>(null);
	const shouldReduceMotion = useReducedMotion();

	const dynamicAreaRef = useRef<HTMLDivElement>(null);
	const [dynamicHeight, setDynamicHeight] = useState<number | "auto">("auto");

	// Measure content height whenever active state changes (matching navbar mega-menu morph)
	useLayoutEffect(() => {
		if (!dynamicAreaRef.current) return;
		const el = dynamicAreaRef.current;

		const updateHeight = () => {
			if (el) {
				const rect = el.getBoundingClientRect();
				setDynamicHeight(Math.ceil(rect.height));
			}
		};

		updateHeight();

		const ro = new ResizeObserver(() => {
			updateHeight();
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, [result, error]);

	const run = async (raw: string) => {
		const query = raw.trim();
		if (!query) {
			inputRef.current?.focus();
			setResult(null);
			setError(null);
			return;
		}

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
		setValue("");
		setTimeout(() => inputRef.current?.focus(), 50);
	};

	return (
		<div className="mx-auto w-full max-w-2xl font-sans">
			{/* Dashboard Modal / Card Container */}
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-weak-50 p-0.5 dark:border-white/10 dark:bg-white/[0.03]">
				{/* Top White Card: Input + Results with dynamic height morphing */}
				<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 sm:p-6 dark:border-white/10 dark:bg-[#0c0c0c]">
					{/* Input Check Zone */}
					<form onSubmit={onSubmit} noValidate className="space-y-4">
						<div className="space-y-2">
							<Label.Root
								htmlFor="checker-input"
								className="font-medium text-xs text-text-strong-950 dark:text-white"
							>
								Email or domain
								<Label.Asterisk />
							</Label.Root>

							<Input.Root
								size="medium"
								className="!shadow-none has-[input:focus]:!shadow-button-primary-focus has-[input:focus]:before:!ring-primary-base w-full rounded-xl"
							>
								<Input.Wrapper className="h-11 pl-3.5 pr-1.5 dark:bg-[#0c0c0c]">
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
										onChange={(e) => setValue(e.target.value)}
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

						{/* Result / Error Zone inside the white card */}
						<motion.div
							initial={false}
							animate={{
								height:
									shouldReduceMotion || dynamicHeight === "auto"
										? "auto"
										: dynamicHeight,
							}}
							transition={
								shouldReduceMotion
									? { duration: 0 }
									: SPRING_TRANSITION
							}
							style={{ overflow: "hidden" }}
						>
							<div ref={dynamicAreaRef} className="pt-0.5">
								<AnimatePresence mode="wait" initial={false}>
									{error ? (
										<motion.div
											key="error"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.2 }}
											className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 text-xs text-text-sub-600 dark:text-white/60"
										>
											<Icon
												name="alert-triangle"
												className="mt-0.5 size-4 shrink-0 text-rose-500"
											/>
											<p className="leading-relaxed text-rose-600 dark:text-rose-400">
												{error}
											</p>
										</motion.div>
									) : result ? (
										<motion.div
											key="result"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.22, ease: "easeOut" }}
										>
											<ResultCardDetailed result={result} onReset={handleReset} />
										</motion.div>
									) : null}
								</AnimatePresence>
							</div>
						</motion.div>
					</form>
				</div>

				{/* How It Works on the Outer Soft Container */}
				<AnimatePresence>
					{!result && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={SPRING_TRANSITION}
							className="overflow-hidden"
						>
							<div className="space-y-3 px-4 pt-3.5 pb-2.5 sm:px-5 sm:pt-4 sm:pb-3 text-xs">
								<div className="flex items-center justify-between pb-0.5">
									<p className="font-mono font-semibold text-[11px] text-text-strong-950 uppercase tracking-wider dark:text-white">
										How It Works
									</p>
									<span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
										<span className="size-1.5 rounded-full bg-emerald-500" />
										Live Scanner
									</span>
								</div>

								<div className="relative pt-0.5 pl-0.5">
									{/* Step 1 */}
									<div className="relative flex items-center gap-3.5 pb-4">
										{/* Vertical connecting line */}
										<div className="absolute top-5 left-[12px] h-full w-px bg-stroke-soft-200 dark:bg-white/10" />
										{/* Number node */}
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

									{/* Step 2 */}
									<div className="relative flex items-center gap-3.5 pb-4">
										{/* Vertical connecting line */}
										<div className="absolute top-5 left-[12px] h-full w-px bg-stroke-soft-200 dark:bg-white/10" />
										{/* Number node */}
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

									{/* Step 3 */}
									<div className="relative flex items-center gap-3.5">
										{/* Number node */}
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
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
