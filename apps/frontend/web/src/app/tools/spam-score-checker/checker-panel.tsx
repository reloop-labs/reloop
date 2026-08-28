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
	runSpamCheck,
	type SpamCheckResponse,
	type TriggerCategory,
} from "./check-api";

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


function buildHighlightedContent(
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
				className="rounded-[3px] bg-rose-500/15 px-0.5 text-inherit underline decoration-rose-500 decoration-wavy underline-offset-4 dark:bg-rose-500/25 dark:decoration-rose-400"
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
	const [scanKey, setScanKey] = useState(0);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const subjectInputRef = useRef<HTMLInputElement>(null);
	const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
	const shouldReduceMotion = useReducedMotion();

	const hasContent = Boolean(subject.trim() || body.trim());

	// Auto-grow textarea height as content expands
	useEffect(() => {
		const textarea = bodyTextareaRef.current;
		if (!textarea) return;
		textarea.style.height = "auto";
		textarea.style.height = `${Math.max(88, textarea.scrollHeight)}px`;
	}, [body, analysis]);

	const handleScan = async (e?: FormEvent) => {
		if (e) e.preventDefault();
		if (!hasContent) return;

		setIsAnalyzing(true);
		setErrorMessage(null);
		try {
			const result = await runSpamCheck(subject, body);
			setAnalysis(result);
			setScanKey((k) => k + 1);
			await new Promise((resolve) => setTimeout(resolve, 1400));
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

	const handleReset = () => {
		setSubject("");
		setBody("");
		setAnalysis(null);
		setErrorMessage(null);
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
									"bg-neutral-400 dark:bg-white/40",
								isAnalyzing && "animate-pulse bg-blue-500",
								analysis?.verdict === "inbox_ready" && "bg-emerald-500",
								analysis?.verdict === "needs_review" && "bg-amber-500",
								analysis?.verdict === "high_risk" && "bg-rose-500",
							)}
						/>
						<span>
							{isAnalyzing
								? "Scanning..."
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

							{analysis || isAnalyzing ? (
								<div className="relative w-full overflow-hidden rounded-xl bg-bg-weak-50/50 dark:bg-white/[0.03]">
									{/* Layer 1: Normal Plain Text Layer (Right of laser line - Unscanned) */}
									<motion.div
										key={`subject-plain-${scanKey}`}
										initial={{
											clipPath: isAnalyzing
												? "inset(0 0 0 0%)"
												: "inset(0 0 0 100%)",
										}}
										animate={{ clipPath: "inset(0 0 0 100%)" }}
										transition={
											isAnalyzing
												? { duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }
												: { duration: 0 }
										}
										className="px-3.5 py-2.5 font-sans text-[14px] leading-5 text-text-strong-950 select-text dark:text-white"
									>
										{subject}
									</motion.div>

									{/* Layer 2: Highlighted Underline Layer (Left of laser line - Scanned) */}
									<motion.div
										key={`subject-reveal-${scanKey}`}
										initial={{
											clipPath: isAnalyzing
												? "inset(0 100% 0 0)"
												: "inset(0 0% 0 0)",
										}}
										animate={{ clipPath: "inset(0 0% 0 0)" }}
										transition={
											isAnalyzing
												? { duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }
												: { duration: 0 }
										}
										className="absolute inset-0 z-10 overflow-hidden px-3.5 py-2.5 font-sans text-[14px] leading-5 text-text-strong-950 select-text dark:text-white"
									>
										{analysis
											? buildHighlightedContent(
													subject,
													analysis.detectedTriggers,
													"subject",
												)
											: subject}
									</motion.div>

									{/* Synchronized Scanning Laser Beam */}
									<AnimatePresence>
										{isAnalyzing && (
											<motion.div
												key={`subject-laser-${scanKey}`}
												initial={{ left: "0%", opacity: 1 }}
												animate={{ left: "100%" }}
												exit={{ opacity: 0, transition: { duration: 0.2 } }}
												transition={{
													duration: 1.4,
													ease: [0.25, 0.1, 0.25, 1],
												}}
												className="pointer-events-none absolute inset-y-0 z-20 flex w-28 -translate-x-full"
											>
												<div className="h-full w-full bg-gradient-to-r from-transparent via-rose-500/10 to-rose-500/35" />
												<div className="h-full w-[2px] shrink-0 bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9),0_0_3px_#ffffff]" />
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							) : (
								<Input.Root
									size="medium"
									className="has-[input:focus]:before:!ring-primary-base has-[input:focus]:!shadow-button-primary-focus"
								>
									<Input.Wrapper>
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
											className="font-sans text-[14px] leading-5"
										/>
									</Input.Wrapper>
								</Input.Root>
							)}
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

							{analysis || isAnalyzing ? (
								<div className="relative w-full overflow-hidden rounded-xl bg-bg-weak-50/50 dark:bg-white/[0.03]">
									{/* Layer 1: Normal Plain Text Layer (Right of laser line - Unscanned) */}
									<motion.div
										key={`body-plain-${scanKey}`}
										initial={{
											clipPath: isAnalyzing
												? "inset(0 0 0 0%)"
												: "inset(0 0 0 100%)",
										}}
										animate={{ clipPath: "inset(0 0 0 100%)" }}
										transition={
											isAnalyzing
												? { duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }
												: { duration: 0 }
										}
										className="min-h-24 whitespace-pre-wrap break-words p-3.5 font-sans text-paragraph-xs leading-relaxed text-text-strong-950 select-text dark:text-white"
									>
										{body}
									</motion.div>

									{/* Layer 2: Highlighted Underline Layer (Left of laser line - Scanned) */}
									<motion.div
										key={`body-reveal-${scanKey}`}
										initial={{
											clipPath: isAnalyzing
												? "inset(0 100% 0 0)"
												: "inset(0 0% 0 0)",
										}}
										animate={{ clipPath: "inset(0 0% 0 0)" }}
										transition={
											isAnalyzing
												? { duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }
												: { duration: 0 }
										}
										className="absolute inset-0 z-10 overflow-hidden whitespace-pre-wrap break-words p-3.5 font-sans text-paragraph-xs leading-relaxed text-text-strong-950 select-text dark:text-white"
									>
										{analysis
											? buildHighlightedContent(
													body,
													analysis.detectedTriggers,
													"body",
												)
											: body}
									</motion.div>

									{/* Synchronized Horizontal Scanning Laser Beam */}
									<AnimatePresence>
										{isAnalyzing && (
											<motion.div
												key={`body-laser-${scanKey}`}
												initial={{ left: "0%", opacity: 1 }}
												animate={{ left: "100%" }}
												exit={{ opacity: 0, transition: { duration: 0.2 } }}
												transition={{
													duration: 1.4,
													ease: [0.25, 0.1, 0.25, 1],
												}}
												className="pointer-events-none absolute inset-y-0 z-20 flex w-28 -translate-x-full"
											>
												<div className="h-full w-full bg-gradient-to-r from-transparent via-rose-500/10 to-rose-500/35" />
												<div className="h-full w-[2px] shrink-0 bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9),0_0_3px_#ffffff]" />
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							) : (
								<Textarea.Root
									simple
									id="body-input"
									ref={bodyTextareaRef}
									rows={3}
									value={body}
									onChange={(e) => {
										setBody(e.target.value);
										setErrorMessage(null);
										e.target.style.height = "auto";
										e.target.style.height = `${Math.max(88, e.target.scrollHeight)}px`;
									}}
									placeholder="Paste your email copy here to scan for spam trigger phrases..."
									className="!min-h-[88px] resize-none overflow-hidden text-paragraph-xs leading-normal focus:!ring-primary-base focus:!shadow-button-primary-focus"
								/>
							)}
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

						{/* Results Morph Slot */}
						<MorphSlot
							activeKey={analysis ? "result" : null}
							reduceMotion={shouldReduceMotion}
						>
							{analysis ? (
								<div className="space-y-3.5 border-stroke-soft-200 border-t pt-2 text-xs dark:border-white/10">
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
								</div>
							) : null}
						</MorphSlot>
					</form>
				</div>

				{/* Bottom Action Footer - Outside white card, inside grey frame */}
				<div className="flex items-center justify-between px-4 py-3 sm:px-5">
					{hasContent ? (
						<div className="flex items-center gap-3">
							{analysis && !isAnalyzing ? (
								<button
									type="button"
									onClick={() => {
										setAnalysis(null);
										setTimeout(() => subjectInputRef.current?.focus(), 50);
									}}
									className="cursor-pointer font-medium text-primary-base text-xs hover:underline"
								>
									Edit copy
								</button>
							) : null}
							<button
								type="button"
								onClick={handleReset}
								className="cursor-pointer font-medium text-text-sub-600 text-xs transition-colors hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
							>
								{analysis ? "Clear" : "Clear inputs"}
							</button>
						</div>
					) : (
						<span className="font-mono text-[12px] text-text-sub-600 dark:text-white/50">
							Pre-send deliverability check
						</span>
					)}

					<div className="flex items-center gap-2">
						<FancyButton.Root
							type="submit"
							form="spam-checker-form"
							variant="primary"
							size="xsmall"
							disabled={isAnalyzing || !hasContent}
							className="h-8 px-3.5 text-[12px]!"
						>
							{isAnalyzing ? (
								<div className="flex items-center gap-1.5">
									<LoadingDot size={13} dotSize={2} className="text-white" />
									<span>Scanning...</span>
								</div>
							) : (
								<>
									<FancyButton.Icon
										as={Icon}
										name={analysis ? "arrow-right" : "search"}
										className="size-3.5"
									/>
									<span>{analysis ? "Calculate Score" : "Start Scan"}</span>
								</>
							)}
						</FancyButton.Root>
					</div>
				</div>
			</div>
		</div>
	);
}
