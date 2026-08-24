"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import React, { useMemo, useRef, useState } from "react";
import {
	type DetectedTrigger,
	type TriggerCategory,
	CATEGORY_META,
	calculateSpamScore,
} from "./check-api";

const PRESETS = [
	{
		label: "Clean Transactional",
		subject: "Your Reloop API key has been rotated",
		body: `Hi Alex,\n\nYour organization API key "Production Mailer" was rotated on August 22, 2026 at 11:45 UTC by security-admin.\n\nIf you initiated this change, no further action is required.\n\nYou can review your active API keys in the dashboard:\nhttps://reloop.sh/dashboard/settings/api-keys\n\nBest regards,\nThe Reloop Security Team`,
	},
	{
		label: "Cold Sales Outreach",
		subject: "Quick question about your email deliverability",
		body: `Hey Sarah,\n\nNoticed you're scaling outreach at Acme Corp. We built Reloop to help teams send high-volume transactional and marketing emails with automated DKIM verification.\n\nWould you be open to a 10-minute chat this Thursday to see if we can improve your email bounce rates?\n\nIf not interested, feel free to let me know.\nhttps://reloop.sh/opt-out`,
	},
	{
		label: "Phishing / Scam Sample",
		subject: "Confidential investment proposal",
		body: `Dear friend,\n\nI am a Financial Consultant in control of privately owned funds placed for long term investments.\n\nMy client intends to invest these funds in projects. I am willing to finance projects at a guaranteed 5% ROI per annum for projects ranging from 2 years term and above but not exceeding 12 years.\n\nPlease answer ASAP.`,
	},
];

const VERDICT_STYLES = {
	inbox_ready: {
		badge: "bg-success-lighter text-success-base dark:bg-emerald-500/10 dark:text-emerald-400",
		accent: "bg-success-base",
		icon: "shield-check",
		ratingLabel: "Excellent",
	},
	needs_review: {
		badge: "bg-warning-lighter text-warning-base dark:bg-amber-500/10 dark:text-amber-400",
		accent: "bg-warning-base",
		icon: "alert-triangle",
		ratingLabel: "Needs Review",
	},
	high_risk: {
		badge: "bg-error-lighter text-error-base dark:bg-rose-500/10 dark:text-rose-400",
		accent: "bg-error-base",
		icon: "cross-circle",
		ratingLabel: "Poor (Spam Risk)",
	},
};

/**
 * Builds the backdrop highlight text with colored marks behind flagged words.
 */
function buildBackdropNodes(
	text: string,
	triggers: DetectedTrigger[],
	context: "subject" | "body",
) {
	const relevantTriggers = triggers.filter((t) => t.context === context);
	if (relevantTriggers.length === 0) {
		return text ? <span>{text}</span> : null;
	}

	const sorted = [...relevantTriggers].sort((a, b) => a.startIndex - b.startIndex);
	const nodes: React.ReactNode[] = [];
	let lastIndex = 0;

	for (let i = 0; i < sorted.length; i++) {
		const trigger = sorted[i]!;
		if (trigger.startIndex < lastIndex) continue;

		if (trigger.startIndex > lastIndex) {
			nodes.push(text.slice(lastIndex, trigger.startIndex));
		}

		nodes.push(
			<mark
				key={`m-${context}-${i}-${trigger.startIndex}`}
				className={cn(
					"rounded-sm text-transparent py-0.5",
					trigger.category === "urgency" && "bg-rose-500/25 dark:bg-rose-500/40",
					trigger.category === "shady" && "bg-rose-500/25 dark:bg-rose-500/40",
					trigger.category === "overpromise" && "bg-amber-500/25 dark:bg-amber-500/40",
					trigger.category === "money" && "bg-purple-500/25 dark:bg-purple-500/40",
					trigger.category === "outreach" && "bg-slate-500/25 dark:bg-slate-500/40",
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

	return nodes;
}

export function CheckerPanel() {
	const [subject, setSubject] = useState(PRESETS[2]!.subject);
	const [body, setBody] = useState(PRESETS[2]!.body);
	const [copied, setCopied] = useState(false);
	const [isFixing, setIsFixing] = useState(false);

	const bodyBackdropRef = useRef<HTMLDivElement>(null);
	const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
	const subjectBackdropRef = useRef<HTMLDivElement>(null);
	const subjectInputRef = useRef<HTMLInputElement>(null);

	// Synchronously calculate spam score and detected triggers
	const analysis = useMemo(() => {
		return calculateSpamScore(subject, body);
	}, [subject, body]);

	const verdictStyle = VERDICT_STYLES[analysis.verdict] || VERDICT_STYLES.inbox_ready;

	const handleCopyReport = () => {
		const reportText = `[Reloop Spam Score Report]\nScore: ${analysis.score}/100 (Grade ${analysis.grade})\nVerdict: ${analysis.verdictLabel}\nSubject: "${subject}"\nWord Count: ${analysis.metrics.wordCount} words\nSpam Triggers Detected: ${analysis.detectedTriggers.length}\nIssues: ${analysis.issues.length > 0 ? analysis.issues.map((i) => i.title).join(", ") : "None"}\nTested free at https://reloop.sh/tools/spam-score-checker`;

		navigator.clipboard.writeText(reportText).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2500);
		});
	};

	const handleAiFix = async () => {
		setIsFixing(true);
		try {
			const res = await fetch("/api/tools/fix-spam-copy", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					subject,
					body,
					triggers: analysis.detectedTriggers.map((t) => t.word),
				}),
			});

			if (res.ok) {
				const data = await res.json();
				if (data.subject) setSubject(data.subject);
				if (data.body) setBody(data.body);
			}
		} finally {
			setIsFixing(false);
		}
	};

	return (
		<div className="mx-auto max-w-5xl">
			{/* Preset buttons */}
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap items-center gap-2">
					<span className="font-mono text-[11px] text-text-soft-400 uppercase tracking-[0.14em] dark:text-white/35">
						Try Presets:
					</span>
					{PRESETS.map((preset) => (
						<button
							key={preset.label}
							type="button"
							onClick={() => {
								setSubject(preset.subject);
								setBody(preset.body);
							}}
							className={cn(
								"rounded-lg border px-3 py-1 font-mono text-[12px] transition-colors",
								subject === preset.subject
									? "border-text-strong-950 bg-bg-weak-50 text-text-strong-950 font-medium dark:border-white dark:bg-white/10 dark:text-white"
									: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:border-text-strong-950 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white dark:hover:text-white",
							)}
						>
							{preset.label}
						</button>
					))}
				</div>

				{/* AI Fix button */}
				{analysis.detectedTriggers.length > 0 && (
					<button
						type="button"
						onClick={handleAiFix}
						disabled={isFixing}
						className="inline-flex items-center gap-2 rounded-xl bg-bg-strong-950 px-3.5 py-1.5 font-mono text-[12px] font-medium text-white shadow-xs transition-colors hover:bg-bg-surface-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/90"
					>
						<Icon name="magic-wand" className="size-3.5" />
						{isFixing ? "Rewriting with AI..." : "Fix Copy with AI"}
					</button>
				)}
			</div>

			{/* Main Grid: Live Inline Highlighted Editor on Left, Scores & Categories on Right */}
			<div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
				{/* Left Column: Email Workspace with Synchronized Inline Highlights */}
				<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
					<div className="space-y-5 p-5 sm:p-6">
						{/* Subject Line Input with Inline Highlights */}
						<div>
							<div className="mb-1.5 flex items-center justify-between">
								<label
									htmlFor="subject-input"
									className="font-medium text-[13px] text-text-strong-950 dark:text-white"
								>
									Subject Line
								</label>
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

							<div className="relative w-full overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50 transition-all focus-within:border-text-strong-950 focus-within:ring-1 focus-within:ring-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-white dark:focus-within:ring-white">
								{/* Backdrop highlight layer */}
								<div
									ref={subjectBackdropRef}
									aria-hidden="true"
									className="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-4 font-sans text-[14px] leading-normal text-transparent select-none whitespace-pre"
								>
									{buildBackdropNodes(subject, analysis.detectedTriggers, "subject")}
								</div>

								{/* Real editable input on top */}
								<input
									id="subject-input"
									ref={subjectInputRef}
									type="text"
									value={subject}
									onChange={(e) => setSubject(e.target.value)}
									onScroll={(e) => {
										if (subjectBackdropRef.current) {
											subjectBackdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
										}
									}}
									placeholder="e.g. Your monthly analytics report is ready"
									className="relative z-10 block h-11 w-full bg-transparent px-4 font-sans text-[14px] leading-normal text-text-strong-950 outline-none placeholder:text-text-soft-400 dark:text-white dark:placeholder:text-white/30"
								/>
							</div>
						</div>

						{/* Email Body Textarea with Synchronized Inline Highlights */}
						<div>
							<div className="mb-1.5 flex items-center justify-between">
								<label
									htmlFor="body-input"
									className="font-medium text-[13px] text-text-strong-950 dark:text-white"
								>
									Email Body Copy
								</label>
								<span className="font-mono text-[11px] text-text-soft-400 dark:text-white/35">
									{analysis.metrics.wordCount} words · {analysis.metrics.linkCount} link(s)
								</span>
							</div>

							<div className="relative w-full rounded-xl border border-stroke-soft-200 bg-bg-weak-50 transition-all focus-within:border-text-strong-950 focus-within:ring-1 focus-within:ring-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-white dark:focus-within:ring-white">
								{/* Backdrop highlight layer */}
								<div
									ref={bodyBackdropRef}
									aria-hidden="true"
									className="pointer-events-none absolute inset-0 overflow-hidden p-4 font-sans text-[14px] leading-[1.65] text-transparent select-none whitespace-pre-wrap break-words"
								>
									{buildBackdropNodes(body, analysis.detectedTriggers, "body")}
								</div>

								{/* Real editable textarea on top */}
								<textarea
									id="body-input"
									ref={bodyTextareaRef}
									rows={9}
									value={body}
									onChange={(e) => setBody(e.target.value)}
									onScroll={(e) => {
										if (bodyBackdropRef.current) {
											bodyBackdropRef.current.scrollTop = e.currentTarget.scrollTop;
										}
									}}
									placeholder="Paste your email copy here to scan for spam trigger phrases..."
									className="relative z-10 block min-h-[220px] w-full resize-y bg-transparent p-4 font-sans text-[14px] leading-[1.65] text-text-strong-950 outline-none placeholder:text-text-soft-400 dark:text-white dark:placeholder:text-white/30"
								/>
							</div>
						</div>

						{/* Footer Helper */}
						<div className="flex items-center justify-between border-t border-stroke-soft-200/60 pt-3 dark:border-white/10">
							<button
								type="button"
								onClick={() => {
									setSubject("");
									setBody("");
								}}
								className="font-mono text-[11px] text-text-soft-400 transition-colors hover:text-text-strong-950 dark:text-white/35 dark:hover:text-white"
							>
								Clear text
							</button>

							<div className="flex items-center gap-3 font-mono text-[11px] text-text-soft-400 dark:text-white/35">
								<span>
									{analysis.detectedTriggers.length} trigger(s) highlighted
								</span>
								<span>·</span>
								<span>Est. read time: ~{analysis.metrics.readingTimeSec}s</span>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column: Score, Category Counts & Breakdown */}
				<div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
					<div className="border-stroke-soft-200 border-b p-5 sm:p-6 dark:border-white/10">
						{/* Overall Score & Rating */}
						<div className="flex items-start justify-between gap-4">
							<div>
								<span className="font-mono text-[11px] text-text-soft-400 uppercase tracking-[0.14em] dark:text-white/35">
									Deliverability Score
								</span>
								<div className="mt-1 flex items-baseline gap-2">
									<span className="font-bold text-[3rem] text-text-strong-950 leading-none tracking-tight sm:text-[3.25rem] dark:text-white">
										{analysis.score}
									</span>
									<span className="font-mono text-[16px] text-text-soft-400 dark:text-white/35">
										/100
									</span>
									<span className="ml-1 rounded-md bg-bg-weak-50 px-2 py-0.5 font-mono font-semibold text-[12px] text-text-strong-950 dark:bg-white/10 dark:text-white">
										Grade {analysis.grade}
									</span>
								</div>
							</div>

							<div
								className={cn(
									"inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium",
									verdictStyle.badge,
								)}
							>
								<Icon name={verdictStyle.icon} className="size-4 shrink-0" />
								{verdictStyle.ratingLabel}
							</div>
						</div>

						{/* Detected Categories List */}
						<div className="mt-5 space-y-2">
							<span className="block font-mono text-[11px] text-text-soft-400 uppercase tracking-[0.14em] dark:text-white/35">
								Detected Spam Categories
							</span>

							<div className="space-y-1.5">
								{(Object.keys(CATEGORY_META) as TriggerCategory[]).map((cat) => {
									const meta = CATEGORY_META[cat];
									const count = analysis.categoryCounts[cat] || 0;

									return (
										<div
											key={cat}
											className={cn(
												"flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-[13px] transition-colors",
												count > 0
													? "border-stroke-soft-200 bg-bg-weak-50 font-medium text-text-strong-950 dark:border-white/15 dark:bg-white/10 dark:text-white"
													: "border-stroke-soft-200/40 bg-transparent text-text-soft-400 dark:border-white/5 dark:text-white/25",
											)}
										>
											<div className="flex items-center gap-2.5">
												<Icon
													name={meta.icon}
													className={cn(
														"size-4 shrink-0",
														count > 0 ? "text-text-strong-950 dark:text-white" : "text-text-soft-400 dark:text-white/20",
													)}
												/>
												<span>{meta.label}</span>
											</div>
											<span className="font-mono font-semibold">({count})</span>
										</div>
									);
								})}
							</div>
						</div>

						{/* Breakdown Bars */}
						<div className="mt-5 space-y-2.5">
							<div>
								<div className="mb-1 flex justify-between font-mono text-[11px] text-text-sub-600 dark:text-white/50">
									<span>Subject Health</span>
									<span>{analysis.breakdown.subjectScore}/25</span>
								</div>
								<div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-weak-50 dark:bg-white/10">
									<div
										className="h-full rounded-full bg-text-strong-950 dark:bg-white transition-all duration-300"
										style={{ width: `${(analysis.breakdown.subjectScore / 25) * 100}%` }}
									/>
								</div>
							</div>

							<div>
								<div className="mb-1 flex justify-between font-mono text-[11px] text-text-sub-600 dark:text-white/50">
									<span>Content &amp; Trigger Words</span>
									<span>{analysis.breakdown.contentScore}/35</span>
								</div>
								<div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-weak-50 dark:bg-white/10">
									<div
										className="h-full rounded-full bg-text-strong-950 dark:bg-white transition-all duration-300"
										style={{ width: `${(analysis.breakdown.contentScore / 35) * 100}%` }}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="p-5 sm:p-6">
						<div className="flex items-center gap-3">
							<button
								type="button"
								onClick={handleCopyReport}
								className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3.5 py-2.5 font-medium text-[13px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
							>
								<Icon name={copied ? "check" : "copy"} className="size-3.5" />
								{copied ? "Report Copied!" : "Copy Report"}
							</button>

							<Link
								href="/dashboard/signup"
								className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-bg-strong-950 px-3.5 py-2.5 font-medium text-[13px] text-text-white-0 transition-colors hover:bg-bg-surface-800 dark:bg-white dark:text-black dark:hover:bg-white/90"
							>
								<span>Send with Reloop</span>
								<Icon name="arrow-right" className="size-3.5" />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
