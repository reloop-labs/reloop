"use client";

import {
	ToolTopBar,
	ToolUpsell,
} from "@reloop/web/components/landing/tools/tool-chrome";
import Link from "next/link";
import { useMemo, useState } from "react";

const SPAM_TRIGGERS = [
	"free",
	"winner",
	"urgent",
	"act now",
	"click here",
	"100%",
	"!!!",
	"guarantee",
	"no obligation",
	"cash",
];

export function DeliverabilityTesterPageView() {
	const [content, setContent] = useState("");
	const [subject, setSubject] = useState("");

	const analysis = useMemo(() => {
		const body = content.toLowerCase();
		const subj = subject.toLowerCase();
		const combined = `${subj} ${body}`;
		let score = 10;
		const issues: string[] = [];

		for (const word of SPAM_TRIGGERS) {
			if (combined.includes(word)) {
				score -= 0.8;
				issues.push(`Spam trigger: "${word}"`);
			}
		}

		const links = (content.match(/https?:\/\//g) ?? []).length;
		if (links > 5) {
			score -= 1.5;
			issues.push(`Too many links (${links})`);
		}

		if (subject.length > 60) {
			score -= 0.5;
			issues.push("Subject line over 60 characters");
		}

		if (content.length < 80) {
			score -= 0.5;
			issues.push("Body may be too short");
		}

		if (content.includes("ALL CAPS") || /[A-Z]{8,}/.test(content)) {
			score -= 1;
			issues.push("Excessive capitalization");
		}

		score = Math.max(0, Math.min(10, score));
		const rounded = Math.round(score * 10) / 10;

		return {
			score: rounded,
			issues,
			grade: rounded >= 8 ? "Good" : rounded >= 5 ? "Review" : "High spam risk",
		};
	}, [content, subject]);

	const scoreColor =
		analysis.score >= 8
			? "text-emerald-500"
			: analysis.score >= 5
				? "text-amber-500"
				: "text-red-500";

	return (
		<div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
			<ToolTopBar
				accent="blue"
				breadcrumb={[
					{ label: "Tools", href: "/tools" },
					{ label: "Deliverability", href: "/tools/deliverability-tester" },
				]}
				title="Email Deliverability Tester"
				subtitle="Paste your subject and body to get a spam score and checklist—like Mail-Tester and GlockApps pre-send checks."
			/>

			<div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px]">
				<div className="space-y-4">
					<label className="block font-medium text-[14px]">Subject line</label>
					<input
						value={subject}
						onChange={(e) => setSubject(e.target.value)}
						placeholder="Your email subject…"
						className="h-11 w-full rounded-lg border border-stroke-soft-200 px-4 text-[15px] dark:border-white/10 dark:bg-black"
					/>
					<label className="block font-medium text-[14px]">
						Email body (HTML or text)
					</label>
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						rows={14}
						placeholder="Paste email content here…"
						className="w-full rounded-lg border border-stroke-soft-200 px-4 py-3 font-mono text-[13px] dark:border-white/10 dark:bg-black"
					/>
				</div>

				<div className="lg:sticky lg:top-24 lg:self-start">
					<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-6 text-center dark:border-white/10 dark:bg-white/[0.03]">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/55">
							Spam score
						</p>
						<p className={`mt-2 font-bold text-6xl ${scoreColor}`}>
							{content || subject ? analysis.score : "—"}
							<span className="text-2xl text-text-sub-600 dark:text-white/30">
								/10
							</span>
						</p>
						<p className="mt-2 font-semibold text-[15px] text-text-strong-950 dark:text-white">
							{content || subject ? analysis.grade : "Add content to analyze"}
						</p>
						{(content || subject) && (
							<ul className="mt-6 space-y-2 text-left text-[13px] text-text-sub-600 dark:text-white/50">
								{analysis.issues.length === 0 ? (
									<li className="text-emerald-600 dark:text-emerald-400">
										No major spam triggers detected.
									</li>
								) : (
									analysis.issues.map((issue) => (
										<li key={issue} className="flex gap-2">
											<span className="text-amber-500">•</span>
											{issue}
										</li>
									))
								)}
							</ul>
						)}
					</div>
					<p className="mt-4 text-[12px] text-text-sub-600 dark:text-white/35">
						For inbox placement tests, use{" "}
						<Link href="/features/deliverability" className="text-primary-base">
							Reloop deliverability tools
						</Link>
						.
					</p>
				</div>
			</div>

			<ToolUpsell
				title="Test before you send campaigns"
				description="Run spam checks and monitor reputation inside Reloop."
				primaryHref="/dashboard/signup"
				primaryLabel="Try Reloop free"
				secondaryHref="/tools/auth-checker"
				secondaryLabel="Check SPF/DKIM"
			/>
		</div>
	);
}
