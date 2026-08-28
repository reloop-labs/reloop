"use client";

import * as Alert from "@reloop/ui/alert";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { LoadingDot } from "@reloop/ui/loading-dot";
import * as Textarea from "@reloop/ui/textarea";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type React from "react";
import {
	type FormEvent,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	CATEGORY_META,
	type DetectedTrigger,
	INITIAL_EMPTY_RESPONSE,
	rewriteSpamWithAi,
	runSpamCheck,
	type SpamCheckResponse,
	type TriggerCategory,
} from "./check-api";
import { RawJsonBlock } from "./json-highlight";

const TOTAL_BARS = 48;
const BLOCK_THRESHOLD = 40;
const BLOCK_BAR_INDEX = Math.round((BLOCK_THRESHOLD / 100) * TOTAL_BARS);

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

const VERDICT_THEME = {
	inbox_ready: {
		title: "INBOX READY",
		dotColor: "bg-emerald-500",
		titleClass: "text-emerald-600 dark:text-emerald-400",
		badgeBg: "bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08]",
		badgeBorder: "border-emerald-500/20 dark:border-emerald-500/30",
		ratingLabel: "Low Risk",
	},
	needs_review: {
		title: "NEEDS REVIEW",
		dotColor: "bg-amber-500",
		titleClass: "text-amber-500 dark:text-amber-400",
		badgeBg: "bg-amber-500/[0.04] dark:bg-amber-500/[0.08]",
		badgeBorder: "border-amber-500/20 dark:border-amber-500/30",
		ratingLabel: "Moderate Risk",
	},
	high_risk: {
		title: "HIGH SPAM RISK",
		dotColor: "bg-rose-500",
		titleClass: "text-rose-500 dark:text-rose-400",
		badgeBg: "bg-rose-500/[0.04] dark:bg-rose-500/[0.08]",
		badgeBorder: "border-rose-500/20 dark:border-rose-500/30",
		ratingLabel: "High Risk",
	},
};

function buildBackdropNodes(
	text: string,
	triggers: DetectedTrigger[],
	context: "subject" | "body",
) {
	const relevantTriggers = triggers.filter((t) => t.context === context);
	if (relevantTriggers.length === 0) {
		return text ? <span>{text}</span> : null;
	}

	const sorted = [...relevantTriggers].sort(
		(a, b) => a.startIndex - b.startIndex,
	);
	const nodes: React.ReactNode[] = [];
	let lastIndex = 0;

	for (let i = 0; i < sorted.length; i++) {
		const trigger = sorted[i];
		if (!trigger || trigger.startIndex < lastIndex) continue;

		if (trigger.startIndex > lastIndex) {
			nodes.push(text.slice(lastIndex, trigger.startIndex));
		}

		nodes.push(
			<mark
				key={`m-${context}-${i}-${trigger.startIndex}`}
				className={cn(
					"rounded-sm py-0.5 text-transparent",
					trigger.category === "urgency" &&
						"bg-rose-500/25 dark:bg-rose-500/40",
					trigger.category === "shady" && "bg-rose-500/25 dark:bg-rose-500/40",
					trigger.category === "overpromise" &&
						"bg-amber-500/25 dark:bg-amber-500/40",
					trigger.category === "money" &&
						"bg-purple-500/25 dark:bg-purple-500/40",
					trigger.category === "outreach" &&
						"bg-blue-500/25 dark:bg-blue-500/40",
				)}
			>
				{trigger.word}
			</mark>,
		);

		lastIndex = trigger.endIndex;
	}

	if (lastIndex < text.length) {
		nodes.push(text.slice(lastIndex));
	}

	return <>{nodes}</>;
}

export function CheckerPanel() {
	const [subject, setSubject] = useState("");
	const [body, setBody] = useState("");
	const [analysis, setAnalysis] = useState<SpamCheckResponse | null>(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [copied, setCopied] = useState(false);
	const [isFixing, setIsFixing] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [showRawData, setShowRawData] = useState(false);

	const subjectInputRef = useRef<HTMLInputElement>(null);
	const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
	const subjectBackdropRef = useRef<HTMLDivElement>(null);
	const bodyBackdropRef = useRef<HTMLDivElement>(null);
	const shouldReduceMotion = useReducedMotion();

	const hasContent = Boolean(subject.trim() || body.trim());

	const handleScan = async (e?: FormEvent) => {
		if (e) e.preventDefault();
		if (!hasContent) return;

		setIsAnalyzing(true);
		try {
			const result = await runSpamCheck(subject, body);
			setAnalysis(result);
		} catch (err: unknown) {
			setErrorMessage(
				err instanceof Error
					? err.message
					: "Could not analyze spam score. Please try again.",
			);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
	const linkCount = (body.match(/https?:\/\/[^\s"'<>]+/gi) || []).length;

	// Calculate risk score: 100 - deliverability score when analyzed, 0 when unscanned
	const riskScore = analysis ? Math.max(0, 100 - analysis.score) : 0;
	const activeBarCount = analysis
		? Math.max(1, Math.round((riskScore / 100) * TOTAL_BARS))
		: 0;

	const theme =
		analysis && (VERDICT_THEME[analysis.verdict] || VERDICT_THEME.inbox_ready);

	const handleCopyReport = async () => {
		if (!analysis) return;
		try {
			const reportText = `Reloop Spam Score Report\nScore: ${analysis.score}/100 (Grade: ${analysis.grade})\nVerdict: ${analysis.verdict}\nSubject: ${subject}\nTriggers Found: ${analysis.detectedTriggers.length}\nChecked via https://reloop.sh/tools/spam-score-checker`;
			await navigator.clipboard.writeText(reportText);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {}
	};

	const handleAiFix = async () => {
		if (isFixing || !hasContent) return;
		setIsFixing(true);
		setErrorMessage(null);
		try {
			const rewritten = await rewriteSpamWithAi(subject, body);
			if (rewritten.subject) setSubject(rewritten.subject);
			if (rewritten.body) setBody(rewritten.body);
			if (rewritten.subject || rewritten.body) {
				const result = await runSpamCheck(
					rewritten.subject || subject,
					rewritten.body || body,
				);
				setAnalysis(result);
			}
		} catch (err: unknown) {
			setErrorMessage(
				err instanceof Error
					? err.message
					: "AI rewrite service failed. Please try again.",
			);
		} finally {
			setIsFixing(false);
		}
	};

	const handleReset = () => {
		setSubject("");
		setBody("");
		setAnalysis(null);
		setErrorMessage(null);
		setShowRawData(false);
		setTimeout(() => subjectInputRef.current?.focus(), 50);
	};

	return (
		<div className="mx-auto w-full max-w-xl font-sans">
			{/* Dashboard Container with Outer Shell */}
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-weak-50 p-0.5 dark:border-white/10 dark:bg-white/[0.03]">
				{/* Top Header: Title & Status - Outside white card, inside grey frame */}
				<div className="flex items-center justify-between px-4 pt-3.5 pb-3 sm:px-5 sm:pt-4">
					<h3 className="font-semibold text-[17px] text-text-strong-950 tracking-tight sm:text-[18px] dark:text-white">
						Spam Score Checker
					</h3>

					<div className="flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3 py-1 font-medium text-[12px] text-text-sub-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
						<span
							className={cn(
								"size-2 rounded-full",
								!analysis &&
									!isAnalyzing &&
									!isFixing &&
									"bg-neutral-400 dark:bg-white/40",
								(isAnalyzing || isFixing) && "animate-pulse bg-blue-500",
								analysis?.verdict === "inbox_ready" && "bg-emerald-500",
								analysis?.verdict === "needs_review" && "bg-amber-500",
								analysis?.verdict === "high_risk" && "bg-rose-500",
							)}
						/>
						<span>
							{isAnalyzing
								? "Scanning..."
								: isFixing
									? "Rewriting..."
									: !analysis
										? "Unscanned"
										: analysis.verdict === "inbox_ready"
											? "Inbox Ready"
											: analysis.verdict === "needs_review"
												? "Needs Review"
												: `High Risk (${analysis.score}/100)`}
						</span>
					</div>
				</div>

				{/* Top White Card */}
				<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 sm:p-6 dark:border-white/10 dark:bg-[#0c0c0c]">
					{/* Error Alert */}
					{errorMessage && (
						<div className="mb-4">
							<Alert.Root variant="lighter" status="error" size="large">
								<Alert.Icon as={Icon} name="alert-triangle" />
								<div className="flex-1">
									<div className="font-medium text-label-sm">Error</div>
									<p className="mt-0.5 text-paragraph-sm">{errorMessage}</p>
								</div>
								<button
									type="button"
									onClick={() => setErrorMessage(null)}
									className="text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
								>
									<Icon name="close" className="size-4" />
								</button>
							</Alert.Root>
						</div>
					)}

					{/* Inputs Form */}
					<form
						id="spam-checker-form"
						onSubmit={handleScan}
						noValidate
						className="space-y-4"
					>
						{/* Subject Line */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label.Root
									htmlFor="subject-input"
									className="font-medium text-text-strong-950 text-xs dark:text-white"
								>
									Subject Line
									<Label.Asterisk />
								</Label.Root>
								<span
									className={cn(
										"font-mono text-[11px]",
										subject.length > 60
											? "text-warning-base"
											: "text-text-soft-400 dark:text-white/35",
									)}
								>
									{subject.length}/60 chars
								</span>
							</div>

							<Input.Root size="medium">
								<Input.Wrapper>
									<div ref={subjectBackdropRef} aria-hidden="true">
										{analysis
											? buildBackdropNodes(
													subject,
													analysis.detectedTriggers,
													"subject",
												)
											: null}
									</div>

									<Input.Input
										id="subject-input"
										ref={subjectInputRef}
										type="text"
										value={subject}
										onChange={(e) => {
											setSubject(e.target.value);
											setErrorMessage(null);
										}}
										placeholder="e.g. Action required: Update your payment information"
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>

						{/* Email Body Copy */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label.Root
									htmlFor="body-input"
									className="font-medium text-text-strong-950 text-xs dark:text-white"
								>
									Email Body Copy
									<Label.Asterisk />
								</Label.Root>
								<div className="flex items-center gap-2">
									<span className="font-mono text-[11px] text-text-soft-400 dark:text-white/35">
										{wordCount} words · {linkCount} link(s)
									</span>
								</div>
							</div>

							<div className="relative w-full rounded-xl">
								<div
									ref={bodyBackdropRef}
									aria-hidden="true"
									className="pointer-events-none absolute inset-0 select-none overflow-hidden whitespace-pre-wrap break-words p-3.5 font-sans text-[13.5px] text-transparent leading-[1.65]"
								>
									{analysis
										? buildBackdropNodes(
												body,
												analysis.detectedTriggers,
												"body",
											)
										: null}
								</div>

								<Textarea.Root
									simple
									id="body-input"
									ref={bodyTextareaRef}
									rows={3}
									value={body}
									onChange={(e) => {
										setBody(e.target.value);
										setErrorMessage(null);
									}}
									onScroll={(e) => {
										if (bodyBackdropRef.current) {
											bodyBackdropRef.current.scrollTop =
												e.currentTarget.scrollTop;
										}
									}}
									placeholder="Paste your email copy here to scan for spam trigger phrases..."
								/>
							</div>
						</div>

						{/* Risk Meter Visualizer Card */}
						<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
							<div className="mb-2 flex items-center justify-between">
								<span className="font-mono text-[12px] text-text-sub-600 dark:text-white/60">
									risk{" "}
									<strong className="font-bold text-[14px] text-text-strong-950 dark:text-white">
										{riskScore}
									</strong>
								</span>
								{analysis && analysis.detectedTriggers.length > 0 && (
									<span className="font-mono text-[11px] text-rose-500 dark:text-rose-400">
										{analysis.detectedTriggers.length} trigger(s) flagged
									</span>
								)}
							</div>

							{/* Vertical Tick Bars Barcode Graph */}
							<div className="relative flex items-center justify-between gap-[3px] py-1 sm:gap-1">
								{Array.from({ length: TOTAL_BARS }).map((_, i) => {
									const isPastBlockZone = i >= BLOCK_BAR_INDEX;
									const isBlockDivider = i === BLOCK_BAR_INDEX;
									const isActive = Boolean(analysis && i < activeBarCount);

									let barColorClass = "bg-neutral-200/80 dark:bg-white/10";

									if (isPastBlockZone) {
										barColorClass = "bg-rose-500/15 dark:bg-rose-500/20";
									}

									if (isActive) {
										if (isPastBlockZone || riskScore >= BLOCK_THRESHOLD) {
											barColorClass = "bg-rose-500";
										} else {
											barColorClass = "bg-emerald-500";
										}
									}

									return (
										<div
											key={`bar-${i}`}
											className="relative flex flex-col items-center"
										>
											{isBlockDivider && (
												<div
													className="-top-1.5 absolute h-9 w-[1.5px] bg-neutral-400 dark:bg-white/40"
													aria-hidden
												/>
											)}
											<span
												className={cn(
													"h-7 w-[3.5px] rounded-full transition-colors duration-150 sm:w-[4px]",
													barColorClass,
												)}
											/>
										</div>
									);
								})}
							</div>

							{/* Scale Labels */}
							<div className="mt-1 flex items-center justify-between font-mono text-[11px] text-text-soft-400 dark:text-white/35">
								<span>safe</span>
								<span className="text-text-sub-600 dark:text-white/50">
									block at 40
								</span>
								<span className="text-rose-500/90 dark:text-rose-400/90">
									blocked
								</span>
							</div>
						</div>

						{/* Status Banner Card */}
						{!analysis ? (
							<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-3.5 text-center font-medium text-text-sub-600 text-xs dark:border-white/10 dark:bg-[#070707] dark:text-white/60">
								Run a scan to check this prompt
							</div>
						) : (
							<div
								className={cn(
									"flex items-center gap-2 rounded-xl border p-3.5 font-medium text-xs",
									analysis.verdict === "inbox_ready"
										? "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400"
										: analysis.verdict === "needs_review"
											? "border-amber-500/20 bg-amber-500/[0.08] text-amber-600 dark:text-amber-400"
											: "border-rose-500/20 bg-rose-500/[0.08] text-rose-600 dark:text-rose-400",
								)}
							>
								<Icon
									name={
										analysis.verdict === "inbox_ready"
											? "check-circle"
											: "alert-triangle"
									}
									className="size-4 shrink-0"
								/>
								<span>
									{analysis.verdict === "inbox_ready"
										? "Content is clean — 0 high-risk spam triggers found."
										: analysis.verdict === "needs_review"
											? `Needs Review: ${analysis.detectedTriggers.length} trigger phrase(s) detected.`
											: `High Spam Risk: ${analysis.detectedTriggers.length} aggressive trigger(s) flagged.`}
								</span>
							</div>
						)}

						{/* Results Morph Slot */}
						<MorphSlot
							activeKey={analysis ? "result" : null}
							reduceMotion={shouldReduceMotion}
						>
							{analysis && theme ? (
								<div className="space-y-3.5 border-stroke-soft-200 border-t pt-2 text-xs dark:border-white/10">
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
												<span
													className={cn("size-2 rounded-full", theme.dotColor)}
												/>
												<span
													className={cn(
														"font-bold font-mono text-[13px] uppercase tracking-wider",
														theme.titleClass,
													)}
												>
													{theme.title}
												</span>
												<span className="text-text-sub-600 dark:text-white/40">
													·
												</span>
												<span className="font-medium text-text-strong-950 text-xs dark:text-white">
													{theme.ratingLabel}
												</span>
											</div>

											<div className="flex items-baseline gap-1 font-mono">
												<span className="font-bold text-[22px] text-text-strong-950 leading-none dark:text-white">
													{analysis.score}
												</span>
												<span className="text-[12px] text-text-soft-400 dark:text-white/40">
													/100
												</span>
												<span className="ml-1 rounded bg-bg-white-0 px-1.5 py-0.2 font-mono font-semibold text-[11px] text-text-strong-950 dark:bg-white/10 dark:text-white">
													{analysis.grade}
												</span>
											</div>
										</div>
									</div>

									{/* Detected Categories */}
									<div className="overflow-hidden rounded-[14px] border border-stroke-soft-200 bg-bg-weak-50 p-0.5 dark:border-white/10 dark:bg-white/[0.03]">
										<div className="px-3 pt-2 pb-2">
											<p className="font-mono font-semibold text-[11px] text-text-strong-950 uppercase tracking-wider dark:text-white">
												Detected Spam Categories
											</p>
										</div>

										<div className="divide-y divide-stroke-soft-200/50 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3.5 py-1 dark:divide-white/5 dark:border-white/10 dark:bg-[#070707]">
											{(Object.keys(CATEGORY_META) as TriggerCategory[]).map(
												(cat) => {
													const meta = CATEGORY_META[cat];
													const count = analysis.categoryCounts[cat] || 0;

													return (
														<div
															key={cat}
															className="flex items-center justify-between py-2"
														>
															<div className="flex items-center gap-2">
																<Icon
																	name={meta.icon}
																	className={cn(
																		"size-3.5 shrink-0",
																		count > 0
																			? "text-text-strong-950 dark:text-white"
																			: "text-text-soft-400 dark:text-white/30",
																	)}
																/>
																<span
																	className={cn(
																		"text-xs",
																		count > 0
																			? "font-medium text-text-strong-950 dark:text-white"
																			: "text-text-sub-600 dark:text-white/40",
																	)}
																>
																	{meta.label}
																</span>
															</div>
															<code
																className={cn(
																	"rounded-md border px-2 py-0.5 font-medium font-mono text-[11px] tracking-tight",
																	count > 0
																		? "border-rose-500/20 bg-rose-500/[0.08] text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400"
																		: "border-stroke-soft-200 bg-bg-white-0 text-text-soft-400 dark:border-white/10 dark:bg-[#0b0b0b] dark:text-white/40",
																)}
															>
																{count}
															</code>
														</div>
													);
												},
											)}
										</div>
									</div>

									{/* Recommendation */}
									{analysis.recommendations.length > 0 && (
										<div className="flex items-start gap-2.5 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 text-xs dark:border-white/10 dark:bg-white/[0.02]">
											<Icon
												name="check-circle"
												className="mt-0.5 size-3.5 shrink-0 text-emerald-500"
											/>
											<p className="text-text-sub-600 text-xs leading-relaxed dark:text-white/60">
												{analysis.recommendations[0]}
											</p>
										</div>
									)}

									{/* Actions */}
									<div className="flex items-center justify-between pt-2">
										<button
											type="button"
											onClick={() => setShowRawData((prev) => !prev)}
											className="cursor-pointer font-mono text-[11px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
										>
											{showRawData ? "Hide Raw JSON" : "View Raw JSON"}
										</button>

										<button
											type="button"
											onClick={handleCopyReport}
											className="cursor-pointer font-medium text-primary-base text-xs hover:underline"
										>
											{copied ? "Report Copied" : "Copy Report"}
										</button>
									</div>

									{/* Raw JSON Block */}
									<AnimatePresence>
										{showRawData && (
											<motion.div
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												exit={{ opacity: 0, height: 0 }}
												transition={{ duration: 0.2 }}
												className="overflow-hidden pt-2"
											>
												<RawJsonBlock value={analysis} />
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							) : null}
						</MorphSlot>
					</form>
				</div>

				{/* Bottom Action Footer - Outside white card, inside grey frame */}
				<div className="flex items-center justify-between px-4 py-3 sm:px-5">
					{hasContent ? (
						<button
							type="button"
							onClick={handleReset}
							className="cursor-pointer font-medium text-primary-base text-xs hover:underline"
						>
							Clear inputs
						</button>
					) : (
						<span className="font-mono text-[12px] text-text-sub-600 dark:text-white/50">
							Pre-send deliverability check
						</span>
					)}

					<div className="flex items-center gap-2">
						{hasContent && (
							<FancyButton.Root
								type="button"
								variant="neutral"
								size="xsmall"
								onClick={handleAiFix}
								disabled={isFixing || !hasContent}
								className="h-8 px-3 text-[12px]!"
							>
								<FancyButton.Icon
									as={Icon}
									name="sparkling"
									className="size-3.5"
								/>
								<span>{isFixing ? "Rewriting..." : "Fix with AI"}</span>
							</FancyButton.Root>
						)}

						<FancyButton.Root
							type="submit"
							form="spam-checker-form"
							variant="primary"
							size="xsmall"
							disabled={isAnalyzing || !hasContent}
							className="h-8 px-3.5 text-[12px]!"
						>
							{isAnalyzing ? (
								<LoadingDot size={13} dotSize={2} className="text-white" />
							) : (
								<>
									<span>Calculate Score</span>
									<FancyButton.Icon
										as={Icon}
										name="arrow-right"
										className="size-3.5"
									/>
								</>
							)}
						</FancyButton.Root>
					</div>
				</div>
			</div>
		</div>
	);
}
