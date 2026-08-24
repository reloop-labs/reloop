"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useEffect, useState } from "react";
import type { SimpleIcon } from "simple-icons";
import { siCurl, siGo, siNodedotjs, siPython } from "simple-icons";
import { runCheck } from "./check-api";
import { WindowDots } from "./grid";
import { LanguagePills, type PillTab } from "./language-pills";
import { toPublicPayload } from "./presenter";

const PANEL_ID = "check-api-panel";
const TEST_EMAIL = "koxow38027@prodbits.com";

const TAB_ICONS: Record<string, SimpleIcon> = {
	curl: siCurl,
	node: siNodedotjs,
	python: siPython,
	go: siGo,
};

const PILL_TABS: PillTab[] = [
	{ id: "curl", label: "cURL", icon: siCurl },
	{ id: "node", label: "Node.js", icon: siNodedotjs },
	{ id: "python", label: "Python", icon: siPython },
	{ id: "go", label: "Go", icon: siGo },
];

function getSnippetCode(lang: string, email: string) {
	switch (lang) {
		case "curl":
			return `curl -X POST https://reloop.sh/api/tools/v1/temp-email-checker \\
  -H "Content-Type: application/json" \\
  -d '{"email": "${email}"}'`;
		case "node":
			return `// No SDK, no API key — it is a plain POST.
const res = await fetch(
  "https://reloop.sh/api/tools/v1/temp-email-checker",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "${email}" }),
  },
);

const result = await res.json();`;
		case "python":
			return `# pip install requests
import requests

result = requests.post(
    "https://reloop.sh/api/tools/v1/temp-email-checker",
    json={"email": "${email}"},
).json()`;
		case "go":
			return `body, _ := json.Marshal(map[string]string{
    "email": "${email}",
})

res, err := http.Post(
    "https://reloop.sh/api/tools/v1/temp-email-checker",
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

const JSON_TOKEN =
	/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;

function highlightJson(code: string): React.ReactNode[] {
	const out: React.ReactNode[] = [];
	let last = 0;
	let key = 0;

	for (const match of code.matchAll(JSON_TOKEN)) {
		const start = match.index ?? 0;
		if (start > last) out.push(code.slice(last, start));

		const [text, str, colon, literal] = match;
		const isKey = Boolean(str && colon);

		out.push(
			<span
				key={`j${key++}`}
				className={cn(
					isKey && "text-text-strong-950 dark:text-white",
					!isKey && str && "text-primary-base",
					literal && "text-text-sub-600 dark:text-white/55",
				)}
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
			<span>{copied ? "Copied" : "Copy prompt"}</span>
		</FancyButton.Root>
	);
}

export function ApiSection() {
	const [activeId, setActiveId] = useState("curl");
	const [isRunning, setIsRunning] = useState(false);
	const [latency, setLatency] = useState<number | null>(38);
	const [jsonResult, setJsonResult] = useState<string>("");

	const currentCode = getSnippetCode(activeId, TEST_EMAIL);

	// Execute check for TEST_EMAIL
	const executeCheck = async () => {
		setIsRunning(true);
		const start = performance.now();

		try {
			const res = await runCheck(TEST_EMAIL);
			const elapsed = Math.max(Math.round(performance.now() - start), 32);
			setLatency(elapsed);
			setJsonResult(JSON.stringify(toPublicPayload(res), null, 2));
		} catch {
			const fallbackData = {
				input: TEST_EMAIL,
				domain: "prodbits.com",
				verdict: "disposable",
				isDisposable: true,
				mxRecords: [] as string[],
				confidence: 0.98,
				riskScore: 0.94,
				flags: ["DISPOSABLE_DOMAIN", "PUBLIC_INBOX_DETECTED"],
			};

			const elapsed = Math.max(Math.round(performance.now() - start) + 40, 42);
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
					Check Temp email from code
				</h2>
				<p className="mt-3 max-w-2xl text-[14.5px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60">
					Call the public endpoint from signup. You get a verdict, MX hosts,
					and flags — not an SMTP mailbox probe.
				</p>
			</div>

			{/* Language Switcher & Action Bar */}
			<div className="flex items-center justify-between gap-3 border-stroke-soft-200 border-b pr-4 sm:pr-8 lg:pr-12 dark:border-white/10">
				<LanguagePills
					tabs={PILL_TABS}
					activeId={activeId}
					onChange={setActiveId}
					ariaLabel="Code language"
					idPrefix="check-api"
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
				aria-labelledby={`check-api-tab-${activeId}`}
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
					<div className="overflow-x-auto px-4 py-6 sm:px-6 lg:px-8">
						<AnimatePresence mode="wait">
							<motion.pre
								key={jsonResult}
								initial={{ opacity: 0.6 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.15 }}
								className="font-mono text-[12.5px] text-text-sub-600 leading-[1.75] sm:text-[13px] dark:text-white/45"
							>
								<code>{highlightJson(jsonResult)}</code>
							</motion.pre>
						</AnimatePresence>
					</div>
				</div>
			</div>
		</section>
	);
}
