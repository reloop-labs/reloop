"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon, type IconName } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { AnimatePresence, motion } from "framer-motion";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { CheckRequestError, runCheck } from "./check-api";
import {
	type CheckResult,
	type CheckVerdict,
	type SignalStatus,
	toCheckResult,
} from "./presenter";
import { saveTestedEmail } from "./tested-emails-store";

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
		title: "NEEDS A LOOK",
		subtitle: "Shared role mailbox",
		confidence: "85% confidence",
		icon: "alert-triangle",
		dotColor: "bg-amber-500",
		titleClass: "text-amber-500 dark:text-amber-400",
		badgeBg: "bg-amber-500/[0.04] dark:bg-amber-500/[0.08]",
		badgeBorder: "border-amber-500/20 dark:border-amber-500/30",
		recommendation:
			"Address is a shared team inbox. Expect lower engagement on marketing campaigns.",
		recommendationIcon: "alert-triangle",
		whyResult:
			"The domain appears valid and persistent, but the mailbox prefix (e.g. info, support, billing) indicates a shared role rather than an individual person.",
	},
	deliverable: {
		title: "DELIVERABLE",
		subtitle: "Clean mailbox provider",
		confidence: "99% confidence",
		icon: "shield-check",
		dotColor: "bg-emerald-500",
		titleClass: "text-emerald-500 dark:text-emerald-400",
		badgeBg: "bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08]",
		badgeBorder: "border-emerald-500/20 dark:border-emerald-500/30",
		recommendation:
			"Safe to accept for user signups, transactional emails, and identity verification.",
		recommendationIcon: "check-circle",
		whyResult:
			"The domain is not listed on known disposable catalogues and shows healthy persistent mailbox infrastructure with valid RFC syntax.",
	},
	invalid: {
		title: "INVALID",
		subtitle: "Malformed address",
		confidence: "100% confidence",
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

	const valueClass =
		status === "fail"
			? "text-rose-500 dark:text-rose-400 font-medium"
			: status === "warn"
				? "text-amber-500 dark:text-amber-400 font-medium"
				: status === "pass"
					? "text-emerald-600 dark:text-emerald-400 font-medium"
					: "text-text-sub-600 dark:text-white/50";

	return (
		<div className="flex items-center justify-between py-2 text-[14px]">
			<div className="flex items-center gap-3">
				<span className={cn("size-2 rounded-full", dotColor)} />
				<span className="text-text-strong-950 dark:text-white/90">{label}</span>
			</div>
			<span className={cn("text-[13.5px]", valueClass)}>{value}</span>
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
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25, ease: "easeOut" }}
			className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm dark:border-white/10 dark:bg-[#070707]"
		>
			{/* Top Bar: New Check & Badge */}
			<div className="flex items-center justify-between border-stroke-soft-200 border-b px-5 py-3.5 sm:px-6 dark:border-white/10">
				<button
					type="button"
					onClick={onReset}
					className="group inline-flex items-center gap-1.5 font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
				>
					<Icon
						name="arrow-left"
						className="group-hover:-translate-x-0.5 size-3.5 transition-transform"
					/>
					<span>New Check</span>
				</button>

				<span className="font-mono text-[11px] text-text-soft-400 uppercase tracking-[0.14em] dark:text-white/40">
					TEMP EMAIL CHECKER
				</span>
			</div>

			{/* Section 1: Email & Hero Verdict */}
			<div className="px-5 py-6 sm:px-8 sm:py-7">
				<div>
					<p className="font-mono text-[11px] text-text-soft-400 uppercase tracking-[0.16em] dark:text-white/40">
						EMAIL
					</p>
					<p className="mt-1 font-semibold text-[17px] text-text-strong-950 sm:text-[18px] dark:text-white">
						{result.input}
					</p>
				</div>

				{/* Verdict Hero Card */}
				<div
					className={cn(
						"mt-5 flex flex-col items-center justify-center rounded-2xl border p-6 text-center sm:py-8",
						theme.badgeBg,
						theme.badgeBorder,
					)}
				>
					<div className="flex items-center gap-2.5">
						<span className={cn("size-2.5 rounded-full", theme.dotColor)} />
						<h3
							className={cn(
								"font-bold font-mono text-[20px] tracking-wider sm:text-[22px]",
								theme.titleClass,
							)}
						>
							{theme.title}
						</h3>
					</div>

					<p className="mt-2 text-[14.5px] text-text-strong-950 dark:text-white/90">
						{theme.subtitle}
					</p>

					<p className="mt-1 font-mono text-[12px] text-text-soft-400 dark:text-white/50">
						{theme.confidence}
					</p>
				</div>

				{/* Verdict Summary Text */}
				<div className="mt-6">
					<p className="font-mono text-[11px] text-text-soft-400 uppercase tracking-[0.16em] dark:text-white/40">
						VERDICT
					</p>
					<p className="mt-1.5 text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/60">
						{result.summary}
					</p>
				</div>
			</div>

			{/* Section 2: SIGNALS */}
			<div className="border-stroke-soft-200 border-t px-5 py-5 sm:px-8 dark:border-white/10">
				<p className="font-mono text-[11px] text-text-soft-400 uppercase tracking-[0.16em] dark:text-white/40">
					SIGNALS
				</p>

				<div className="mt-3 divide-y divide-stroke-soft-200/50 dark:divide-white/5">
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

			{/* Section 3: WHY THIS RESULT? */}
			<div className="border-stroke-soft-200 border-t px-5 py-5 sm:px-8 dark:border-white/10">
				<p className="font-mono text-[11px] text-text-soft-400 uppercase tracking-[0.16em] dark:text-white/40">
					WHY THIS RESULT?
				</p>
				<p className="mt-1.5 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/60">
					{theme.whyResult}
				</p>

				<div className="mt-4 flex flex-col items-center">
					<button
						type="button"
						onClick={() => setShowEvidence((prev) => !prev)}
						className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 px-4 py-2 font-medium text-[13px] text-text-strong-950 transition-colors hover:bg-neutral-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
					>
						<span>{showEvidence ? "Hide Evidence" : "View Evidence"}</span>
						<Icon
							name="chevron-down"
							className={cn(
								"size-3.5 transition-transform duration-200",
								showEvidence && "rotate-180",
							)}
						/>
					</button>

					<AnimatePresence>
						{showEvidence && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="mt-4 w-full overflow-hidden"
							>
								<div className="rounded-xl border border-stroke-soft-200 bg-neutral-950 p-4 font-mono text-[12px] text-emerald-400 dark:border-white/10">
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
			</div>

			{/* Section 4: TRUST AGENT PANEL */}
			<div className="border-stroke-soft-200 border-t p-5 sm:p-8 dark:border-white/10">
				<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/50 p-5 sm:p-6 dark:border-white/10 dark:bg-white/[0.02]">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="font-semibold text-[15px] text-primary-base">
								✦
							</span>
							<span className="font-semibold text-[14.5px] text-text-strong-950 dark:text-white">
								Trust Agent
							</span>
						</div>
						<span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
							<span className="size-1.5 rounded-full bg-emerald-500" />
							Investigation complete
						</span>
					</div>

					{/* Checklist */}
					<ul className="mt-4 space-y-2 text-[13.5px] text-text-sub-600 dark:text-white/70">
						<li className="flex items-center gap-2.5">
							<Icon
								name="check-circle"
								className="size-4 shrink-0 text-emerald-500"
							/>
							<span>Email format checked</span>
						</li>
						<li className="flex items-center gap-2.5">
							<Icon
								name="check-circle"
								className="size-4 shrink-0 text-emerald-500"
							/>
							<span>Domain identified</span>
						</li>
						<li className="flex items-center gap-2.5">
							<Icon
								name="check-circle"
								className="size-4 shrink-0 text-emerald-500"
							/>
							<span>Disposable-email intelligence checked</span>
						</li>
						<li className="flex items-center gap-2.5">
							<Icon
								name="check-circle"
								className="size-4 shrink-0 text-emerald-500"
							/>
							<span>Risk signals evaluated</span>
						</li>
					</ul>

					{/* Confidence Progress Bar */}
					<div className="mt-5">
						<div className="flex items-center justify-between text-[12px]">
							<span className="font-mono text-text-soft-400 uppercase tracking-wider dark:text-white/40">
								Confidence
							</span>
							<span className="font-medium font-mono text-text-strong-950 dark:text-white">
								{isDisposable ? "96%" : isRole ? "88%" : "99%"}
							</span>
						</div>
						<div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
							<div
								className={cn(
									"h-full rounded-full transition-all duration-500",
									isDisposable
										? "bg-rose-500"
										: isRole
											? "bg-amber-500"
											: "bg-emerald-500",
								)}
								style={{
									width: isDisposable ? "96%" : isRole ? "88%" : "99%",
								}}
							/>
						</div>
					</div>

					{/* Ask Agent Button */}
					<div className="mt-5">
						<button
							type="button"
							onClick={() => setShowEvidence(true)}
							className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 py-2.5 font-medium text-[13.5px] text-text-strong-950 shadow-xs transition-colors hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
						>
							<span className="text-primary-base">✦</span>
							<span>Ask Agent</span>
						</button>
					</div>
				</div>
			</div>

			{/* Section 5: RECOMMENDATION */}
			<div className="border-stroke-soft-200 border-t px-5 py-6 sm:px-8 dark:border-white/10">
				<p className="font-mono text-[11px] text-text-soft-400 uppercase tracking-[0.16em] dark:text-white/40">
					RECOMMENDATION
				</p>

				<div className="mt-2.5 flex items-start gap-2.5 text-[14px] text-text-strong-950 dark:text-white">
					<Icon
						name={
							isDisposable
								? "alert-triangle"
								: isRole
									? "alert-triangle"
									: "check-circle"
						}
						className={cn(
							"mt-0.5 size-4 shrink-0",
							isDisposable
								? "text-amber-500"
								: isRole
									? "text-amber-500"
									: "text-emerald-500",
						)}
					/>
					<p className="leading-relaxed">{theme.recommendation}</p>
				</div>

				<div className="mt-7 flex justify-center">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="medium"
						onClick={onReset}
						className="h-10 cursor-pointer rounded-xl px-5 font-medium text-[14px]"
					>
						<span>Check Another Email</span>
					</Button.Root>
				</div>
			</div>
		</motion.div>
	);
}

export function CheckerPanel() {
	const inputRef = useRef<HTMLInputElement>(null);
	const [value, setValue] = useState("");
	const [result, setResult] = useState<CheckResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	const requestRef = useRef<AbortController | null>(null);

	useEffect(() => () => requestRef.current?.abort(), []);

	const run = async (raw: string) => {
		const query = raw.trim();
		if (!query) {
			inputRef.current?.focus();
			setResult(null);
			setError(null);
			return;
		}

		requestRef.current?.abort();
		const controller = new AbortController();
		requestRef.current = controller;

		setIsPending(true);
		setError(null);

		try {
			const response = await runCheck(query, controller.signal);
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
			if (controller.signal.aborted) return;
			setResult(null);
			setError(
				err instanceof CheckRequestError
					? err.message
					: "Something went wrong running that check.",
			);
		} finally {
			if (!controller.signal.aborted) setIsPending(false);
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
		<div className="mx-auto w-full max-w-2xl">
			{!result ? (
				/* Dashboard Modal / Card Container */
				<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-weak-50 p-0.5 sm:rounded-[20px] dark:border-white/10 dark:bg-white/[0.04]">
					<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-4.5 dark:border-white/10 dark:bg-[#070707]">
						{/* Input Check Zone */}
						<form onSubmit={onSubmit} noValidate className="space-y-3.5">
							<div className="space-y-1.5">
								<Label.Root
									htmlFor="checker-input"
									className="ml-2 font-medium text-text-strong-950 text-xs dark:text-white"
								>
									Email or domain
									<Label.Asterisk />
								</Label.Root>

								<Input.Root
									size="medium"
									className="!shadow-none has-[input:focus]:!shadow-button-primary-focus has-[input:focus]:before:!ring-primary-base w-full rounded-xl"
								>
									<Input.Wrapper className="h-10.5 pr-1.5 pl-3 dark:bg-[#070707]">
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
											className="!p-0 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg"
											aria-label="Verify email or domain"
										>
											{isPending ? (
												<span className="size-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
											) : (
												<FancyButton.Icon className="mx-0 size-3.5">
													<Icon name="arrow-right" className="size-3.5" />
												</FancyButton.Icon>
											)}
										</FancyButton.Root>
									</Input.Wrapper>
								</Input.Root>
							</div>

							{/* How It Works - Vertical Stepper */}
							<div className="mt-3.5 space-y-3 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3.5 text-xs dark:border-white/10 dark:bg-white/[0.02]">
								<div className="flex items-center justify-between">
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
									<div className="relative flex items-center gap-3 pb-3.5">
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
									<div className="relative flex items-center gap-3 pb-3.5">
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
									<div className="relative flex items-center gap-3">
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
						</form>
					</div>
				</div>
			) : null}

			<div aria-live="polite">
				{error ? (
					<div className="mt-4 flex items-start gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-5 py-4 dark:border-white/10 dark:bg-[#0b0b0b]">
						<Icon
							name="alert-triangle"
							className="mt-0.5 size-4 shrink-0 text-warning-base"
						/>
						<p className="text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
							{error}
						</p>
					</div>
				) : result ? (
					<ResultCardDetailed result={result} onReset={handleReset} />
				) : null}
			</div>
		</div>
	);
}
