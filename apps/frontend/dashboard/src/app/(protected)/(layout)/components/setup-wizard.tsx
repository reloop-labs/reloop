"use client";

import { useApiLanguage } from "@fe/dashboard/hooks/use-api-language";
import { CodeBlock } from "@reloop/ui/code-block";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowRight,
	Check,
	Copy,
	Globe,
	KeyRound,
	Lightbulb,
	Send,
	Sparkles,
	Terminal,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { SimpleIcon } from "simple-icons";
import { siGo, siNodedotjs, siPhp, siPython, siRuby } from "simple-icons";
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
	domain: string;
	status: "pending" | "verifying" | "active" | "suspended" | "failed";
	createdAt: string;
}

export interface SetupWizardProps {
	firstName: string;
	domains: DomainData[];
	primaryApiKey: ApiKeyData | undefined;
	userEmail?: string;
}

// ---------------------------------------------------------------------------
// Language & SDK configuration
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
	nodejs: "reloop-email",
	python: "reloop-email",
	php: "reloop/reloop-email",
	ruby: "reloop-email",
	go: "github.com/reloop-labs/reloop-email",
};

const installCommands: Record<LangId, string> = {
	nodejs: "npm install reloop-email",
	python: "pip install reloop-email",
	php: "composer require reloop/reloop-email",
	ruby: "gem install reloop-email",
	go: "go get github.com/reloop-labs/reloop-email",
};

const shikiLang: Record<LangId, string> = {
	nodejs: "javascript",
	python: "python",
	php: "php",
	ruby: "ruby",
	go: "go",
};

const langConfig: Record<
	LangId,
	{ label: string; icon: SimpleIcon; color: string; filename: string }
> = {
	nodejs: {
		label: "Node.js",
		icon: siNodedotjs,
		color: "#339933",
		filename: "app.js",
	},
	python: {
		label: "Python",
		icon: siPython,
		color: "#3776AB",
		filename: "main.py",
	},
	php: {
		label: "PHP",
		icon: siPhp,
		color: "#777BB4",
		filename: "index.php",
	},
	ruby: {
		label: "Ruby",
		icon: siRuby,
		color: "#CC342D",
		filename: "send.rb",
	},
	go: {
		label: "Go",
		icon: siGo,
		color: "#00ADD8",
		filename: "main.go",
	},
};

// ---------------------------------------------------------------------------
// Prompt & Code Generators
// ---------------------------------------------------------------------------

function buildPrompt(
	lang: LangId,
	apiKeyDisplay: string,
	domain: string,
): string {
	const sdk = sdkNames[lang];
	const fromAddr = `hello@${domain}`;

	return `Install the ${sdk} SDK and send a transactional email using my API key ${apiKeyDisplay}.

Import the client, initialise it with my key, then send a welcome email from ${fromAddr} to the user's address with subject "Welcome aboard" and a plain-text body.

Use async/await and handle errors. Show me only the integration code.`;
}

function buildCodeSnippet(
	lang: LangId,
	apiKeyDisplay: string,
	domain: string,
): string {
	const fromAddr = `hello@${domain}`;
	switch (lang) {
		case "nodejs":
			return `import Reloop from 'reloop-email';

const reloop = new Reloop({
  apiKey: "${apiKeyDisplay}"
});

try {
  const { data, error } = await reloop.emails.send({
    from: "${fromAddr}",
    to: "user@example.com",
    subject: "Welcome aboard",
    text: "Welcome to our platform!"
  });

  if (error) {
    console.error("Failed to send:", error);
  } else {
    console.log("Sent successfully! ID:", data.id);
  }
} catch (err) {
  console.error("Error sending email:", err);
}`;
		case "python":
			return `from reloop_email import Reloop

reloop = Reloop(api_key="${apiKeyDisplay}")

try:
    response = reloop.emails.send(
        sender="${fromAddr}",
        to="user@example.com",
        subject="Welcome aboard",
        text="Welcome to our platform!"
    )
    print(f"Email sent successfully: {response.id}")
except Exception as e:
    print(f"Failed to send email: {e}")`;
		case "php":
			return `$reloop = Reloop::client('${apiKeyDisplay}');

try {
    $response = $reloop->emails->send([
        'from' => '${fromAddr}',
        'to' => 'user@example.com',
        'subject' => 'Welcome aboard',
        'text' => 'Welcome to our platform!'
    ]);
    echo 'Email sent! ID: ' . $response->id;
} catch (\\Exception $e) {
    echo 'Failed to send: ' . $e->getMessage();
}`;
		case "ruby":
			return `require 'reloop-email'

reloop = Reloop::Client.new(api_key: '${apiKeyDisplay}')

begin
  response = reloop.emails.send(
    from: '${fromAddr}',
    to: 'user@example.com',
    subject: 'Welcome aboard',
    text: 'Welcome to our platform!'
  )
  puts "Email sent: #{response.id}"
rescue => e
  puts "Failed to send: #{e.message}"
end`;
		case "go":
			return `package main

import (
	"context"
	"fmt"
	"log"

	reloopemail "github.com/reloop-labs/reloop-email"
)

func main() {
	reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
		APIKey: "${apiKeyDisplay}",
	})

	resp, err := reloop.Emails().Send(context.Background(), &reloopemail.SendEmailRequest{
		From:    "${fromAddr}",
		To:      "user@example.com",
		Subject: "Welcome aboard",
		Text:    "Welcome to our platform!",
	})
	if err != nil {
		log.Fatalf("Failed to send: %v", err)
	}
	fmt.Printf("Email sent successfully! ID: %s\\n", resp.ID)
}`;
		default:
			return "";
	}
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
// Sub-components
// ---------------------------------------------------------------------------

function CopyButton({ text, label }: { text: string; label: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		toast.success(`${label} copied to clipboard`);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-stroke-soft-100 bg-white px-2.5 font-semibold text-text-strong-950 text-xs transition-all hover:bg-bg-weak-50 active:scale-95 dark:border-white/[0.06] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
		>
			{copied ? (
				<span className="flex items-center gap-1 font-semibold text-emerald-500">
					<Check className="h-3 w-3" strokeWidth={3} />
					Copied
				</span>
			) : (
				<span className="flex items-center gap-1.5">
					<Copy className="h-3 w-3" />
					Copy
				</span>
			)}
		</button>
	);
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function SetupWizard({
	firstName,
	domains,
	primaryApiKey,
	userEmail = "",
}: SetupWizardProps) {
	const router = useRouter();
	const testRecipient = userEmail;
	const [isSendingTest, setIsSendingTest] = useState(false);
	const [step4Done, setStep4Done] = useState(false);

	const [activeLang, setActiveLang] = useApiLanguage<LangId>(
		languages.map((l) => l.id),
		"nodejs",
	);
	const [activeTab, setActiveTab] = useState<"prompt" | "code">("prompt");

	const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);
	const [isGeneratingKey, setIsGeneratingKey] = useState(false);

	const handleGenerateApiKey = async () => {
		if (isGeneratingKey) return;
		setIsGeneratingKey(true);

		try {
			const response = await fetch("/api/api-key/v1/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: "Setup Wizard Key",
				}),
				credentials: "include",
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					errorData.why || errorData.message || "Failed to generate API key.",
				);
			}

			const data = await response.json();
			setGeneratedApiKey(data.key);
			toast.success("API key generated successfully!");
			router.refresh();
		} catch (error: unknown) {
			console.error("Error generating API key:", error);
			const message =
				error instanceof Error ? error.message : "Failed to generate API key";
			toast.error(message);
		} finally {
			setIsGeneratingKey(false);
		}
	};

	// Derived state
	const primaryDomain = domains[0];
	const primaryDomainName = primaryDomain?.domain || "mycompany.com";
	const hasApiKey = !!primaryApiKey || !!generatedApiKey;

	const displayPrefix = generatedApiKey
		? generatedApiKey.split("_").slice(0, 2).join("_")
		: primaryApiKey?.start || "rl_live";
	const maskedKey = generatedApiKey || `${displayPrefix}_••••••••••`;

	// Steps completion
	const step1Done = true; // account always created if on dashboard
	const step2Done = primaryDomain?.status === "active";
	const step3Done = hasApiKey;
	const completedCount = [step1Done, step2Done, step3Done, step4Done].filter(
		Boolean,
	).length;
	const stepsLeft = 4 - completedCount;

	const greeting = useMemo(() => getGreeting(), []);

	const handleSendTestEmail = async () => {
		if (!testRecipient) {
			toast.error("Please enter a recipient email address");
			return;
		}

		setIsSendingTest(true);

		try {
			let cleartextApiKey = generatedApiKey;

			if (!cleartextApiKey) {
				// 1. Generate a new API key on the fly for sending the email
				const apiKeyRes = await fetch("/api/api-key/v1/", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: "Setup Wizard Test Key",
					}),
					credentials: "include",
				});

				if (!apiKeyRes.ok) {
					const errorData = await apiKeyRes.json().catch(() => ({}));
					throw new Error(
						errorData.why ||
							errorData.message ||
							"Failed to generate API key for sending.",
					);
				}

				const apiKeyData = await apiKeyRes.json();
				cleartextApiKey = apiKeyData.key;
			}

			// 2. Use the API key to send the test email
			const response = await fetch("/api/email/v1/onboarding/send-test-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(cleartextApiKey ? { "x-api-key": cleartextApiKey } : {}),
				},
				body: JSON.stringify({
					from: `test@${primaryDomainName}`,
					to: testRecipient,
				}),
				credentials: "include",
			});

			if (!response.ok) {
				const result = await response.json().catch(() => ({}));
				throw new Error(result.why || result.message || "Failed to send email");
			}

			toast.success("Test email sent successfully!");
			setStep4Done(true);

			// Refresh page after a brief delay so the operational dashboard loads
			setTimeout(() => {
				router.refresh();
			}, 1500);
		} catch (error: unknown) {
			console.error("Error sending test email:", error);
			const message =
				error instanceof Error ? error.message : "Failed to send test email";
			toast.error(message);
		} finally {
			setIsSendingTest(false);
		}
	};

	// Build playground contents
	const aiPrompt = useMemo(
		() => buildPrompt(activeLang, maskedKey, primaryDomainName),
		[activeLang, maskedKey, primaryDomainName],
	);

	const codeSnippet = useMemo(
		() => buildCodeSnippet(activeLang, maskedKey, primaryDomainName),
		[activeLang, maskedKey, primaryDomainName],
	);

	return (
		<div className="relative mx-auto max-w-6xl overflow-hidden p-6 lg:p-12">
			{/* Ambient background glows */}
			<div className="-top-24 -left-20 -z-10 pointer-events-none absolute h-72 w-72 rounded-full bg-[#d97757]/5 blur-[100px]" />
			<div className="-right-20 -z-10 pointer-events-none absolute top-1/3 h-96 w-96 rounded-full bg-blue-500/5 blur-[120px]" />

			{/* Header / Greeting */}
			<div className="relative mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div className="text-left">
					<h1 className="font-bold text-3xl text-text-strong-950 tracking-tight md:text-4xl dark:text-white">
						{greeting}, {firstName} 👋
					</h1>
					<p className="mt-2 max-w-xl text-base text-text-sub-600 dark:text-white/60">
						{stepsLeft > 0
							? `Let's get your account ready to send transactional emails — ${stepsLeft} step${
									stepsLeft > 1 ? "s" : ""
								} remaining`
							: "You're all set! Start sending emails."}
					</p>
				</div>
				<div className="flex items-center gap-2 self-start lg:self-center">
					<span
						className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-semibold text-xs ${
							stepsLeft > 0
								? "border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400"
								: "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
						}`}
					>
						<span
							className={`h-1.5 w-1.5 rounded-full ${
								stepsLeft > 0 ? "animate-pulse bg-amber-500" : "bg-emerald-500"
							}`}
						/>
						{stepsLeft > 0 ? "Setup in progress" : "Setup complete"}
					</span>
				</div>
			</div>

			<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
				{/* ── Left Panel: Checklist ── */}
				<div className="space-y-6 lg:col-span-5">
					<div className="rounded-2xl border border-stroke-soft-100 bg-white/60 p-6 backdrop-blur-xl dark:border-white/[0.04] dark:bg-white/[0.01]">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="font-bold text-lg text-text-strong-950 dark:text-white">
									Setup Checklist
								</h2>
								<p className="mt-1 text-text-sub-600 text-xs dark:text-white/40">
									Complete the actions below.
								</p>
							</div>
							<div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
								<svg className="-rotate-90 h-full w-full">
									<title>Setup Progress</title>
									<circle
										cx="28"
										cy="28"
										r="22"
										stroke="currentColor"
										className="text-stroke-soft-100 dark:text-white/[0.04]"
										strokeWidth="4"
										fill="transparent"
									/>
									<circle
										cx="28"
										cy="28"
										r="22"
										stroke="#d97757"
										strokeWidth="4"
										fill="transparent"
										strokeDasharray={2 * Math.PI * 22}
										strokeDashoffset={
											2 * Math.PI * 22 * (1 - completedCount / 4)
										}
										strokeLinecap="round"
										className="transition-all duration-700 ease-out"
									/>
								</svg>
								<span className="absolute font-bold text-[11px] text-text-strong-950 dark:text-white">
									{completedCount}/4
								</span>
							</div>
						</div>

						{/* Checklist Rows with custom interactive states */}
						<div className="relative mt-8 space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-stroke-soft-100 dark:before:bg-white/[0.04]">
							{/* Step 1: Account (Always done) */}
							<div className="group relative">
								<div className="-left-[21px] absolute top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
									<Check className="h-2.5 w-2.5" strokeWidth={4} />
								</div>

								<div className="flex flex-col pl-3.5">
									<span className="font-semibold text-sm text-text-strong-950/50 line-through decoration-text-sub-600/20 dark:text-white/40">
										Create your account
									</span>
									<span className="text-text-sub-600/60 text-xs dark:text-white/30">
										Account created successfully
									</span>
								</div>
							</div>

							{/* Step 2: Domain */}
							<div className="group relative">
								<div
									className={`-left-[21px] absolute top-1.5 flex h-4 w-4 items-center justify-center rounded-full transition-all duration-300 ${
										step2Done
											? "bg-emerald-500 text-white"
											: "bg-[#d97757] text-white ring-4 ring-[#d97757]/20"
									}`}
								>
									{step2Done ? (
										<Check className="h-2.5 w-2.5" strokeWidth={4} />
									) : (
										<Globe className="h-2 w-2" />
									)}
								</div>

								<div
									className={`flex flex-col transition-all duration-300 ${
										step2Done
											? "pl-3.5"
											: "rounded-xl border border-[#d97757]/20 bg-[#d97757]/[0.02] p-3.5 dark:bg-[#d97757]/[0.01]"
									}`}
								>
									<div className="flex items-center justify-between gap-2">
										<span
											className={`font-semibold text-sm ${
												step2Done
													? "text-text-strong-950/50 line-through decoration-text-sub-600/20 dark:text-white/40"
													: "text-text-strong-950 dark:text-white"
											}`}
										>
											Add sending domain
										</span>
										{primaryDomain ? (
											!step2Done && (
												<span className="shrink-0 rounded-full border border-amber-200/50 bg-amber-500/10 px-2 py-0.5 font-semibold text-[10px] text-amber-600 capitalize dark:text-amber-400">
													{primaryDomain.status}
												</span>
											)
										) : (
											<span className="shrink-0 rounded-full border border-red-200/50 bg-red-500/10 px-2 py-0.5 font-semibold text-[10px] text-red-600 dark:text-red-400">
												Required
											</span>
										)}
									</div>
									<span
										className={`mt-1 text-xs ${
											step2Done
												? "text-text-sub-600/60 dark:text-white/30"
												: "text-text-sub-600 dark:text-white/50"
										}`}
									>
										{step2Done
											? `${primaryDomainName} verified`
											: primaryDomain
												? `Configure DNS settings to verify ${primaryDomainName}`
												: "Verify a domain to send emails from your own address"}
									</span>

									{!step2Done && (
										<Link
											href={
												primaryDomain
													? `/domain/${primaryDomain.id}`
													: "/domain/add"
											}
											className="mt-3.5 inline-flex items-center justify-center gap-1.5 self-start rounded-lg bg-text-strong-950 px-4.5 py-2 font-semibold text-white text-xs transition-all hover:opacity-90 active:scale-95 dark:bg-white dark:text-black"
										>
											{primaryDomain ? "Verify domain" : "Add domain"}
											<ArrowRight className="h-3 w-3" />
										</Link>
									)}
								</div>
							</div>

							{/* Step 3: API Key */}
							<div className="group relative">
								<div
									className={`-left-[21px] absolute top-1.5 flex h-4 w-4 items-center justify-center rounded-full transition-all duration-300 ${
										step3Done
											? "bg-emerald-500 text-white"
											: step2Done
												? "bg-[#d97757] text-white ring-4 ring-[#d97757]/20"
												: "bg-stroke-soft-100 text-text-disabled-300 dark:bg-white/[0.04]"
									}`}
								>
									{step3Done ? (
										<Check className="h-2.5 w-2.5" strokeWidth={4} />
									) : (
										<KeyRound className="h-2 w-2" />
									)}
								</div>

								<div
									className={`flex flex-col transition-all duration-300 ${
										step3Done
											? "pl-3.5"
											: step2Done
												? "rounded-xl border border-[#d97757]/20 bg-[#d97757]/[0.02] p-3.5 dark:bg-[#d97757]/[0.01]"
												: "pointer-events-none pl-3.5 opacity-50"
									}`}
								>
									<div className="flex items-center justify-between gap-2">
										<span
											className={`font-semibold text-sm ${
												step3Done
													? "text-text-strong-950/50 line-through decoration-text-sub-600/20 dark:text-white/40"
													: "text-text-strong-950 dark:text-white"
											}`}
										>
											Generate API key
										</span>
										{step3Done && (
											<Link
												href="/api-keys"
												className="font-semibold text-[#d97757] text-[11px] hover:underline"
											>
												Manage →
											</Link>
										)}
									</div>
									<span
										className={`mt-1 text-xs ${
											step3Done
												? "text-text-sub-600/60 dark:text-white/30"
												: "text-text-sub-600 dark:text-white/50"
										}`}
									>
										{step3Done
											? "API key generated"
											: "Authenticate your transactional email requests"}
									</span>

									{step3Done && (
										<div className="mt-3.5 flex items-center gap-2 rounded-lg border border-stroke-soft-100/30 bg-bg-weak-50/50 px-3 py-1.5 dark:border-white/[0.04] dark:bg-white/[0.02]">
											<code className="flex-1 select-all truncate font-mono text-text-strong-950 text-xs dark:text-white/80">
												{maskedKey}
											</code>
											<CopyButton text={maskedKey} label="API Key" />
										</div>
									)}

									{!step3Done && step2Done && (
										<button
											type="button"
											onClick={handleGenerateApiKey}
											disabled={isGeneratingKey}
											className="mt-3.5 inline-flex items-center justify-center gap-1.5 self-start rounded-lg bg-text-strong-950 px-4.5 py-2 font-semibold text-white text-xs transition-all hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:bg-white dark:text-black"
										>
											{isGeneratingKey ? "Generating..." : "Generate API Key"}
											<ArrowRight className="h-3 w-3" />
										</button>
									)}
								</div>
							</div>

							{/* Step 4: Send test email */}
							<div className="group relative">
								<div
									className={`-left-[21px] absolute top-1.5 flex h-4 w-4 items-center justify-center rounded-full transition-all duration-300 ${
										step4Done
											? "bg-emerald-500 text-white"
											: step3Done && step2Done
												? "bg-[#d97757] text-white ring-4 ring-[#d97757]/20"
												: "bg-stroke-soft-100 text-text-disabled-300 dark:bg-white/[0.04]"
									}`}
								>
									{step4Done ? (
										<Check className="h-2.5 w-2.5" strokeWidth={4} />
									) : (
										<Send className="h-2 w-2" />
									)}
								</div>

								<div
									className={`flex flex-col transition-all duration-300 ${
										step4Done
											? "pl-3.5"
											: (step3Done && step2Done)
												? "rounded-xl border border-[#d97757]/20 bg-[#d97757]/[0.02] p-3.5 dark:bg-[#d97757]/[0.01]"
												: "pointer-events-none pl-3.5 opacity-50"
									}`}
								>
									<div className="flex items-center justify-between gap-2">
										<span
											className={`font-semibold text-sm ${
												step4Done
													? "text-text-strong-950/50 line-through decoration-text-sub-600/20 dark:text-white/40"
													: "text-text-strong-950 dark:text-white"
											}`}
										>
											Send your first email
										</span>
									</div>
									<span
										className={`mt-1 text-xs ${
											step4Done
												? "text-text-sub-600/60 dark:text-white/30"
												: "text-text-sub-600 dark:text-white/50"
										}`}
									>
										{step4Done
											? "First email sent successfully!"
											: "Verify sending works by sending a test email"}
									</span>

									{!step4Done && step3Done && step2Done && (
										<div className="mt-3.5 flex flex-col gap-2">
											<div className="flex gap-2">
												<input
													type="email"
													disabled
													placeholder="recipient@example.com"
													value={testRecipient}
													className="flex-1 cursor-not-allowed rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 px-3 py-1.5 text-text-sub-600 text-xs focus:outline-none dark:border-white/[0.06] dark:bg-zinc-900/50 dark:text-white/60"
												/>
												<button
													type="button"
													disabled={isSendingTest || !testRecipient}
													onClick={handleSendTestEmail}
													className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-text-strong-950 px-4 py-2 font-semibold text-white text-xs transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-black"
												>
													{isSendingTest ? "Sending..." : "Send Email"}
													<ArrowRight className="h-3 w-3" />
												</button>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* ── Right Panel: Developer Playground ── */}
				<div className="space-y-6 lg:col-span-7">
					<div className="rounded-2xl border border-stroke-soft-100 bg-white/60 p-6 backdrop-blur-xl dark:border-white/[0.04] dark:bg-white/[0.01]">
						<div>
							<h2 className="font-bold text-lg text-text-strong-950 dark:text-white">
								Developer Playground
							</h2>
							<p className="mt-1 text-text-sub-600 text-xs dark:text-white/40">
								Select your language and choose how to integrate Reloop into
								your application.
							</p>
						</div>

						{/* Language Selector */}
						<div className="mt-6 flex flex-wrap gap-2">
							{languages.map((lang) => {
								const cfg = langConfig[lang.id];
								const isActive = activeLang === lang.id;
								return (
									<button
										key={lang.id}
										type="button"
										onClick={() => {
											setActiveLang(lang.id);
										}}
										className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 font-semibold text-xs transition-all ${
											isActive
												? "text-white"
												: "bg-bg-weak-50/50 text-text-sub-600 hover:text-text-strong-950 dark:bg-white/[0.02] dark:text-white/60 dark:hover:text-white"
										}`}
									>
										{isActive && (
											<motion.div
												layoutId="activeLangBg"
												className="-z-10 absolute inset-0 rounded-xl bg-gradient-to-r from-[#d97757] to-[#d97757]/90"
												transition={{
													type: "spring",
													stiffness: 380,
													damping: 30,
												}}
											/>
										)}

										<svg
											role="img"
											viewBox="0 0 24 24"
											className="h-3.5 w-3.5 shrink-0 transition-colors"
											fill="currentColor"
											xmlns="http://www.w3.org/2000/svg"
											style={{ color: isActive ? "#ffffff" : cfg.color }}
										>
											<title>{lang.label}</title>
											<path d={cfg.icon.path} />
										</svg>

										<span>{lang.label}</span>
									</button>
								);
							})}
						</div>

						{/* Tab Switcher: AI Prompt vs Direct SDK */}
						<div className="mt-6 flex border-stroke-soft-100 border-b dark:border-white/[0.04]">
							<button
								type="button"
								onClick={() => setActiveTab("prompt")}
								className={`relative flex items-center gap-2 px-1 pb-3 font-semibold text-xs transition-all ${
									activeTab === "prompt"
										? "text-[#d97757]"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/40 dark:hover:text-white"
								}`}
							>
								<Sparkles className="h-3.5 w-3.5" />
								Prompt for AI Assistant
								{activeTab === "prompt" && (
									<motion.div
										layoutId="activeTabUnderline"
										className="absolute right-0 bottom-0 left-0 h-[2px] bg-[#d97757]"
										transition={{
											type: "spring",
											stiffness: 380,
											damping: 30,
										}}
									/>
								)}
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("code")}
								className={`relative ml-6 flex items-center gap-2 px-1 pb-3 font-semibold text-xs transition-all ${
									activeTab === "code"
										? "text-[#d97757]"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/40 dark:hover:text-white"
								}`}
							>
								<Terminal className="h-3.5 w-3.5" />
								Direct SDK Integration
								{activeTab === "code" && (
									<motion.div
										layoutId="activeTabUnderline"
										className="absolute right-0 bottom-0 left-0 h-[2px] bg-[#d97757]"
										transition={{
											type: "spring",
											stiffness: 380,
											damping: 30,
										}}
									/>
								)}
							</button>
						</div>

						{/* Playground Content Area */}
						<div className="mt-5">
							<AnimatePresence mode="wait">
								{activeTab === "prompt" ? (
									<motion.div
										key="prompt-container"
										initial={{ opacity: 0, y: 5 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -5 }}
										transition={{ duration: 0.15 }}
										className="relative rounded-2xl border border-[#d97757]/20 bg-[#d97757]/5 p-5 dark:border-[#d97757]/30 dark:bg-[#d97757]/10"
									>
										<div className="mb-3.5 flex items-center justify-between border-[#d97757]/15 border-b pb-3.5 dark:border-[#d97757]/25">
											<div className="flex items-center gap-1.5 text-[#d97757]">
												<Sparkles className="h-3.5 w-3.5" />
												<span className="font-semibold text-xs uppercase tracking-wider">
													AI Instruction Prompt
												</span>
											</div>
											<CopyButton text={aiPrompt} label="AI prompt" />
										</div>
										<div className="scrollbar-hide max-h-[280px] overflow-y-auto py-1">
											<div className="select-text whitespace-pre-wrap pr-10 font-mono text-[13px] text-text-strong-950 leading-relaxed dark:text-zinc-200">
												{aiPrompt}
											</div>
										</div>
									</motion.div>
								) : (
									<motion.div
										key="code-container"
										initial={{ opacity: 0, y: 5 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -5 }}
										transition={{ duration: 0.15 }}
										className="relative rounded-2xl border border-[#d97757]/20 bg-[#d97757]/5 p-5 dark:border-[#d97757]/30 dark:bg-[#d97757]/10"
									>
										<div className="mb-3.5 flex items-center justify-between border-[#d97757]/15 border-b pb-3.5 dark:border-[#d97757]/25">
											<div className="flex items-center gap-1.5 text-[#d97757]">
												<Terminal className="h-3.5 w-3.5" />
												<span className="font-semibold text-xs uppercase tracking-wider">
													{langConfig[activeLang].filename}
												</span>
											</div>
											<CopyButton text={codeSnippet} label="SDK code snippet" />
										</div>
										<div className="scrollbar-hide max-h-[280px] overflow-x-auto py-1">
											<CodeBlock
												code={codeSnippet}
												lang={shikiLang[activeLang]}
												hideLineNumbers={true}
												className="[&>pre]:!p-0 p-0 font-mono text-[13px] leading-relaxed"
											/>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* Info tip footer */}
						<div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#d97757]/10 bg-[#d97757]/5 p-4 text-text-sub-600 text-xs dark:text-white/60">
							<Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#d97757]" />
							<div>
								{activeTab === "prompt" ? (
									<p>
										Copy the prompt above and paste it directly into your AI
										editor (Cursor, Copilot, etc.). It instructs the agent to
										automatically run{" "}
										<code className="rounded bg-[#d97757]/10 px-1 py-0.5 font-mono font-semibold text-[#d97757] dark:bg-[#d97757]/20">
											{installCommands[activeLang]}
										</code>{" "}
										and write the full implementation for you.
									</p>
								) : (
									<p>
										Install the SDK library first:{" "}
										<code className="select-all rounded bg-white/10 px-1.5 py-0.5 font-mono text-text-strong-950 dark:bg-white/[0.05] dark:text-white">
											{installCommands[activeLang]}
										</code>
										, then paste this template to send your first email.
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
