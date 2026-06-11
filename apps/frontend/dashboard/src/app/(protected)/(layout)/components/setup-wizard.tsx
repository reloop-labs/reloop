"use client";

import {
	ArrowRight,
	Check,
	Copy,
	Globe,
	KeyRound,
	Lightbulb,
	UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApiKeyData {
	id: string;
	name: string | null;
	start: string | null;
	prefix: string | null;
	enabled: boolean;
	requestCount: number;
	remaining: number | null;
	expiresAt: string | null;
	createdAt: string;
	lastRequest: string | null;
}

interface DomainData {
	id: string;
	domainName: string;
	status: "pending" | "verifying" | "active" | "suspended" | "failed";
	createdAt: string;
}

export interface SetupWizardProps {
	firstName: string;
	domains: DomainData[];
	primaryApiKey: ApiKeyData | undefined;
}

// ---------------------------------------------------------------------------
// Language prompt data
// ---------------------------------------------------------------------------

type LangId = "nodejs" | "python" | "php" | "ruby" | "go";

const languages: { id: LangId; label: string }[] = [
	{ id: "nodejs", label: "Node.js" },
	{ id: "python", label: "Python" },
	{ id: "php", label: "PHP" },
	{ id: "ruby", label: "Ruby" },
	{ id: "go", label: "Go" },
];

const sdkNames: Record<LangId, string> = {
	nodejs: "@reloop/node",
	python: "reloop-python",
	php: "reloop/reloop-php",
	ruby: "reloop",
	go: "github.com/reloop-labs/reloop-go",
};

function buildPrompt(lang: LangId, apiKeyDisplay: string, domain: string): string {
	const sdk = sdkNames[lang];
	const fromAddr = `hello@${domain}`;

	return `Install the ${sdk} SDK and send a transactional email using my API key ${apiKeyDisplay}.

Import the client, initialise it with my key, then send a welcome email from ${fromAddr} to the user's address with subject "Welcome aboard" and a plain-text body.

Use async/await and handle errors. Show me only the integration code.`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SetupWizard({ firstName, domains, primaryApiKey }: SetupWizardProps) {
	const [activeLang, setActiveLang] = useState<LangId>("nodejs");

	// Derived state
	const hasDomain = domains.length > 0;
	const primaryDomainName = domains[0]?.domainName || "mycompany.com";
	const hasApiKey = !!primaryApiKey;

	const displayPrefix = primaryApiKey?.start || "rl_live";
	const maskedKey = `${displayPrefix}_••••••••••`;

	// Steps completion
	const step1Done = true; // account always created if on dashboard
	const step2Done = hasDomain;
	const step3Done = hasApiKey;
	const completedCount = [step1Done, step2Done, step3Done].filter(Boolean).length;
	const stepsLeft = 3 - completedCount;

	const greeting = useMemo(() => getGreeting(), []);

	// Build AI prompt
	const aiPrompt = useMemo(
		() => buildPrompt(activeLang, maskedKey, primaryDomainName),
		[activeLang, maskedKey, primaryDomainName],
	);

	const handleCopy = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		toast.success(`${label} copied to clipboard`);
	};

	return (
		<div className="mx-auto max-w-3xl space-y-6 p-6 lg:p-8">
			{/* ── Header ────────────────────────────────────────────── */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="font-semibold text-xl text-text-strong-950 tracking-tight dark:text-white">
						{greeting}, {firstName} 👋
					</h1>
					<p className="mt-1 text-sm text-text-sub-600 dark:text-white/60">
						{stepsLeft > 0
							? `Let's get your account ready — ${stepsLeft} step${stepsLeft > 1 ? "s" : ""} left`
							: "You're all set! Start sending emails."}
					</p>
				</div>
				<span className="shrink-0 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
					{stepsLeft > 0 ? "Setup in progress" : "Setup complete"}
				</span>
			</div>

			{/* ── Card 1: Complete your setup ────────────────────────── */}
			<div className="rounded-2xl border border-stroke-soft-100 bg-white p-6 dark:border-white/[0.06] dark:bg-white/[0.02]">
				{/* Card header */}
				<div className="flex items-start justify-between gap-4">
					<div>
						<h2 className="font-semibold text-base text-text-strong-950 dark:text-white">
							Complete your setup
						</h2>
						<p className="mt-0.5 text-sm text-text-sub-600 dark:text-white/50">
							Finish these steps to start sending emails
						</p>
					</div>
					<span className="shrink-0 text-sm font-medium text-text-sub-600 dark:text-white/50">
						{completedCount} of 3 done
					</span>
				</div>

				{/* Progress bar */}
				<div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-stroke-soft-100 dark:bg-white/[0.06]">
					<div
						className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
						style={{ width: `${(completedCount / 3) * 100}%` }}
					/>
				</div>

				{/* Steps list */}
				<div className="mt-6 space-y-1">
					{/* Step 1: Create account (always done) */}
					<div className="flex items-center gap-4 rounded-xl px-2 py-3">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
							<Check className="h-4 w-4" strokeWidth={3} />
						</div>
						<div>
							<p className="text-sm font-semibold text-text-strong-950 dark:text-white line-through decoration-text-sub-600/40">
								Create your account
							</p>
							<p className="text-xs text-text-sub-600 dark:text-white/50">
								Account created successfully
							</p>
						</div>
					</div>

					{/* Divider */}
					<div className="ml-7 border-l border-stroke-soft-100 dark:border-white/[0.06] h-2" />

					{/* Step 2: Add a sending domain */}
					<div className="flex items-start gap-4 rounded-xl px-2 py-3">
						<div
							className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
								step2Done
									? "bg-emerald-500 text-white"
									: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
							}`}
						>
							{step2Done ? (
								<Check className="h-4 w-4" strokeWidth={3} />
							) : (
								<Globe className="h-4 w-4" />
							)}
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center justify-between gap-3">
								<p
									className={`text-sm font-semibold dark:text-white ${
										step2Done
											? "text-text-strong-950 line-through decoration-text-sub-600/40"
											: "text-text-strong-950"
									}`}
								>
									Add a sending domain
								</p>
								{!step2Done && (
									<span className="shrink-0 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
										Required
									</span>
								)}
							</div>
							<p className="mt-0.5 text-xs text-text-sub-600 dark:text-white/50">
								{step2Done
									? `${primaryDomainName} verified`
									: "Verify a domain to send emails from your own address"}
							</p>
							{!step2Done && (
								<Link
									href="/domain/add"
									className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-text-strong-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-text-strong-950/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
								>
									Add domain
									<ArrowRight className="h-3.5 w-3.5" />
								</Link>
							)}
						</div>
					</div>

					{/* Divider */}
					<div className="ml-7 border-l border-stroke-soft-100 dark:border-white/[0.06] h-2" />

					{/* Step 3: API key */}
					<div className="flex items-start gap-4 rounded-xl px-2 py-3">
						<div
							className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
								step3Done
									? "bg-emerald-500 text-white"
									: "bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-white/40"
							}`}
						>
							{step3Done ? (
								<Check className="h-4 w-4" strokeWidth={3} />
							) : (
								<KeyRound className="h-4 w-4" />
							)}
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center justify-between gap-3">
								<p
									className={`text-sm font-semibold dark:text-white ${
										step3Done
											? "text-text-strong-950 line-through decoration-text-sub-600/40"
											: "text-text-strong-950"
									}`}
								>
									Your API key
								</p>
								{step3Done && (
									<Link
										href="/api-keys"
										className="text-xs font-medium text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
									>
										Manage →
									</Link>
								)}
							</div>
							<p className="mt-0.5 text-xs text-text-sub-600 dark:text-white/50">
								{step3Done
									? "An API key was auto-generated for you — copy it or regenerate"
									: "Generate an API key to authenticate your requests"}
							</p>
							{step3Done && (
								<div className="mt-2.5 flex items-center gap-2 rounded-lg bg-bg-weak-50 px-3 py-2 dark:bg-white/[0.03] border border-stroke-soft-100/50 dark:border-white/[0.06]">
									<code className="font-mono text-xs text-text-strong-950 dark:text-white/80 select-all truncate flex-1">
										{maskedKey}
									</code>
									<button
										type="button"
										onClick={() => handleCopy(maskedKey, "API Key")}
										title="Copy API Key"
										className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-sub-600 hover:bg-white hover:text-text-strong-950 dark:hover:bg-white/5 dark:text-white/50 transition-colors"
									>
										<Copy className="h-3.5 w-3.5" />
									</button>
								</div>
							)}
							{!step3Done && (
								<Link
									href="/api-keys"
									className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-stroke-soft-100 bg-white px-4 py-2 text-sm font-semibold text-text-strong-950 transition-colors hover:bg-bg-weak-50 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.06]"
								>
									Generate API Key
									<ArrowRight className="h-3.5 w-3.5" />
								</Link>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* ── Card 2: Integrate with your codebase ───────────────── */}
			<div className="rounded-2xl border border-stroke-soft-100 bg-white p-6 dark:border-white/[0.06] dark:bg-white/[0.02]">
				{/* Card header */}
				<div className="flex items-start justify-between gap-4">
					<div>
						<h2 className="font-semibold text-base text-text-strong-950 dark:text-white">
							Integrate with your codebase
						</h2>
						<p className="mt-0.5 text-sm text-text-sub-600 dark:text-white/50">
							Copy this prompt and paste it directly into Cursor, Copilot, or any AI assistant — it
							installs and configures the SDK automatically.
						</p>
					</div>
					<span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
						AI-ready
					</span>
				</div>

				{/* Language pills */}
				<div className="mt-5 flex flex-wrap gap-2">
					{languages.map((lang) => (
						<button
							key={lang.id}
							type="button"
							onClick={() => setActiveLang(lang.id)}
							className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
								activeLang === lang.id
									? "bg-amber-100 text-amber-900 ring-1 ring-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/40"
									: "bg-bg-weak-50 text-text-sub-600 hover:bg-bg-weak-100 hover:text-text-strong-950 dark:bg-white/[0.04] dark:text-white/60 dark:hover:bg-white/[0.08] dark:hover:text-white"
							}`}
						>
							{lang.label}
						</button>
					))}
				</div>

				{/* Prompt code block */}
				<div className="mt-4 relative rounded-xl bg-zinc-900 p-5 dark:bg-zinc-950 border border-zinc-800 dark:border-white/[0.06]">
					{/* Copy button */}
					<button
						type="button"
						onClick={() => handleCopy(aiPrompt, "AI prompt")}
						className="absolute top-4 right-4 flex items-center gap-1.5 rounded-lg bg-zinc-800 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white dark:bg-zinc-800 dark:hover:bg-zinc-700"
					>
						<Copy className="h-3 w-3" />
						Copy
					</button>

					{/* Prompt text */}
					<pre className="font-mono text-[13px] leading-relaxed text-zinc-300 whitespace-pre-wrap pr-20 select-all">
						{aiPrompt}
					</pre>
				</div>

				{/* Footer tip */}
				<div className="mt-4 flex items-start gap-2 text-[13px] text-text-sub-600 dark:text-white/40">
					<Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
					<p>
						Paste this into your AI coding assistant — it will install the package, configure your
						key, and write the integration code for you.
					</p>
				</div>
			</div>
		</div>
	);
}
