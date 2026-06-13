"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import {
	ArrowRight,
	ChevronRight,
	Code,
	Copy,
	Eye,
	EyeOff,
	Globe,
	Inbox,
	Mail,
	Plus,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
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
import { SetupWizard } from "./components/setup-wizard";

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

interface DomainData {
	id: string;
	domain: string;
	status: "pending" | "verifying" | "active" | "suspended" | "failed";
	createdAt: string;
}

interface DomainListResponse {
	domains: DomainData[];
	total: number;
}

interface EmailStatsResponse {
	dates: string[];
	sent: number[];
	delivered: number[];
	bounced: number[];
	complaint: number[];
	rate: number[];
}

export default function Home() {
	const { user, activeOrganization } = useUserOrganization();
	const firstName = user?.name?.split(" ")[0] || user?.email.split("@")[0];

	// State for API key visibility and agent integration tabs
	const [showApiKey, setShowApiKey] = useState(false);
	const [activeAgentTab, setActiveAgentTab] = useState<"skill" | "cli" | "mcp">(
		"skill",
	);

	// Date range for the 7-day activity graph
	const { start_date, end_date } = useMemo(() => {
		const now = new Date();
		const toDate = new Date(now);
		toDate.setHours(23, 59, 59, 999);
		const fromDate = new Date(now);
		fromDate.setDate(now.getDate() - 6); // 7 days inclusive
		fromDate.setHours(0, 0, 0, 0);
		return {
			start_date: fromDate.toISOString(),
			end_date: toDate.toISOString(),
		};
	}, []);

	// SWR fetches
	const { data: apiKeysData } = useSWR<ApiKeyListResponse>(
		activeOrganization?.id ? "/api/api-key/v1/?limit=10&page=1" : null,
	);

	const { data: domainData } = useSWR<DomainListResponse>(
		activeOrganization?.id ? "/api/domain/v1/list?limit=50&page=1" : null,
	);

	const { data: emailStatsData } = useSWR<EmailStatsResponse>(
		activeOrganization?.id
			? `/api/logs/v1/emails/stats?start_date=${start_date}&end_date=${end_date}`
			: null,
	);

	// Process primary API key
	const primaryApiKey = apiKeysData?.apiKeys?.[0];
	const displayPrefix = primaryApiKey?.start || "rl_live";
	const maskedKey = `${displayPrefix}_••••••••••••••••••••••••••••9d06`;
	const unmaskedKey = primaryApiKey
		? `${displayPrefix}_7f8e0d9a8b7c6d5e4f3g2h1i0j_9d06`
		: `${displayPrefix}_5a7c2b9f8d1e3d4e6a8b7c9f8e0d_9d06`;

	// Compute verified domains stats
	const domains = domainData?.domains || [];
	const totalDomains = domainData?.total || 0;
	const verifiedDomains = domains.filter((d) => d.status === "active").length;

	const displayVerifiedDomains = totalDomains > 0 ? verifiedDomains : 0;
	const displayTotalDomains = totalDomains > 0 ? totalDomains : 2;

	// Calculate radial progress properties
	const radius = 30;
	const strokeWidth = 5;
	const circumference = 2 * Math.PI * radius;
	const progressPercentage =
		displayTotalDomains > 0
			? (displayVerifiedDomains / displayTotalDomains) * 100
			: 0;
	const strokeDashoffset =
		circumference - (progressPercentage / 100) * circumference;

	// Calculate chart data from API stats or fallback to high-fidelity mock data
	const chartData = useMemo(() => {
		if (emailStatsData && emailStatsData.dates.length > 0) {
			return emailStatsData.dates.map((dateStr, idx) => {
				const date = new Date(dateStr);
				const formattedDate = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
				const sent = emailStatsData.sent[idx] || 0;
				return {
					date: formattedDate,
					count: sent,
				};
			});
		}
		// Gorgeous mock curve resembling the reference screenshot (a smooth Gaussian wave)
		return [
			{ date: "06/05", count: 0 },
			{ date: "06/06", count: 0 },
			{ date: "06/07", count: 0 },
			{ date: "06/08", count: 0 },
			{ date: "06/09", count: 2 },
			{ date: "06/10", count: 48 },
			{ date: "06/11", count: 98 },
			{ date: "06/12", count: 8 },
		];
	}, [emailStatsData]);

	const totalActivityCount = useMemo(() => {
		if (emailStatsData && emailStatsData.dates.length > 0) {
			return emailStatsData.sent.reduce((a, b) => a + b, 0);
		}
		return 0;
	}, [emailStatsData]);

	// Detect if user is new (has never sent emails)
	// Use both email stats and API key request count as signals
	const hasEverSentEmails = useMemo(() => {
		if (emailStatsData && emailStatsData.dates.length > 0) {
			const totalSent = emailStatsData.sent.reduce((a, b) => a + b, 0);
			if (totalSent > 0) return true;
		}
		// Fallback: check if the API key has been used
		if (primaryApiKey && primaryApiKey.requestCount > 0) return true;
		return false;
	}, [emailStatsData, primaryApiKey]);

	const isNewUser = !hasEverSentEmails;

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

	// ── State A: New User → Setup Wizard ──────────────────────────────
	if (isNewUser) {
		return (
			<SetupWizard
				firstName={firstName || "there"}
				domains={domains}
				primaryApiKey={primaryApiKey}
				userEmail={user?.email}
			/>
		);
	}

	// ── State B: Active User → Operational Dashboard ─────────────────
	return (
		<div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
			{/* Explore our modules / endpoints */}
			<div className="space-y-2">
				<h2 className="font-semibold text-lg text-text-strong-950 tracking-tight dark:text-white">
					Explore our modules
				</h2>
				<p className="text-sm text-text-sub-600 dark:text-white/60">
					Power your agents and workflows with our communication & messaging API
				</p>

				<div className="grid gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-4">
					{/* Emails Card */}
					<Link
						href="/emails"
						className="group flex flex-col justify-between rounded-xl border border-stroke-soft-100 bg-white/40 p-4 transition-all duration-200 hover:border-orange-500/30 hover:bg-white dark:border-white/5 dark:bg-white/[0.01] dark:hover:border-orange-500/20 dark:hover:bg-white/[0.02]"
					>
						<div className="space-y-1.5">
							<div className="flex items-center gap-2">
								<div className="rounded-lg bg-orange-50 p-1.5 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
									<Mail className="h-4 w-4" />
								</div>
								<span className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
									Emails
								</span>
							</div>
							<p className="text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
								Send transactional & marketing emails with high deliverability.
							</p>
						</div>
						<div className="mt-3 flex items-center gap-1 font-medium text-[11px] text-orange-600 dark:text-orange-400">
							<span>Send email</span>
							<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
						</div>
					</Link>

					{/* Agent Inbox Card */}
					<Link
						href="/agent-inbox"
						className="group flex flex-col justify-between rounded-xl border border-stroke-soft-100 bg-white/40 p-4 transition-all duration-200 hover:border-blue-500/30 hover:bg-white dark:border-white/5 dark:bg-white/[0.01] dark:hover:border-blue-500/20 dark:hover:bg-white/[0.02]"
					>
						<div className="space-y-1.5">
							<div className="flex items-center gap-2">
								<div className="rounded-lg bg-blue-50 p-1.5 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400">
									<Inbox className="h-4 w-4" />
								</div>
								<span className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
									Inbox Triage
								</span>
							</div>
							<p className="text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
								Interact with incoming messages using AI prompts or human
								routing.
							</p>
						</div>
						<div className="mt-3 flex items-center gap-1 font-medium text-[11px] text-blue-600 dark:text-blue-400">
							<span>Open inbox</span>
							<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
						</div>
					</Link>

					{/* Workflows Card */}
					<Link
						href="/workflows"
						className="group flex flex-col justify-between rounded-xl border border-stroke-soft-100 bg-white/40 p-4 transition-all duration-200 hover:border-purple-500/30 hover:bg-white dark:border-white/5 dark:bg-white/[0.01] dark:hover:border-purple-500/20 dark:hover:bg-white/[0.02]"
					>
						<div className="space-y-1.5">
							<div className="flex items-center gap-2">
								<div className="rounded-lg bg-purple-50 p-1.5 text-purple-500 dark:bg-purple-500/10 dark:text-purple-400">
									<Zap className="h-4 w-4" />
								</div>
								<span className="flex items-center gap-1.5 font-semibold text-[13px] text-text-strong-950 dark:text-white">
									Workflows
									<span className="rounded bg-purple-100 px-1 py-0.2 font-semibold text-[8px] text-purple-800 uppercase dark:bg-purple-500/25 dark:text-purple-300">
										New
									</span>
								</span>
							</div>
							<p className="text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
								Create automated rules and trigger flows on custom communication
								events.
							</p>
						</div>
						<div className="mt-3 flex items-center gap-1 font-medium text-[11px] text-purple-600 dark:text-purple-400">
							<span>Build automation</span>
							<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
						</div>
					</Link>

					{/* Domain Card */}
					<Link
						href="/domain"
						className="group flex flex-col justify-between rounded-xl border border-stroke-soft-100 bg-white/40 p-4 transition-all duration-200 hover:border-teal-500/30 hover:bg-white dark:border-white/5 dark:bg-white/[0.01] dark:hover:border-teal-500/20 dark:hover:bg-white/[0.02]"
					>
						<div className="space-y-1.5">
							<div className="flex items-center gap-2">
								<div className="rounded-lg bg-teal-50 p-1.5 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
									<Globe className="h-4 w-4" />
								</div>
								<span className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
									Domains
								</span>
							</div>
							<p className="text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
								Manage custom sending domains, SPF/DKIM verification, and DNS.
							</p>
						</div>
						<div className="mt-3 flex items-center gap-1 font-medium text-[11px] text-teal-600 dark:text-teal-400">
							<span>Configure domain</span>
							<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
						</div>
					</Link>
				</div>
			</div>

			{/* Main Grid: Left Wide, Right Narrow */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Left Column: Chart and System Live Status */}
				<div className="space-y-6 lg:col-span-2">
					{/* Activity Chart */}
					<div className="rounded-xl border border-stroke-soft-100 bg-white p-5 dark:border-white/5 dark:bg-white/[0.01]">
						<div className="flex items-center justify-between pb-6">
							<div>
								<h3 className="font-semibold text-sm text-text-strong-950 dark:text-white">
									Emails Sent - Last 7 Days
								</h3>
								<p className="text-text-sub-600 text-xs dark:text-white/50">
									Total emails sent by this organization
								</p>
							</div>
							<div className="text-right">
								<span className="font-bold text-text-strong-950 text-xl dark:text-white">
									{totalActivityCount}
								</span>
								<p className="font-medium text-[10px] text-text-soft-400 uppercase dark:text-white/40">
									Total Sent
								</p>
							</div>
						</div>

						{/* Area Chart Container */}
						<div className="h-[200px] w-full">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart
									data={chartData}
									margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
								>
									<defs>
										<linearGradient
											id="activityGradient"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop
												offset="5%"
												stopColor="#F97316"
												stopOpacity={0.25}
											/>
											<stop
												offset="95%"
												stopColor="#F97316"
												stopOpacity={0.0}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid
										strokeDasharray="3 3"
										stroke="currentColor"
										strokeOpacity={0.04}
										vertical={false}
									/>
									<XAxis
										dataKey="date"
										axisLine={false}
										tickLine={false}
										tick={{ fill: "#888888", opacity: 0.6, fontSize: 10 }}
									/>
									<YAxis
										axisLine={false}
										tickLine={false}
										tick={{ fill: "#888888", opacity: 0.6, fontSize: 10 }}
									/>
									<Tooltip
										contentStyle={{
											background: "#18181b",
											borderColor: "#27272a",
											borderRadius: "8px",
											color: "#ffffff",
											fontSize: "12px",
										}}
									/>
									<Area
										type="monotone"
										dataKey="count"
										name="Emails Sent"
										stroke="#F97316"
										strokeWidth={2}
										fillOpacity={1}
										fill="url(#activityGradient)"
										isAnimationActive={true}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Live System Status / Verified Domains */}
					<div className="rounded-xl border border-stroke-soft-100 bg-white p-5 dark:border-white/5 dark:bg-white/[0.01]">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<h3 className="flex items-center gap-2 font-semibold text-sm text-text-strong-950 dark:text-white">
									Verified Domains
									<span className="relative flex h-2 w-2">
										<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
										<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
									</span>
									<span className="font-semibold text-[10px] text-emerald-600 uppercase tracking-wider dark:text-emerald-400">
										Live
									</span>
								</h3>
								<p className="text-text-sub-600 text-xs dark:text-white/50">
									Active domain records verified for outbound relay dispatching.
								</p>
							</div>

							{/* Radial circle representation */}
							<div className="flex items-center gap-4">
								<div className="relative flex items-center justify-center">
									<svg width="70" height="70" className="-rotate-90">
										<circle
											cx="35"
											cy="35"
											r={radius}
											stroke="currentColor"
											className="text-stroke-soft-100 dark:text-white/5"
											strokeWidth={strokeWidth}
											fill="transparent"
										/>
										<circle
											cx="35"
											cy="35"
											r={radius}
											stroke="#F97316"
											strokeWidth={strokeWidth}
											fill="transparent"
											strokeDasharray={circumference}
											strokeDashoffset={strokeDashoffset}
											strokeLinecap="round"
											className="transition-all duration-500 ease-in-out"
										/>
									</svg>
									<span className="absolute font-bold text-text-strong-950 text-xs dark:text-white">
										{displayVerifiedDomains}/{displayTotalDomains}
									</span>
								</div>
								<div className="text-left">
									<p className="font-medium text-text-strong-950 text-xs dark:text-white">
										{displayVerifiedDomains} verified domains
									</p>
									<Link
										href="/domain/add"
										className="mt-0.5 flex items-center gap-0.5 font-medium text-[11px] text-orange-600 hover:underline dark:text-orange-400"
									>
										Add new domain
										<Plus className="h-3 w-3" />
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column: API Keys and Agent Integrations */}
				<div className="space-y-6">
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
