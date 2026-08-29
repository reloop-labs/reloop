"use client";

import * as Alert from "@reloop/ui/alert";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { LoadingDot } from "@reloop/ui/loading-dot";
import * as Textarea from "@reloop/ui/textarea";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
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
const SPAM_THRESHOLD = 40;
const SPAM_BAR_INDEX = Math.round((SPAM_THRESHOLD / 100) * TOTAL_BARS);

const SCAN_DURATION_SEC = 1.1;
const SCAN_DURATION_MS = 1100;
const SCAN_EASING = [0.25, 0.1, 0.25, 1] as const;

const HEIGHT_MORPH = {
	duration: 0.28,
	ease: [0.22, 1, 0.36, 1] as const,
};

const CROSSFADE = {
	duration: 0.22,
	ease: [0.22, 1, 0.36, 1] as const,
};

const SPAM_SUGGESTIONS: Record<string, string> = {
	urgent: "time-sensitive",
	"expires tonight": "available today",
	"act now": "learn more",
	immediately: "when convenient",
	hurry: "take a look",
	"last chance": "final reminder",
	"final notice": "follow-up notice",
	"final warning": "important update",
	asap: "soon",
	"as soon as possible": "at your convenience",
	claim: "access",
	"confidential investment proposal": "partnership overview",
	"click here": "view the details",
	"100% free": "complimentary",
	"risk-free": "worry-free",
	free: "included",
	payout: "disbursement",
	bonus: "reward",
	"money back": "guarantee",
	guaranteed: "assured",
	"no obligation": "no commitment",
	"once in a lifetime": "special offer",
	"limited time": "current window",
	winner: "selected participant",
	congratulations: "great news",
	"earn money": "generate revenue",
	income: "earnings",
	cash: "funds",
	prize: "award",
	cheap: "affordable",
	"lowest price": "competitive rate",
	"save big": "optimize costs",
};

function getSafeSuggestion(word: string, category: TriggerCategory): string {
	const lower = word.toLowerCase().trim();
	if (SPAM_SUGGESTIONS[lower]) {
		return SPAM_SUGGESTIONS[lower];
	}
	switch (category) {
		case "urgency":
			return "time-sensitive";
		case "shady":
			return "learn more";
		case "overpromise":
			return "verified";
		case "money":
			return "account balance";
		case "outreach":
			return "introduction";
		default:
			return "neutral phrasing";
	}
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


function buildHighlightedContent(
	text: string,
	triggers: DetectedTrigger[],
	context: "subject" | "body",
	isPlain = false,
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

		if (isPlain) {
			nodes.push(
				<span
					key={`m-plain-${context}-${i}-${trigger.startIndex}`}
					className="px-0.5 font-mono text-text-strong-950 dark:text-white"
				>
					{trigger.word}
				</span>,
			);
		} else {
			nodes.push(
				<mark
					key={`m-${context}-${i}-${trigger.startIndex}`}
					className="box-decoration-clone rounded-[3px] bg-rose-500/10 px-0.5 font-mono text-rose-600 underline decoration-rose-500 decoration-wavy underline-offset-4 dark:bg-rose-500/20 dark:text-rose-400 dark:decoration-rose-400"
				>
					{trigger.word}
				</mark>,
			);
		}

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
	const [animatedRiskScore, setAnimatedRiskScore] = useState(0);
	const [scanKey, setScanKey] = useState(0);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [copiedPrompt, setCopiedPrompt] = useState(false);

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
		setAnimatedRiskScore(0);
		try {
			const result = await runSpamCheck(subject, body);
			const targetRisk = Math.max(0, 100 - result.score);
			setAnalysis(result);
			setScanKey((k) => k + 1);

			if (shouldReduceMotion) {
				setAnimatedRiskScore(targetRisk);
			} else {
				animate(0, targetRisk, {
					duration: SCAN_DURATION_SEC,
					ease: SCAN_EASING,
					onUpdate: (latest) => {
						setAnimatedRiskScore(Math.round(latest));
					},
				});
			}

			await new Promise((resolve) => setTimeout(resolve, SCAN_DURATION_MS));
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

	// Calculate target risk score: 100 - deliverability score when analyzed
	const targetRiskScore = analysis ? Math.max(0, 100 - analysis.score) : 0;
	const displayedRiskScore = isAnalyzing
		? animatedRiskScore
		: analysis
			? targetRiskScore
			: 0;
	const activeBarCount = analysis
		? Math.max(
				targetRiskScore > 0 ? 1 : 0,
				Math.round((targetRiskScore / 100) * TOTAL_BARS),
			)
		: 0;

	const handleReset = () => {
		setSubject("");
		setBody("");
		setAnalysis(null);
		setAnimatedRiskScore(0);
		setErrorMessage(null);
		setTimeout(() => subjectInputRef.current?.focus(), 50);
	};

	const handleLoadSample = () => {
		setSubject(
			"Urgent: Claim your 100% free bonus before it expires tonight!",
		);
		setBody(
			"Hey there,\n\nThis is a confidential investment proposal exclusively for you. Act now to claim your risk-free payout with zero obligation.\n\nClick here immediately to secure your spot: https://example.com/claim-bonus\n\nDon't miss out on this once in a lifetime offer!\n\nBest regards,\nThe Growth Team",
		);
		setAnalysis(null);
		setAnimatedRiskScore(0);
		setErrorMessage(null);
	};

	const handleCopyPrompt = async () => {
		const detectedWords = analysis?.detectedTriggers?.length
			? Array.from(
					new Set(analysis.detectedTriggers.map((t) => `"${t.word}"`)),
				).join(", ")
			: "detected spam trigger phrases";

		const promptText = `Please rewrite and optimize this email copy to achieve 100% inbox deliverability and remove all spam triggers.

Issues detected:
- Spam trigger words/phrases: ${detectedWords}
- Spam risk score: ${displayedRiskScore}/100

Original Subject Line:
${subject}

Original Email Body:
${body}

Instructions:
1. Rewrite both the subject line and email body to sound natural, compelling, and human-written.
2. Replace all spam triggers and high-pressure phrasing with safe, high-deliverability alternatives.
3. Keep the core messaging, value proposition, and call to action clear.
4. Output the revised Subject Line and revised Email Body.`;

		try {
			await navigator.clipboard.writeText(promptText);
			setCopiedPrompt(true);
			setTimeout(() => setCopiedPrompt(false), 2000);
		} catch (e) {
			console.error("Failed to copy prompt:", e);
		}
	};

	return (
		<div className="mx-auto w-full max-w-4xl font-sans">
			{/* Dashboard Container with Outer Shell */}
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-weak-50 p-0.5 dark:border-white/10 dark:bg-white/[0.03]">
				{/* Top Header: Title & Status - Outside white card, inside grey frame */}
				<div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5">
					<h3 className="font-semibold text-[13.5px] text-text-strong-950 tracking-tight sm:text-[14px] dark:text-white">
						Email Spam Words Checker
					</h3>

					<div
						className={cn(
							"flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium text-[11.5px] transition-colors",
							isAnalyzing &&
								"border border-rose-500/25 bg-rose-500/10 text-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.15)]",
							!isAnalyzing &&
								!analysis &&
								"border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60",
							!isAnalyzing &&
								analysis?.verdict === "inbox_ready" &&
								"border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.12)] dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400",
							!isAnalyzing &&
								analysis?.verdict === "needs_review" &&
								"border border-amber-500/25 bg-amber-500/10 text-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.12)] dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400",
							!isAnalyzing &&
								analysis?.verdict === "high_risk" &&
								"border border-rose-500/25 bg-rose-500/10 text-rose-600 shadow-[0_0_8px_rgba(244,63,94,0.12)] dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400",
						)}
					>
						<span className="relative flex size-2 items-center justify-center">
							{isAnalyzing && (
								<span className="absolute inline-flex size-full rounded-full bg-rose-500 opacity-75 motion-safe:animate-ping" />
							)}
							<span
								className={cn(
									"relative inline-flex size-1.5 rounded-full",
									isAnalyzing && "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)]",
									!isAnalyzing && !analysis && "bg-neutral-400 dark:bg-white/40",
									!isAnalyzing &&
										analysis?.verdict === "inbox_ready" &&
										"bg-emerald-500",
									!isAnalyzing &&
										analysis?.verdict === "needs_review" &&
										"bg-amber-500",
									!isAnalyzing &&
										analysis?.verdict === "high_risk" &&
										"bg-rose-500",
								)}
							/>
						</span>
						<span>
							{isAnalyzing
								? "Scanning"
								: !analysis
									? "Unscanned"
									: analysis.verdict === "inbox_ready"
										? "Inbox Ready"
										: analysis.verdict === "needs_review"
											? `Needs Review (${displayedRiskScore}/100)`
											: `High Risk (${displayedRiskScore}/100)`}
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
						className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start"
					>
						{/* Left Column: Email Subject & Body */}
						<div className="space-y-4">
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
									<span className="font-mono text-[11px] text-text-soft-400 dark:text-white/35">
										{subject.length}/60 chars
									</span>
								</div>

								{analysis || isAnalyzing ? (
									<div className="relative w-full overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 dark:border-white/10 dark:bg-white/[0.03]">
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
													? { duration: SCAN_DURATION_SEC, ease: SCAN_EASING }
													: { duration: 0 }
											}
											className="whitespace-pre-wrap break-words px-3.5 py-2.5 font-mono text-[13px] leading-6 text-text-strong-950 select-text dark:text-white"
										>
											{analysis
												? buildHighlightedContent(
														subject,
														analysis.detectedTriggers,
														"subject",
														true,
													)
												: subject}
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
													? { duration: SCAN_DURATION_SEC, ease: SCAN_EASING }
													: { duration: 0 }
											}
											className="absolute inset-0 z-10 overflow-hidden whitespace-pre-wrap break-words px-3.5 py-2.5 font-mono text-[13px] leading-6 text-text-strong-950 select-text dark:text-white"
										>
											{analysis
												? buildHighlightedContent(
														subject,
														analysis.detectedTriggers,
														"subject",
														false,
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
														duration: SCAN_DURATION_SEC,
														ease: SCAN_EASING,
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
									<div className="relative w-full overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 dark:border-white/10 dark:bg-white/[0.03]">
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
													? { duration: SCAN_DURATION_SEC, ease: SCAN_EASING }
													: { duration: 0 }
											}
											className="min-h-24 whitespace-pre-wrap break-words p-3.5 pb-6 font-mono text-[13px] leading-6 text-text-strong-950 select-text dark:text-white"
										>
											{analysis
												? buildHighlightedContent(
														body,
														analysis.detectedTriggers,
														"body",
														true,
													)
												: body}
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
													? { duration: SCAN_DURATION_SEC, ease: SCAN_EASING }
													: { duration: 0 }
											}
											className="absolute inset-0 z-10 overflow-hidden whitespace-pre-wrap break-words p-3.5 pb-6 font-mono text-[13px] leading-6 text-text-strong-950 select-text dark:text-white"
										>
											{analysis
												? buildHighlightedContent(
														body,
														analysis.detectedTriggers,
														"body",
														false,
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
														duration: SCAN_DURATION_SEC,
														ease: SCAN_EASING,
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
										rows={4}
										value={body}
										onChange={(e) => {
											setBody(e.target.value);
											setErrorMessage(null);
											e.target.style.height = "auto";
											e.target.style.height = `${Math.max(88, e.target.scrollHeight)}px`;
										}}
										placeholder="Paste your email copy here to scan for spam trigger phrases..."
										className="!min-h-[110px] resize-none overflow-hidden text-paragraph-xs leading-normal focus:!ring-primary-base focus:!shadow-button-primary-focus"
									/>
								)}
							</div>
						</div>

						{/* Right Column: Risk Meter & Detected Spam Categories */}
						<div className="space-y-4">
							{/* Risk Meter Visualizer Card */}
							<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 sm:p-3.5 dark:border-white/10 dark:bg-white/[0.02]">
								<div className="relative mb-1 h-5 w-full">
									<motion.div
										key={`risk-label-${scanKey}`}
										initial={{
											left: isAnalyzing ? "0%" : `${targetRiskScore}%`,
											x: isAnalyzing ? "0%" : `-${targetRiskScore}%`,
										}}
										animate={{
											left: `${targetRiskScore}%`,
											x: `-${targetRiskScore}%`,
										}}
										transition={
											isAnalyzing
												? { duration: SCAN_DURATION_SEC, ease: SCAN_EASING }
												: { duration: 0 }
										}
										className="absolute top-0 flex items-baseline whitespace-nowrap font-mono text-[12px] text-text-sub-600 dark:text-white/60"
									>
										risk{" "}
										<strong
											className={cn(
												"ml-1 font-bold text-[16px] leading-none transition-colors duration-150",
												analysis || isAnalyzing
													? displayedRiskScore >= SPAM_THRESHOLD
														? "text-rose-500 dark:text-rose-400"
														: "text-emerald-500 dark:text-emerald-400"
													: "text-text-strong-950 dark:text-white",
											)}
										>
											{displayedRiskScore}
										</strong>
									</motion.div>
								</div>

								{/* Vertical Tick Bars Barcode Graph */}
								<div className="relative flex items-center justify-between gap-[3px] py-0.5 sm:gap-1">
									{/* Base Unfilled Layer */}
									{Array.from({ length: TOTAL_BARS }).map((_, i) => {
										const isPastSpamZone = i >= SPAM_BAR_INDEX;
										return (
											<span
												key={`base-bar-${i}`}
												className={cn(
													"h-7 w-[3.5px] rounded-full transition-colors duration-150 sm:w-[4px]",
													isPastSpamZone
														? "bg-rose-500/15 dark:bg-rose-500/20"
														: "bg-neutral-200/80 dark:bg-white/10",
												)}
											/>
										);
									})}

									{/* Active Revealed Layer: Sweeps in exact sync with top score position */}
									{(analysis || isAnalyzing) && targetRiskScore > 0 && (
										<motion.div
											key={`active-bars-${scanKey}`}
											initial={{
												clipPath: isAnalyzing
													? "inset(0 100% 0 0)"
													: `inset(0 ${Math.max(0, 100 - targetRiskScore)}% 0 0)`,
											}}
											animate={{
												clipPath: `inset(0 ${Math.max(0, 100 - targetRiskScore)}% 0 0)`,
											}}
											transition={
												isAnalyzing
													? { duration: SCAN_DURATION_SEC, ease: SCAN_EASING }
													: { duration: 0 }
											}
											className="pointer-events-none absolute inset-0 flex items-center justify-between gap-[3px] overflow-hidden py-1 sm:gap-1"
										>
											{Array.from({ length: TOTAL_BARS }).map((_, i) => {
												const isPastSpamZone = i >= SPAM_BAR_INDEX;
												const isActive = i < activeBarCount;
												let barColorClass = "opacity-0";

												if (isActive) {
													if (
														isPastSpamZone ||
														targetRiskScore >= SPAM_THRESHOLD
													) {
														barColorClass = "bg-rose-500";
													} else {
														barColorClass = "bg-emerald-500";
													}
												}

												return (
													<span
														key={`active-bar-${i}`}
														className={cn(
															"h-7 w-[3.5px] rounded-full sm:w-[4px]",
															barColorClass,
														)}
													/>
												);
											})}
										</motion.div>
									)}

								</div>

								{/* Scale Labels */}
								<div className="mt-1 flex items-center justify-between font-mono text-[11px] text-text-soft-400 dark:text-white/35">
									<span>inbox safe</span>
									<span className="text-rose-500/90 dark:text-rose-400/90">
										spam folder
									</span>
								</div>
							</div>

							{/* Suggested Replacements Card */}
							<div className="overflow-hidden rounded-[14px] border border-stroke-soft-200 bg-bg-weak-50 p-0.5 dark:border-white/10 dark:bg-white/[0.03]">
								<div className="flex items-center justify-between px-3 pt-2 pb-2">
									<p className="font-mono font-semibold text-[11px] text-text-strong-950 uppercase tracking-wider dark:text-white">
										Suggested Replacements
									</p>
									{analysis &&
										!isAnalyzing &&
										analysis.detectedTriggers.length > 0 && (
											<span className="font-mono text-[11px] text-rose-500 dark:text-rose-400">
												{
													Array.from(
														new Set(
															analysis.detectedTriggers.map((t) =>
																t.word.toLowerCase(),
															),
														),
													).length
												}{" "}
												suggestion(s)
											</span>
										)}
								</div>

								<div className="divide-y divide-stroke-soft-200/50 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3.5 py-1 dark:divide-white/5 dark:border-white/10 dark:bg-[#070707]">
									{isAnalyzing ? (
										<div className="flex items-center gap-2.5 py-3.5 text-rose-500 dark:text-rose-400">
											<LoadingDot
												size={13}
												dotSize={2}
												className="text-rose-500"
											/>
											<span className="font-medium text-xs">
												Analyzing copy for spam trigger phrases...
											</span>
										</div>
									) : analysis ? (
										(() => {
											const uniqueTriggers = Array.from(
												new Map(
													analysis.detectedTriggers.map((t) => [
														t.word.toLowerCase(),
														t,
													]),
												).values(),
											);

											if (uniqueTriggers.length === 0) {
												return (
													<div className="flex items-center gap-2 py-3 text-emerald-600 dark:text-emerald-400">
														<Icon
															name="check-circle"
															className="size-4 shrink-0 text-emerald-500"
														/>
														<span className="font-medium text-xs">
															No spam trigger words detected — content is
															clean!
														</span>
													</div>
												);
											}

											return uniqueTriggers.map((trigger, idx) => {
												const suggestion = getSafeSuggestion(
													trigger.word,
													trigger.category,
												);

												return (
													<div
														key={`sugg-${trigger.word}-${idx}`}
														className="flex items-center justify-between py-2 text-xs"
													>
														<span className="rounded-[4px] border border-rose-500/20 bg-rose-500/[0.08] px-2 py-0.5 font-mono text-[11.5px] text-rose-600 line-through dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400">
															{trigger.word}
														</span>
														<div className="flex items-center gap-1.5 font-mono text-[11.5px]">
															<Icon
																name="arrow-right"
																className="size-3 text-text-soft-400 dark:text-white/40"
															/>
															<span className="rounded-[4px] border border-emerald-500/20 bg-emerald-500/[0.08] px-2 py-0.5 font-medium text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
																{suggestion}
															</span>
														</div>
													</div>
												);
											});
										})()
									) : (
										<div className="flex items-center gap-2.5 py-3.5 text-text-sub-600 dark:text-white/50">
											<Icon
												name="search"
												className="size-3.5 shrink-0 text-text-soft-400 dark:text-white/30"
											/>
											<span className="text-xs">
												Run a scan to view suggested safe replacements.
											</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</form>
				</div>

				{/* Bottom Action Footer - Outside white card, inside grey frame */}
				<div className="flex items-center justify-between px-4 py-3 sm:px-5">
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
						{hasContent ? (
							<button
								type="button"
								onClick={handleReset}
								className="cursor-pointer font-medium text-text-sub-600 text-xs transition-colors hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
							>
								{analysis ? "Clear" : "Clear inputs"}
							</button>
						) : null}
					</div>

					<div className="flex items-center gap-3">
						{!analysis && !isAnalyzing && (
							<button
								type="button"
								onClick={handleLoadSample}
								className="cursor-pointer font-medium text-text-sub-600 text-xs transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
							>
								Load a sample
							</button>
						)}
						{analysis && !isAnalyzing ? (
							<div className="flex items-center gap-2">
								<FancyButton.Root
									type="button"
									variant="basic"
									size="xsmall"
									onClick={handleCopyPrompt}
									className="h-8 px-3 text-[12px]!"
								>
									<FancyButton.Icon
										as={Icon}
										name={copiedPrompt ? "check" : "copy"}
										className={cn(
											"size-3.5",
											copiedPrompt && "text-emerald-500",
										)}
									/>
									<span>
										{copiedPrompt
											? "Prompt copied!"
											: "Copy prompt to fix it"}
									</span>
								</FancyButton.Root>

								<FancyButton.Root
									asChild
									variant="primary"
									size="xsmall"
									className="h-8 px-3.5 text-[12px]!"
								>
									<a
										href="https://cal.com/pranavp/30"
										target="_blank"
										rel="noopener noreferrer"
									>
										<span>Schedule call</span>
										<FancyButton.Icon
											as={Icon}
											name="arrow-right"
											className="size-3.5"
										/>
									</a>
								</FancyButton.Root>
							</div>
						) : (
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
											name="search"
											className="size-3.5"
										/>
										<span>Start Scan</span>
									</>
								)}
							</FancyButton.Root>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
