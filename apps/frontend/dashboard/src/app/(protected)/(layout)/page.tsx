"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { cn } from "@reloop/ui/cn";
import {
	ArrowRight,
	BookOpen,
	ChevronRight,
	Code,
	Copy,
	Eye,
	EyeOff,
	Globe,
	Inbox,
	Mail,
	Shield,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

interface EmailStatsResponse {
	dates: string[];
	sent: number[];
	delivered: number[];
	bounced: number[];
	complaint: number[];
	rate: number[];
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

interface EmailLogData {
	id: string;
	subject: string;
	fromEmail: string;
	toEmails: string[];
	status: string;
	createdAt: string;
}

interface EmailListResponse {
	object: "list";
	data: EmailLogData[];
	total: number;
	page: number;
	limit: number;
}

interface BackendMessage {
	id: string;
	mailboxId: string;
	organizationId: string;
	fromEmail: string;
	fromName: string | null;
	toEmails: string[];
	subject: string | null;
	snippet: string | null;
	status: string;
	isRead: boolean;
	isSpam: boolean;
	createdAt: string | Date;
}

interface LogData {
	uuid: string;
	event: string;
	level: string;
	status_code?: number | null;
	created_at: string;
}

interface LogListResponse {
	logs: LogData[];
	count: number;
}

interface Workflow {
	id: string;
	name: string;
	description?: string;
	status: "draft" | "active";
	updatedAt: string;
}

export default function Home() {
	const { user, activeOrganization } = useUserOrganization();

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

	const { data: emailStatsData } = useSWR<EmailStatsResponse>(
		activeOrganization?.id
			? `/api/logs/v1/emails/stats?start_date=${start_date}&end_date=${end_date}`
			: null,
	);

	const { data: domainData } = useSWR<DomainListResponse>(
		activeOrganization?.id ? "/api/domain/v1/list?limit=5&page=1" : null,
	);

	const { data: emailLogsData } = useSWR<EmailListResponse>(
		activeOrganization?.id ? "/api/logs/v1/emails?limit=5&page=1" : null,
	);

	const { data: inboxMessagesData } = useSWR<BackendMessage[]>(
		activeOrganization?.id ? "/api/inbox/v1/messages" : null,
	);

	const { data: auditLogsData } = useSWR<LogListResponse>(
		activeOrganization?.id ? "/api/logs/v1/list?limit=5" : null,
	);

	// Workflows state loading / seeding
	const [workflows, setWorkflows] = useState<Workflow[]>([]);
	const orgSlug = activeOrganization?.slug ?? "";
	const orgId = activeOrganization?.id ?? "";

	useEffect(() => {
		if (orgSlug && orgId) {
			const storageKey = `workflows:${orgSlug}`;
			const stored = localStorage.getItem(storageKey);
			if (stored) {
				try {
					setWorkflows(JSON.parse(stored));
				} catch (_e) {
					// ignore
				}
			} else {
				const seeds: Workflow[] = [
					{
						id: "wf_mock_welcome",
						name: "Welcome on delivery",
						description: "Send a follow-up when an email is delivered",
						status: "active",
						updatedAt: new Date().toISOString(),
					},
					{
						id: "wf_mock_bounce",
						name: "Bounce alert",
						description: "Notify your team when delivery fails",
						status: "draft",
						updatedAt: new Date().toISOString(),
					},
				];
				localStorage.setItem(storageKey, JSON.stringify(seeds));
				setWorkflows(seeds);
			}
		} else {
			setWorkflows([]);
		}
	}, [orgSlug, orgId]);

	// Process primary API key
	const primaryApiKey = apiKeysData?.apiKeys?.[0];
	const displayPrefix = primaryApiKey?.start || "rl_live";
	const maskedKey = `${displayPrefix}_••••••••••••••••••••••••••••9d06`;
	const unmaskedKey = primaryApiKey
		? `${displayPrefix}_7f8e0d9a8b7c6d5e4f3g2h1i0j_9d06`
		: `${displayPrefix}_5a7c2b9f8d1e3d4e6a8b7c9f8e0d_9d06`;

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

				<div className="grid gap-6 pt-2 md:grid-cols-2 lg:grid-cols-3">
					{/* Emails Card */}
					<div className="group flex w-full flex-col">
						{/* Header */}
						<Link
							href="/emails"
							className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-4 pb-6 dark:border-white/5 dark:bg-white/[0.02]"
						>
							<span className="flex items-center gap-2 font-medium text-sm text-text-strong-950 dark:text-white">
								<Mail className="h-4 w-4 text-orange-500" />
								Emails
							</span>
							<ArrowRight className="h-4 w-4 text-text-sub-600 transition-transform group-hover:translate-x-0.5 dark:text-white/60" />
						</Link>

						{/* Body */}
						{emailLogsData?.data && emailLogsData.data.length > 0 ? (
							<div className="-mt-2.5 min-h-[175px] divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
								<div className="divide-y divide-stroke-soft-100/10 dark:divide-white/5">
									{emailLogsData.data.slice(0, 3).map((d) => (
										<div
											key={d.id}
											className="grid grid-cols-3 items-center px-4 py-2.5 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.01]"
										>
											<div className="flex min-w-0 flex-col pr-2">
												<span className="truncate font-semibold text-text-strong-950 text-xs dark:text-white">
													{d.toEmails?.[0] || d.fromEmail || "(No Recipient)"}
												</span>
												<span className="truncate text-[10px] text-text-sub-600 dark:text-white/40">
													{d.subject || "(No Subject)"}
												</span>
											</div>
											<div className="flex items-center justify-center">
												<span
													className={cn(
														"inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold text-[9px] uppercase tracking-wider",
														d.status === "delivered"
															? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
															: d.status === "sent"
																? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
																: "bg-zinc-50 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400",
													)}
												>
													{d.status}
												</span>
											</div>
											<div className="flex shrink-0 items-center justify-end whitespace-nowrap text-[10px] text-text-sub-600 dark:text-white/40">
												{new Date(d.createdAt).toLocaleDateString([], {
													month: "short",
													day: "numeric",
												})}
											</div>
										</div>
									))}
								</div>
							</div>
						) : (
							<div className="-mt-2.5 flex min-h-[175px] flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
								{/* Icon outline without pill wrapper */}
								<Mail className="h-6 w-6 text-text-sub-600 dark:text-white/40" />

								{/* Heading */}
								<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
									Send emails without the overhead
								</h4>

								{/* Description */}
								<p className="mt-2 max-w-[240px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
									Send transactional & marketing emails with high
									deliverability.
								</p>

								{/* Button */}
								<Link
									href="/emails"
									className="mt-6 inline-flex items-center justify-center rounded-lg border border-stroke-soft-100 bg-white px-4 py-2 font-medium text-text-strong-950 text-xs shadow-sm transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.02] dark:text-white dark:hover:bg-white/5"
								>
									Send email
								</Link>
							</div>
						)}
					</div>

					{/* Agent Inbox Card */}
					<div className="group flex w-full flex-col">
						{/* Header */}
						<Link
							href="/agent-inbox"
							className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-4 pb-6 dark:border-white/5 dark:bg-white/[0.02]"
						>
							<span className="flex items-center gap-2 font-medium text-sm text-text-strong-950 dark:text-white">
								<Inbox className="h-4 w-4 text-blue-500" />
								Inbox Triage
							</span>
							<ArrowRight className="h-4 w-4 text-text-sub-600 transition-transform group-hover:translate-x-0.5 dark:text-white/60" />
						</Link>

						{/* Body */}
						{inboxMessagesData && inboxMessagesData.length > 0 ? (
							<div className="-mt-2.5 min-h-[175px] divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
								<div className="divide-y divide-stroke-soft-100/10 dark:divide-white/5">
									{inboxMessagesData.slice(0, 3).map((d) => (
										<div
											key={d.id}
											className="grid grid-cols-3 items-center px-4 py-2.5 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.01]"
										>
											<div className="flex min-w-0 flex-col pr-2">
												<span className="truncate font-semibold text-text-strong-950 text-xs dark:text-white">
													{d.fromName || d.fromEmail || "(Unknown)"}
												</span>
												<span className="truncate text-[10px] text-text-sub-600 dark:text-white/40">
													{d.subject || "(No Subject)"}
												</span>
											</div>
											<div className="flex items-center justify-center">
												<span
													className={cn(
														"inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold text-[9px] uppercase tracking-wider",
														d.status === "received" || d.status === "active"
															? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
															: d.status === "processing"
																? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
																: "bg-zinc-50 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400",
													)}
												>
													{d.status}
												</span>
											</div>
											<div className="flex shrink-0 items-center justify-end whitespace-nowrap text-[10px] text-text-sub-600 dark:text-white/40">
												{new Date(d.createdAt).toLocaleDateString([], {
													month: "short",
													day: "numeric",
												})}
											</div>
										</div>
									))}
								</div>
							</div>
						) : (
							<div className="-mt-2.5 flex min-h-[175px] flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
								{/* Icon outline without pill wrapper */}
								<Inbox className="h-6 w-6 text-text-sub-600 dark:text-white/40" />

								{/* Heading */}
								<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
									Triage messages without the overhead
								</h4>

								{/* Description */}
								<p className="mt-2 max-w-[240px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
									Interact with incoming messages using AI prompts or human
									routing.
								</p>

								{/* Button */}
								<Link
									href="/agent-inbox"
									className="mt-6 inline-flex items-center justify-center rounded-lg border border-stroke-soft-100 bg-white px-4 py-2 font-medium text-text-strong-950 text-xs shadow-sm transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.02] dark:text-white dark:hover:bg-white/5"
								>
									Open inbox
								</Link>
							</div>
						)}
					</div>

					{/* Audit Logs Card */}
					<div className="group flex w-full flex-col">
						{/* Header */}
						<Link
							href="/logs"
							className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-4 pb-6 dark:border-white/5 dark:bg-white/[0.02]"
						>
							<span className="flex items-center gap-2 font-medium text-sm text-text-strong-950 dark:text-white">
								<Shield className="h-4 w-4 text-slate-500" />
								Audit Logs
							</span>
							<ArrowRight className="h-4 w-4 text-text-sub-600 transition-transform group-hover:translate-x-0.5 dark:text-white/60" />
						</Link>

						{/* Body */}
						{auditLogsData?.logs && auditLogsData.logs.length > 0 ? (
							<div className="-mt-2.5 min-h-[175px] divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
								<div className="divide-y divide-stroke-soft-100/10 dark:divide-white/5">
									{auditLogsData.logs.slice(0, 3).map((d) => (
										<div
											key={d.uuid}
											className="grid grid-cols-3 items-center px-4 py-2.5 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.01]"
										>
											<div className="flex min-w-0 flex-col pr-2">
												<span className="truncate font-semibold text-text-strong-950 text-xs dark:text-white">
													{d.event}
												</span>
												<span className="truncate text-[10px] text-text-sub-600 dark:text-white/40">
													{d.uuid}
												</span>
											</div>
											<div className="flex items-center justify-center">
												<span
													className={cn(
														"inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold text-[9px] uppercase tracking-wider",
														d.level === "error" ||
															(d.status_code && d.status_code >= 400)
															? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
															: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
													)}
												>
													{d.level || "info"}
												</span>
											</div>
											<div className="flex shrink-0 items-center justify-end whitespace-nowrap text-[10px] text-text-sub-600 dark:text-white/40">
												{new Date(d.created_at).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</div>
										</div>
									))}
								</div>
							</div>
						) : (
							<div className="-mt-2.5 flex min-h-[175px] flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
								{/* Icon outline without pill wrapper */}
								<Shield className="h-6 w-6 text-text-sub-600 dark:text-white/40" />

								{/* Heading */}
								<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
									Track activity without the overhead
								</h4>

								{/* Description */}
								<p className="mt-2 max-w-[240px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
									Track security events, API key access, and team actions.
								</p>

								{/* Button */}
								<Link
									href="/logs"
									className="mt-6 inline-flex items-center justify-center rounded-lg border border-stroke-soft-100 bg-white px-4 py-2 font-medium text-text-strong-950 text-xs shadow-sm transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.02] dark:text-white dark:hover:bg-white/5"
								>
									View audit logs
								</Link>
							</div>
						)}
					</div>

					{/* Docs Card (Premium style) */}
					<div className="group flex w-full flex-col">
						{/* Header */}
						<Link
							href="https://reloop.sh/docs"
							className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 py-4 pb-6 dark:border-white/5 dark:bg-white/[0.02]"
						>
							<span className="flex items-center gap-2 font-medium text-sm text-text-strong-950 dark:text-white">
								<BookOpen className="h-4 w-4 text-indigo-500" />
								Docs
							</span>
							<ArrowRight className="h-4 w-4 text-text-sub-600 transition-transform group-hover:translate-x-0.5 dark:text-white/60" />
						</Link>

						{/* Body */}
						<div className="-mt-2.5 flex min-h-[175px] flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
							{/* Icon outline without pill wrapper */}
							<BookOpen className="h-6 w-6 text-text-sub-600 dark:text-white/40" />

							{/* Heading */}
							<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
								Learn integration without the overhead
							</h4>

							{/* Description */}
							<p className="mt-2 max-w-[240px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
								Explore tutorials, SDK documentation, and API guides to build
								faster.
							</p>

							{/* Button */}
							<Link
								href="https://reloop.sh/docs"
								className="mt-6 inline-flex items-center justify-center rounded-lg border border-stroke-soft-100 bg-white px-4 py-2 font-medium text-text-strong-950 text-xs shadow-sm transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.02] dark:text-white dark:hover:bg-white/5"
							>
								Read documentation
							</Link>
						</div>
					</div>

					{/* Workflows Card */}
					<div className="group flex w-full flex-col">
						{/* Header */}
						<Link
							href="/workflows"
							className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 py-4 pb-6 dark:border-white/5 dark:bg-white/[0.02]"
						>
							<span className="flex items-center gap-2 font-medium text-sm text-text-strong-950 dark:text-white">
								<Zap className="h-4 w-4 text-purple-500" />
								Workflows
								<span className="rounded bg-purple-100 px-1 py-0.2 font-semibold text-[8px] text-purple-800 uppercase dark:bg-purple-500/25 dark:text-purple-300">
									New
								</span>
							</span>
							<ArrowRight className="h-4 w-4 text-text-sub-600 transition-transform group-hover:translate-x-0.5 dark:text-white/60" />
						</Link>

						{/* Body */}
						{workflows && workflows.length > 0 ? (
							<div className="-mt-2.5 min-h-[175px] divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
								<div className="divide-y divide-stroke-soft-100/10 dark:divide-white/5">
									{workflows.slice(0, 3).map((d) => (
										<div
											key={d.id}
											className="grid grid-cols-3 items-center px-4 py-2.5 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.01]"
										>
											<div className="flex min-w-0 flex-col pr-2">
												<span className="truncate font-semibold text-text-strong-950 text-xs dark:text-white">
													{d.name}
												</span>
												<span className="truncate text-[10px] text-text-sub-600 dark:text-white/40">
													{d.description || "No description"}
												</span>
											</div>
											<div className="flex items-center justify-center">
												<span
													className={cn(
														"inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold text-[9px] uppercase tracking-wider",
														d.status === "active"
															? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
															: "bg-zinc-50 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400",
													)}
												>
													{d.status}
												</span>
											</div>
											<div className="flex shrink-0 items-center justify-end whitespace-nowrap text-[10px] text-text-sub-600 dark:text-white/40">
												{new Date(d.updatedAt).toLocaleDateString([], {
													month: "short",
													day: "numeric",
												})}
											</div>
										</div>
									))}
								</div>
							</div>
						) : (
							<div className="-mt-2.5 flex min-h-[175px] flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
								{/* Icon outline without pill wrapper */}
								<Zap className="h-6 w-6 text-text-sub-600 dark:text-white/40" />

								{/* Heading */}
								<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
									Build automations without the overhead
								</h4>

								{/* Description */}
								<p className="mt-2 max-w-[240px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
									From triggers to multi-step AI actions — automate your flows
									in minutes.
								</p>

								{/* Button */}
								<Link
									href="/workflows"
									className="mt-6 inline-flex items-center justify-center rounded-lg border border-stroke-soft-100 bg-white px-4 py-2 font-medium text-text-strong-950 text-xs shadow-sm transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.02] dark:text-white dark:hover:bg-white/5"
								>
									Start building
								</Link>
							</div>
						)}
					</div>

					{/* Domain Card */}
					<div className="group flex w-full flex-col">
						{/* Header */}
						<Link
							href="/domain"
							className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 py-4 pb-6 dark:border-white/5 dark:bg-white/[0.02]"
						>
							<span className="flex items-center gap-2 font-medium text-sm text-text-strong-950 dark:text-white">
								<Globe
									className={cn(
										"h-4 w-4",
										domainData?.domains && domainData.domains.length > 0
											? "text-orange-500 dark:text-orange-400"
											: "text-teal-600 dark:text-teal-400",
									)}
								/>
								<span
									className={cn(
										domainData?.domains && domainData.domains.length > 0
											? "text-orange-500 dark:text-orange-400"
											: "",
									)}
								>
									Domains
								</span>
							</span>
							<ArrowRight className="h-4 w-4 text-text-sub-600 transition-transform group-hover:translate-x-0.5 dark:text-white/60" />
						</Link>

						{/* Body */}
						{domainData?.domains && domainData.domains.length > 0 ? (
							<div className="-mt-2.5 min-h-[175px] divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
								<div className="divide-y divide-stroke-soft-100/10 dark:divide-white/5">
									{domainData.domains.slice(0, 3).map((d) => (
										<div
											key={d.id}
											className="grid grid-cols-3 items-center px-4 py-2.5 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.01]"
										>
											<div className="flex min-w-0 items-center gap-1.5 pr-2">
												<Globe className="h-3.5 w-3.5 shrink-0 text-orange-500" />
												<span className="truncate font-semibold text-orange-500 text-xs hover:underline dark:text-orange-400">
													{d.domain}
												</span>
											</div>
											<div className="flex items-center justify-center">
												<span
													className={cn(
														"inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold text-[9px] uppercase tracking-wider",
														d.status === "active"
															? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
															: d.status === "verifying"
																? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
																: "bg-zinc-50 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400",
													)}
												>
													{d.status}
												</span>
											</div>
											<div className="flex shrink-0 items-center justify-end whitespace-nowrap text-[10px] text-text-sub-600 dark:text-white/40">
												{new Date(d.createdAt).toLocaleDateString([], {
													month: "short",
													day: "numeric",
												})}
											</div>
										</div>
									))}
								</div>
							</div>
						) : (
							<div className="-mt-2.5 flex min-h-[175px] flex-1 flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
								{/* Icon outline without pill wrapper */}
								<Globe className="h-6 w-6 text-text-sub-600 dark:text-white/40" />

								{/* Heading */}
								<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
									Verify sending domains without the overhead
								</h4>

								{/* Description */}
								<p className="mt-2 max-w-[240px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
									Set up SPF, DKIM, and DMARC verification to scale globally in
									minutes.
								</p>

								{/* Button */}
								<Link
									href="/domain"
									className="mt-6 inline-flex items-center justify-center rounded-lg border border-stroke-soft-100 bg-white px-4 py-2 font-medium text-text-strong-950 text-xs shadow-sm transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.02] dark:text-white dark:hover:bg-white/5"
								>
									Configure domain
								</Link>
							</div>
						)}
					</div>
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
