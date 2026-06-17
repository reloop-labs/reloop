"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import {
	ArrowRight,
	ChevronRight,
	Code,
	Copy,
	Eye,
	EyeOff,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
	siDotnet,
	siElixir,
	siExpress,
	siGo,
	siNestjs,
	siNextdotjs,
	siNodedotjs,
	siPhp,
	siPython,
	siRuby,
	siRust,
	siSpringboot,
} from "simple-icons";
import { toast } from "sonner";
import useSWR from "swr";
import { ActivityChartCard } from "./components/activity-chart-card";
import { AgentInboxCard } from "./components/agent-inbox-card";
import { AuditLogsCard } from "./components/audit-logs-card";
import { DomainCard } from "./components/domain-card";
import { EmailsCard } from "./components/emails-card";

const sdkLanguages = [
	{ name: "Node / TS", command: "npm install reloop-email", icon: siNodedotjs },
	{ name: "Python", command: "pip install reloop-python", icon: siPython },
	{ name: "PHP", command: "composer require reloop/reloop-email", icon: siPhp },
	{
		name: "Go",
		command: "go get github.com/reloop-labs/reloop-email",
		icon: siGo,
	},
	{ name: "Rust", command: "cargo add reloop", icon: siRust },
	{ name: "Ruby", command: "gem install reloop", icon: siRuby },
	{
		name: "Java",
		command: "implementation 'com.reloop:reloop-java'",
		icon: siSpringboot,
	},
	{ name: ".NET (C#)", command: "dotnet add package Reloop", icon: siDotnet },
	{ name: "Elixir", command: '{:reloop, "~> 0.1.0"}', icon: siElixir },
];

const frameworkIntegrations = [
	{
		name: "Next.js App Router",
		desc: "Send transactional emails inside server actions and verify DKIM using API routes.",
		icon: siNextdotjs,
	},
	{
		name: "Express REST API",
		desc: "Integrate outbound email delivery and incoming webhook logs with Express middleware.",
		icon: siExpress,
	},
	{
		name: "NestJS Module",
		desc: "Inject a global Reloop client provider module into asynchronous worker queues.",
		icon: siNestjs,
	},
];

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

interface ApiKeyListResponse {
	apiKeys: ApiKeyData[];
	total: number;
}

export default function Home() {
	const { user, activeOrganization } = useUserOrganization();

	// State for API key visibility and agent integration tabs
	const [showApiKey, setShowApiKey] = useState(false);
	const [activeAgentTab, setActiveAgentTab] = useState<"skill" | "cli" | "mcp">(
		"skill",
	);

	// SWR fetches
	const { data: apiKeysData } = useSWR<ApiKeyListResponse>(
		activeOrganization?.id ? "/api/api-key/v1/?limit=10&page=1" : null,
	);

	// Process primary API key
	const primaryApiKey = apiKeysData?.apiKeys?.[0];
	const displayPrefix = primaryApiKey?.start || "rl_live";
	const maskedKey = `${displayPrefix}_••••••••••••••••••••••••••••9d06`;
	const unmaskedKey = primaryApiKey
		? `${displayPrefix}_7f8e0d9a8b7c6d5e4f3g2h1i0j_9d06`
		: `${displayPrefix}_5a7c2b9f8d1e3d4e6a8b7c9f8e0d_9d06`;

	// Clipboard copy helper
	const handleCopy = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		toast.success(`${label} copied to clipboard`);
	};

	const skillMarkdown = `# Reloop AI Agent Skill
This context file guides your AI agent on integrating with Reloop's developer APIs.
- Send transactional emails via SMTP relays or REST API
- Triage inbox notifications and route conversation logs
- Automate multi-step conditional workflows`;

	const mcpConfigText = `{
  "mcpServers": {
    "reloop-mcp": {
      "command": "npx",
      "args": ["-y", "@reloop/mcp-server"],
      "env": {
        "RELOOP_API_KEY": "${primaryApiKey ? unmaskedKey : "YOUR_API_KEY"}"
      }
    }
  }
}`;

	// ── State B: Active User → Operational Dashboard ─────────────────
	return (
		<div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
			<div className="space-y-1">
				<p className="font-medium text-sm text-text-sub-600 dark:text-white/60">
					{activeOrganization?.name}
				</p>
				<h1 className="font-semibold text-3xl text-text-strong-950 tracking-tight dark:text-white">
					{user?.email ? `${user.email}'s Account` : "Your Account"}
				</h1>

				<div className="grid gap-6 pt-6 md:grid-cols-2 lg:grid-cols-3">
					<div className="md:col-span-2 lg:col-span-2">
						<ActivityChartCard />
					</div>
					<EmailsCard />
					<AgentInboxCard />
					<DomainCard />
					<AuditLogsCard />
				</div>
			</div>

			{/* Main Grid: API Keys and Agent Integrations */}
			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-1">
					{/* API Keys Card */}
					<div className="space-y-4 rounded-xl border border-stroke-soft-100 bg-white p-5 dark:border-white/5 dark:bg-white/[0.01]">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-sm text-text-strong-950 dark:text-white">
								API Key
							</h3>
							<Link
								href="/api-keys"
								className="flex items-center gap-0.5 font-medium text-text-sub-600 text-xs hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
							>
								Manage keys
								<ChevronRight className="h-3 w-3" />
							</Link>
						</div>
						<p className="text-text-sub-600 text-xs dark:text-white/50">
							Start sending emails programmatically right away.
						</p>

						<div className="flex items-center justify-between gap-2 rounded-xl border border-stroke-soft-100/50 bg-bg-weak-50 px-3 py-2.5 dark:border-white/5 dark:bg-white/[0.02]">
							<code className="max-w-[200px] select-all truncate font-mono text-text-strong-950 text-xs dark:text-white/80">
								{showApiKey ? unmaskedKey : maskedKey}
							</code>
							<div className="flex items-center gap-1.5">
								<button
									type="button"
									onClick={() => setShowApiKey(!showApiKey)}
									title={showApiKey ? "Hide Key" : "Show Key"}
									className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-100 hover:text-text-strong-950 dark:text-white/60 dark:hover:bg-white/5"
								>
									{showApiKey ? (
										<EyeOff className="h-3.5 w-3.5" />
									) : (
										<Eye className="h-3.5 w-3.5" />
									)}
								</button>
								<button
									type="button"
									onClick={() =>
										handleCopy(
											primaryApiKey
												? unmaskedKey
												: "rl_live_mock_secret_key_reloop_01",
											"API Key",
										)
									}
									title="Copy Key"
									className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-100 hover:text-text-strong-950 dark:text-white/60 dark:hover:bg-white/5"
								>
									<Copy className="h-3.5 w-3.5" />
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="lg:col-span-2">
					{/* Agent Integrations Card */}
					<div className="space-y-4 rounded-xl border border-stroke-soft-100 bg-white p-5 dark:border-white/5 dark:bg-white/[0.01]">
						<div>
							<h3 className="font-semibold text-sm text-text-strong-950 dark:text-white">
								Agent Integrations
							</h3>
							<p className="mt-1 text-text-sub-600 text-xs dark:text-white/50">
								Give your AI agents secure communication capabilities.
							</p>
						</div>

						{/* Horizontal tabs switcher */}
						<div className="flex rounded-lg bg-bg-weak-50 p-1 dark:bg-white/[0.02]">
							<button
								type="button"
								onClick={() => setActiveAgentTab("skill")}
								className={`flex-1 rounded-md py-1.5 text-center font-semibold text-xs transition-all ${
									activeAgentTab === "skill"
										? "bg-white text-text-strong-950 shadow-sm dark:bg-white/10 dark:text-white"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
								}`}
							>
								SKILL.md
							</button>
							<button
								type="button"
								onClick={() => setActiveAgentTab("cli")}
								className={`flex-1 rounded-md py-1.5 text-center font-semibold text-xs transition-all ${
									activeAgentTab === "cli"
										? "bg-white text-text-strong-950 shadow-sm dark:bg-white/10 dark:text-white"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
								}`}
							>
								CLI
							</button>
							<button
								type="button"
								onClick={() => setActiveAgentTab("mcp")}
								className={`flex-1 rounded-md py-1.5 text-center font-semibold text-xs transition-all ${
									activeAgentTab === "mcp"
										? "bg-white text-text-strong-950 shadow-sm dark:bg-white/10 dark:text-white"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
								}`}
							>
								MCP Config
							</button>
						</div>

						{/* Tab Content */}
						{activeAgentTab === "skill" && (
							<div className="space-y-3">
								<div className="flex items-center justify-between rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-3 dark:border-white/5 dark:bg-white/[0.01]">
									<div className="flex min-w-0 items-center gap-2.5">
										<div className="rounded-lg bg-orange-100 p-1.5 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
											<Code className="h-4 w-4" />
										</div>
										<div className="min-w-0">
											<p className="font-semibold text-text-strong-950 text-xs dark:text-white">
												SKILL.md
											</p>
											<p className="truncate text-[10px] text-text-sub-600 dark:text-white/50">
												Instruction file for AI agents context
											</p>
										</div>
									</div>
									<button
										type="button"
										onClick={() =>
											handleCopy(skillMarkdown, "SKILL.md content")
										}
										className="flex shrink-0 items-center gap-1 rounded-lg border border-stroke-soft-100 bg-white px-3 py-1.5 font-semibold text-text-strong-950 text-xs shadow-sm hover:bg-bg-weak-50 dark:border-white/5 dark:bg-white/[0.02] dark:text-white dark:hover:bg-white/5"
									>
										<Copy className="h-3 w-3" />
										Copy
									</button>
								</div>
							</div>
						)}

						{activeAgentTab === "cli" && (
							<div className="relative rounded-xl border border-stroke-soft-100 bg-zinc-950 p-3.5 dark:border-white/5">
								<div className="flex items-center justify-between pb-1.5">
									<span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
										Terminal Command
									</span>
									<button
										type="button"
										onClick={() =>
											handleCopy(
												"npx -y reloop-cli init --all --browser",
												"CLI command",
											)
										}
										className="text-zinc-400 hover:text-white"
										title="Copy command"
									>
										<Copy className="h-3.5 w-3.5" />
									</button>
								</div>
								<code className="block select-all break-all pr-6 font-mono text-xs text-zinc-300">
									$ npx -y reloop-cli init --all --browser
								</code>
							</div>
						)}

						{activeAgentTab === "mcp" && (
							<div className="relative rounded-xl border border-stroke-soft-100 bg-zinc-950 p-3.5 dark:border-white/5">
								<div className="flex items-center justify-between pb-1.5">
									<span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
										Claude Desktop Config
									</span>
									<button
										type="button"
										onClick={() =>
											handleCopy(mcpConfigText, "MCP configuration")
										}
										className="text-zinc-400 hover:text-white"
										title="Copy config JSON"
									>
										<Copy className="h-3.5 w-3.5" />
									</button>
								</div>
								<pre className="scrollbar-hide block max-h-[120px] select-all overflow-x-auto font-mono text-[10px] text-zinc-300">
									{mcpConfigText}
								</pre>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Bottom Grid: SDKs/Integrations and Example Projects */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Supported SDKs */}
				<div className="space-y-4 rounded-xl border border-stroke-soft-100 bg-white p-5 dark:border-white/5 dark:bg-white/[0.01]">
					<div>
						<h3 className="font-semibold text-sm text-text-strong-950 dark:text-white">
							SDKs & Libraries
						</h3>
						<p className="mt-0.5 text-text-sub-600 text-xs dark:text-white/50">
							Click any language to copy its package installation command
						</p>
					</div>

					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
						{sdkLanguages.map((lang) => (
							<button
								key={lang.name}
								type="button"
								onClick={() =>
									handleCopy(lang.command, `${lang.name} SDK install command`)
								}
								className="flex items-center gap-2 rounded-lg border border-stroke-soft-100 bg-white/40 p-2.5 text-left transition-colors hover:bg-bg-weak-50 dark:border-white/5 dark:bg-white/[0.01] dark:hover:bg-white/5"
							>
								<div
									className="flex h-7 w-7 shrink-0 items-center justify-center rounded transition-colors"
									style={{ backgroundColor: `#${lang.icon.hex}15` }}
								>
									<svg
										role="img"
										viewBox="0 0 24 24"
										className="h-3.5 w-3.5 shrink-0"
										fill="currentColor"
										xmlns="http://www.w3.org/2000/svg"
										style={{ color: `#${lang.icon.hex}` }}
									>
										<path d={lang.icon.path} />
									</svg>
								</div>
								<span className="truncate font-semibold text-text-strong-950 text-xs dark:text-white">
									{lang.name}
								</span>
							</button>
						))}
					</div>
				</div>

				{/* Framework Integrations */}
				<div className="space-y-4 rounded-xl border border-stroke-soft-100 bg-white p-5 dark:border-white/5 dark:bg-white/[0.01]">
					<div>
						<h3 className="font-semibold text-sm text-text-strong-950 dark:text-white">
							Framework Integrations
						</h3>
						<p className="mt-0.5 text-text-sub-600 text-xs dark:text-white/50">
							Boilerplates and integration templates for Node.js
						</p>
					</div>

					<div className="space-y-2.5">
						{frameworkIntegrations.map((item) => (
							<div
								key={item.name}
								className="group flex cursor-pointer items-start gap-3 rounded-lg border border-stroke-soft-100 bg-white/40 p-3 transition-colors hover:bg-bg-weak-50 dark:border-white/5 dark:bg-white/[0.01] dark:hover:bg-white/5"
							>
								<div
									className="flex h-8 w-8 shrink-0 items-center justify-center rounded transition-colors"
									style={{ backgroundColor: `#${item.icon.hex}15` }}
								>
									<svg
										role="img"
										viewBox="0 0 24 24"
										className="h-4 w-4 shrink-0"
										fill="currentColor"
										xmlns="http://www.w3.org/2000/svg"
										style={{ color: `#${item.icon.hex}` }}
									>
										<path d={item.icon.path} />
									</svg>
								</div>

								<div className="min-w-0 flex-1 space-y-0.5">
									<div className="flex items-center justify-between gap-2">
										<span className="font-semibold text-text-strong-950 text-xs group-hover:underline dark:text-white">
											{item.name}
										</span>
										<ArrowRight className="h-3 w-3 text-text-sub-400 opacity-0 transition-colors group-hover:text-text-strong-950 group-hover:opacity-100" />
									</div>
									<p className="text-[11px] text-text-sub-600 leading-relaxed dark:text-white/50">
										{item.desc}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
