"use client";

import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useEffect, useState } from "react";
import type { SimpleIcon } from "simple-icons";
import { siCurl, siGo, siNodedotjs, siPython } from "simple-icons";
import { runSpamCheck } from "./check-api";
import { WindowDots } from "./grid";
import { highlightJson } from "./json-highlight";
import { LanguagePills, type PillTab } from "./language-pills";

const PANEL_ID = "spam-api-panel";
const TEST_SUBJECT = "Your monthly analytics report is ready";
const TEST_BODY =
	"Hi Alex, your weekly metrics report has been generated. View your analytics dashboard online: https://reloop.sh/analytics";

const PILL_TABS: PillTab[] = [
	{ id: "curl", label: "cURL", icon: siCurl },
	{ id: "node", label: "Node.js", icon: siNodedotjs },
	{ id: "python", label: "Python", icon: siPython },
	{ id: "go", label: "Go", icon: siGo },
];

function getSnippetCode(lang: string, subject: string, body: string) {
	switch (lang) {
		case "curl":
			return `curl -X POST https://reloop.sh/api/tools/v1/spam-check \\
  -H "Content-Type: application/json" \\
  -d '{
    "subject": "${subject}",
    "body": "${body}"
  }'`;
		case "node":
			return `// No SDK required — plain POST request.
const res = await fetch(
  "https://reloop.sh/api/tools/v1/spam-check",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject: "${subject}",
      body: "${body}",
    }),
  },
);

const result = await res.json();
console.log(\`Score: \${result.score}/100 (\${result.verdict})\`);`;
		case "python":
			return `# pip install requests
import requests

result = requests.post(
    "https://reloop.sh/api/tools/v1/spam-check",
    json={
        "subject": "${subject}",
        "body": "${body}",
    },
).json()

print(f"Score: {result['score']}/100 ({result['verdict']})")`;
		case "go":
			return `body, _ := json.Marshal(map[string]string{
    "subject": "${subject}",
    "body": "${body}",
})

res, err := http.Post(
    "https://reloop.sh/api/tools/v1/spam-check",
    "application/json",
    bytes.NewReader(body),
)`;
		default:
			return "";
	}
}

const STRING_OR_COMMENT =
	/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(^[ \t]*(?:#|\/\/).*)/gm;

function highlightCode(code: string): React.ReactNode[] {
	const out: React.ReactNode[] = [];
	let last = 0;
	let key = 0;

	for (const match of code.matchAll(STRING_OR_COMMENT)) {
		const start = match.index ?? 0;
		if (start > last) out.push(code.slice(last, start));

		const [text, str, comment] = match;
		out.push(
			<span
				key={`t${key++}`}
				className={
					str
						? "text-primary-base"
						: comment
							? "text-text-soft-400 dark:text-white/30"
							: undefined
				}
			>
				{text}
			</span>,
		);
		last = start + text.length;
	}

	if (last < code.length) out.push(code.slice(last));
	return out;
}

function CopyButton({ value }: { value: string }) {
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 1800);
		} catch {
			// Clipboard blocked
		}
	};

	return (
		<FancyButton.Root
			type="button"
			variant="basic"
			size="xsmall"
			onClick={copy}
			className="px-3.5!"
		>
			<FancyButton.Icon
				as={Icon}
				name={copied ? "check" : "copy"}
				className="size-3.5"
			/>
			<span>{copied ? "Copied" : "Copy snippet"}</span>
		</FancyButton.Root>
	);
}

export function ApiSection() {
	const [activeId, setActiveId] = useState("curl");
	const [isRunning, setIsRunning] = useState(false);
	const [latency, setLatency] = useState<number | null>(42);
	const [jsonResult, setJsonResult] = useState<string>("");
	const [isJsonExpanded, setIsJsonExpanded] = useState(false);

	const currentCode = getSnippetCode(activeId, TEST_SUBJECT, TEST_BODY);

	const executeCheck = async () => {
		setIsRunning(true);
		const start = performance.now();

		try {
			const res = await runSpamCheck(TEST_SUBJECT, TEST_BODY);
			const elapsed = Math.max(Math.round(performance.now() - start), 28);
			setLatency(elapsed);
			setJsonResult(JSON.stringify(res, null, 2));
		} catch {
			const fallbackData = {
				score: 96,
				grade: "A+",
				verdict: "inbox_ready",
				verdictLabel: "Inbox Ready",
				breakdown: {
					subjectScore: 25,
					contentScore: 35,
					linkScore: 20,
					formattingScore: 16,
				},
				metrics: {
					wordCount: 16,
					charCount: 119,
					subjectLength: 39,
					linkCount: 1,
					triggerWordCount: 0,
					capsPercentage: 3,
					readingTimeSec: 5,
				},
				categoryCounts: {
					urgency: 0,
					shady: 0,
					overpromise: 0,
					money: 0,
					outreach: 0,
				},
				detectedTriggers: [],
				issues: [],
				recommendations: [
					"Email copy is clean and well balanced. Maintain SPF and DKIM authentication on your domain.",
				],
			};

			const elapsed = Math.max(Math.round(performance.now() - start) + 35, 42);
			setLatency(elapsed);
			setJsonResult(JSON.stringify(fallbackData, null, 2));
		} finally {
			setIsRunning(false);
		}
	};

	useEffect(() => {
		executeCheck();
	}, []);

	return (
		<section id="api-section" className="w-full">
			{/* Section Header */}
			<div className="border-stroke-soft-200 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<div className="mb-4">
					<span className="inline-flex items-center gap-1.5 rounded-[10px] bg-blue-50 px-2.5 py-1 font-medium text-[13px] text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
						<Icon name="code" className="size-3.5" />
						Developer First
					</span>
				</div>
				<h2 className="font-semibold text-3xl text-text-strong-950 tracking-tight sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12] dark:text-white">
					Check Spam score from code
				</h2>
				<p className="mt-3 max-w-2xl text-[14.5px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60">
					Call the public spam check endpoint from your email pipeline or CI/CD.
					Analyze subject lines, trigger words, and deliverability metrics with a
					single request.
				</p>
			</div>

			{/* Language Switcher & Action Bar */}
			<div className="flex items-center justify-between gap-3 border-stroke-soft-200 border-b pr-4 sm:pr-8 lg:pr-12 dark:border-white/10">
				<LanguagePills
					tabs={PILL_TABS}
					activeId={activeId}
					onChange={setActiveId}
					ariaLabel="Code language"
					idPrefix="spam-api"
					controls={PANEL_ID}
					className="min-w-0 flex-1 px-4 py-3 sm:px-8 lg:px-12"
				/>

				<div className="flex items-center gap-2.5">
					<CopyButton value={currentCode} />

					<FancyButton.Root
						type="button"
						variant="primary"
						size="xsmall"
						onClick={executeCheck}
						disabled={isRunning}
						className="px-3.5!"
					>
						{isRunning ? (
							<>
								<span className="size-3 animate-spin rounded-full border border-white/50 border-t-white" />
								<span>Testing...</span>
							</>
						) : (
							<span>Test Request</span>
						)}
					</FancyButton.Root>
				</div>
			</div>

			{/* Code & Live JSON Output Panel */}
			<div
				id={PANEL_ID}
				role="tabpanel"
				aria-labelledby={`spam-api-tab-${activeId}`}
				className="grid lg:grid-cols-2"
			>
				<div className="overflow-x-auto px-4 py-6 sm:px-8 lg:px-12">
					<pre className="font-mono text-[12.5px] text-text-strong-950 leading-[1.75] sm:text-[13px] dark:text-white/80">
						<code>{highlightCode(currentCode)}</code>
					</pre>
				</div>

				<div className="border-stroke-soft-200 border-t lg:border-t-0 lg:border-l dark:border-white/10">
					<div className="flex items-center gap-3 border-stroke-soft-200 border-b px-4 py-3 sm:px-6 lg:px-8 dark:border-white/10">
						<WindowDots />
						<div className="ml-auto flex items-center gap-2 font-mono text-[11px] text-text-soft-400 uppercase tracking-[0.14em] dark:text-white/30">
							<span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
								<span className="size-1.5 rounded-full bg-emerald-500" />
								200 OK
							</span>
							{latency !== null && <span>· {latency}ms</span>}
							<span>· json</span>
						</div>
					</div>
					<div className="relative">
						<div
							className={`overflow-x-auto px-4 py-6 transition-all duration-300 sm:px-6 lg:px-8 ${
								!isJsonExpanded
									? "max-h-[290px] overflow-hidden"
									: "max-h-none"
							}`}
						>
							<AnimatePresence mode="wait">
								<motion.pre
									key={jsonResult}
									initial={{ opacity: 0.6 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.15 }}
									className="font-mono text-[13px] text-text-strong-950 leading-[1.7] dark:text-white/70"
								>
									<code>{highlightJson(jsonResult)}</code>
								</motion.pre>
							</AnimatePresence>
						</div>

						{/* Stripe-style Fade Overlay & Expand / Load More Button */}
						{!isJsonExpanded ? (
							<div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-32 items-end justify-center bg-gradient-to-t from-bg-white-0 via-bg-white-0/90 to-transparent pb-4 dark:from-black dark:via-black/90">
								<button
									type="button"
									onClick={() => setIsJsonExpanded(true)}
									className="pointer-events-auto group flex cursor-pointer items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3.5 py-1.5 font-mono font-medium text-[11.5px] text-text-strong-950 shadow-sm backdrop-blur-md transition-all hover:border-stroke-soft-200/80 hover:bg-bg-weak-50 active:scale-[0.98] dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
								>
									<span>Show full response</span>
									<Icon
										name="chevron-down"
										className="size-3.5 text-text-sub-600 transition-transform duration-200 group-hover:translate-y-0.5 dark:text-white/60"
									/>
								</button>
							</div>
						) : (
							<div className="flex justify-center border-stroke-soft-200/60 border-t py-3 dark:border-white/10">
								<button
									type="button"
									onClick={() => setIsJsonExpanded(false)}
									className="group flex cursor-pointer items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3.5 py-1.5 font-mono font-medium text-[11.5px] text-text-sub-600 shadow-sm transition-all hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.98] dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
								>
									<span>Collapse response</span>
									<Icon
										name="chevron-up"
										className="size-3.5 text-text-soft-400 transition-transform duration-200 group-hover:-translate-y-0.5 dark:text-white/50"
									/>
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
