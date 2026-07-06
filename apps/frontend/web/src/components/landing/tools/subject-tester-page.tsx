"use client";

import {
	ToolTopBar,
	ToolUpsell,
} from "@reloop/web/components/landing/tools/tool-chrome";
import { useMemo, useState } from "react";

export function SubjectTesterPageView() {
	const [subject, setSubject] = useState("");

	const analysis = useMemo(() => {
		const len = subject.length;
		let score = 100;
		const tips: string[] = [];

		if (len === 0)
			return { score: 0, len, tips: ["Enter a subject line"], preview: "" };

		if (len > 60) {
			score -= 25;
			tips.push("May truncate on mobile (over 60 chars)");
		} else if (len >= 40 && len <= 60) {
			tips.push("Good length for most inboxes");
		}

		if (len < 10) {
			score -= 15;
			tips.push("Subject may be too short to be clear");
		}

		if (subject === subject.toUpperCase() && len > 4) {
			score -= 30;
			tips.push("ALL CAPS can hurt open rates");
		}

		if (/!{2,}/.test(subject)) {
			score -= 20;
			tips.push("Multiple exclamation marks look spammy");
		}

		if (/free|urgent|winner|act now/i.test(subject)) {
			score -= 15;
			tips.push("Contains common spam trigger words");
		}

		const preview = len > 60 ? `${subject.slice(0, 57)}…` : subject;

		return { score: Math.max(0, score), len, tips, preview };
	}, [subject]);

	const barColor =
		analysis.score >= 80
			? "bg-emerald-500"
			: analysis.score >= 50
				? "bg-amber-500"
				: "bg-red-500";

	return (
		<div className="min-h-screen bg-gradient-to-b from-rose-50 to-white dark:from-[#1a0a10] dark:to-black">
			<ToolTopBar
				accent="rose"
				breadcrumb={[
					{ label: "Tools", href: "/tools" },
					{ label: "Subject Tester", href: "/tools/subject-tester" },
				]}
				title="Email Subject Line Tester"
				subtitle="Score your subject line for length, clarity, and spam words—like CoSchedule and Omnisend headline tools."
			/>

			<div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
				<div className="rounded-2xl border border-rose-100 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#111]">
					<label
						htmlFor="subject"
						className="font-semibold text-[14px] text-text-strong-950 dark:text-white"
					>
						Subject line
					</label>
					<input
						id="subject"
						value={subject}
						onChange={(e) => setSubject(e.target.value)}
						placeholder="e.g. Your order has shipped"
						className="mt-3 h-14 w-full rounded-xl border border-stroke-soft-200 px-4 text-[18px] dark:border-white/10 dark:bg-black"
					/>

					<div className="mt-6">
						<div className="mb-2 flex justify-between text-[13px] text-text-sub-600 dark:text-white/45">
							<span>Score</span>
							<span>
								{analysis.score}/100 · {analysis.len} characters
							</span>
						</div>
						<div className="h-3 overflow-hidden rounded-full bg-bg-weak-50 dark:bg-white/10">
							<div
								className={`h-full rounded-full transition-all ${barColor}`}
								style={{ width: `${analysis.score}%` }}
							/>
						</div>
					</div>

					<div className="mt-8 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-4 dark:border-white/10 dark:bg-black">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
							Inbox preview
						</p>
						<p className="mt-2 font-medium text-[15px] text-text-strong-950 dark:text-white">
							{analysis.preview || "Your subject preview appears here"}
						</p>
						<p className="mt-1 text-[13px] text-text-sub-600 dark:text-white/40">
							Acme Inc · Preview text snippet…
						</p>
					</div>

					{analysis.tips.length > 0 && (
						<ul className="mt-6 space-y-2 text-[14px] text-text-sub-600 dark:text-white/55">
							{analysis.tips.map((tip) => (
								<li key={tip}>• {tip}</li>
							))}
						</ul>
					)}
				</div>
			</div>

			<ToolUpsell
				title="A/B test subjects in Reloop"
				description="Track open rates and compare subject lines across campaigns."
				primaryHref="/dashboard/signup"
				primaryLabel="Start free"
				secondaryHref="/features/email-analytics"
				secondaryLabel="Email analytics"
			/>
		</div>
	);
}
