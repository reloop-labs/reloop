"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { Icon } from "@reloop/ui/icon";
import {
	ArrowRight,
	CheckCircle2,
	Clock,
	FileCode,
	GitBranch,
	Globe,
	Inbox,
	Mail,
	Plus,
	Sparkles,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
	const { user } = useUserOrganization();
	const firstName = user?.name?.split(" ")[0] || user?.email.split("@")[0];

	const greeting = (() => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 18) return "Good afternoon";
		return "Good evening";
	})();

	return (
		<div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
			{/* Welcome Section */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-semibold text-2xl text-text-strong-950 tracking-tight dark:text-white">
						{greeting}, {firstName}
					</h1>
					<p className="mt-1 text-sm text-text-sub-600 dark:text-white/60">
						Here is what's happening with your workspace today.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Link
						href="/ai"
						className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#EC4899] px-4 py-2 font-medium text-sm text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md"
					>
						<Sparkles className="h-4 w-4" />
						Ask AI Assistant
					</Link>
				</div>
			</div>

			{/* Metrics Grid */}
			<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
				{/* Pending Mail Card */}
				<div className="group relative rounded-2xl border border-stroke-soft-100 bg-white p-5 transition-all duration-200 hover:border-stroke-soft-200 hover:shadow-sm dark:border-white/5 dark:bg-white/[0.02] dark:hover:border-white/10">
					<div className="flex items-center justify-between">
						<span className="font-medium text-sm text-text-sub-600 dark:text-white/60">
							Inbox Triage
						</span>
						<div className="rounded-xl bg-blue-50/80 p-2 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
							<Inbox className="h-4 w-4" />
						</div>
					</div>
					<div className="mt-4 flex items-baseline gap-2">
						<span className="font-semibold text-2xl text-text-strong-950 dark:text-white">
							18
						</span>
						<span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700 text-xs dark:bg-blue-500/10 dark:text-blue-400">
							4 Urgent
						</span>
					</div>
					<p className="mt-2 text-text-soft-400 text-xs dark:text-white/40">
						Pending conversation triage
					</p>
				</div>

				{/* Success Deliverability Card */}
				<div className="group relative rounded-2xl border border-stroke-soft-100 bg-white p-5 transition-all duration-200 hover:border-stroke-soft-200 hover:shadow-sm dark:border-white/5 dark:bg-white/[0.02] dark:hover:border-white/10">
					<div className="flex items-center justify-between">
						<span className="font-medium text-sm text-text-sub-600 dark:text-white/60">
							Deliverability
						</span>
						<div className="rounded-xl bg-green-50/80 p-2 text-green-600 dark:bg-green-500/10 dark:text-green-400">
							<TrendingUp className="h-4 w-4" />
						</div>
					</div>
					<div className="mt-4 flex items-baseline gap-2">
						<span className="font-semibold text-2xl text-text-strong-950 dark:text-white">
							99.8%
						</span>
						<span className="rounded-full bg-green-50 px-2 py-0.5 font-medium text-green-700 text-xs dark:bg-green-500/10 dark:text-green-400">
							+0.2%
						</span>
					</div>
					<p className="mt-2 text-text-soft-400 text-xs dark:text-white/40">
						SMTP dispatch healthy
					</p>
				</div>

				{/* Avg Response Time Card */}
				<div className="group relative rounded-2xl border border-stroke-soft-100 bg-white p-5 transition-all duration-200 hover:border-stroke-soft-200 hover:shadow-sm dark:border-white/5 dark:bg-white/[0.02] dark:hover:border-white/10">
					<div className="flex items-center justify-between">
						<span className="font-medium text-sm text-text-sub-600 dark:text-white/60">
							Response Time
						</span>
						<div className="rounded-xl bg-purple-50/80 p-2 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
							<Clock className="h-4 w-4" />
						</div>
					</div>
					<div className="mt-4 flex items-baseline gap-2">
						<span className="font-semibold text-2xl text-text-strong-950 dark:text-white">
							12m
						</span>
						<span className="rounded-full bg-purple-50 px-2 py-0.5 font-medium text-purple-700 text-xs dark:bg-purple-500/10 dark:text-purple-400">
							-4m
						</span>
					</div>
					<p className="mt-2 text-text-soft-400 text-xs dark:text-white/40">
						Average agent reply time
					</p>
				</div>

				{/* Workflows Success Card */}
				<div className="group relative rounded-2xl border border-stroke-soft-100 bg-white p-5 transition-all duration-200 hover:border-stroke-soft-200 hover:shadow-sm dark:border-white/5 dark:bg-white/[0.02] dark:hover:border-white/10">
					<div className="flex items-center justify-between">
						<span className="font-medium text-sm text-text-sub-600 dark:text-white/60">
							Automation
						</span>
						<div className="rounded-xl bg-amber-50/80 p-2 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
							<Zap className="h-4 w-4" />
						</div>
					</div>
					<div className="mt-4 flex items-baseline gap-2">
						<span className="font-semibold text-2xl text-text-strong-950 dark:text-white">
							94.1%
						</span>
						<span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-750 text-xs dark:bg-amber-500/10 dark:text-amber-400">
							2,481 runs
						</span>
					</div>
					<p className="mt-2 text-text-soft-400 text-xs dark:text-white/40">
						Workflow run success rate
					</p>
				</div>
			</div>

			{/* Detailed Split Grid */}
			<div className="grid gap-8 lg:grid-cols-3">
				{/* Recent Activity Queue (2 cols wide on desktop) */}
				<div className="rounded-2xl border border-stroke-soft-100 bg-white p-6 dark:border-white/5 dark:bg-white/[0.01] lg:col-span-2">
					<div className="mb-6 flex items-center justify-between">
						<div>
							<h3 className="font-medium text-base text-text-strong-950 dark:text-white">
								Recent Conversations
							</h3>
							<p className="mt-0.5 text-text-sub-600 text-xs dark:text-white/60">
								Incoming triage requests waiting for action
							</p>
						</div>
						<Link
							href="/agent-inbox"
							className="inline-flex items-center gap-1 font-medium text-blue-600 text-xs hover:underline dark:text-blue-400"
						>
							View all
							<ArrowRight className="h-3 w-3" />
						</Link>
					</div>

					<div className="divide-y divide-stroke-soft-100 dark:divide-white/5">
						{/* Item 1 */}
						<div className="group flex items-center justify-between py-4 first:pt-0 last:pb-0">
							<div className="flex items-center gap-3 min-w-0">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 font-semibold text-sm text-text-strong-950 dark:bg-white/5 dark:text-white">
									SJ
								</div>
								<div className="min-w-0">
									<p className="font-medium text-sm text-text-strong-950 dark:text-white">
										Sarah Jenkins
									</p>
									<p className="truncate text-text-sub-600 text-xs dark:text-white/60">
										Question about API integration keys
									</p>
								</div>
							</div>
							<div className="flex items-center gap-4 shrink-0 pl-3">
								<span className="rounded-full bg-rose-50 px-2 py-0.5 font-medium text-rose-700 text-xs dark:bg-rose-500/10 dark:text-rose-400">
									Urgent
								</span>
								<span className="text-text-soft-400 text-xs dark:text-white/40">
									12m ago
								</span>
							</div>
						</div>

						{/* Item 2 */}
						<div className="group flex items-center justify-between py-4 first:pt-0 last:pb-0">
							<div className="flex items-center gap-3 min-w-0">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 font-semibold text-sm text-text-strong-950 dark:bg-white/5 dark:text-white">
									DM
								</div>
								<div className="min-w-0">
									<p className="font-medium text-sm text-text-strong-950 dark:text-white">
										David Miller
									</p>
									<p className="truncate text-text-sub-600 text-xs dark:text-white/60">
										SMTP relay server setup instructions
									</p>
								</div>
							</div>
							<div className="flex items-center gap-4 shrink-0 pl-3">
								<span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-text-sub-600 text-xs dark:bg-white/5 dark:text-white/60">
									Replied
								</span>
								<span className="text-text-soft-400 text-xs dark:text-white/40">
									1h ago
								</span>
							</div>
						</div>

						{/* Item 3 */}
						<div className="group flex items-center justify-between py-4 first:pt-0 last:pb-0">
							<div className="flex items-center gap-3 min-w-0">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 font-semibold text-sm text-text-strong-950 dark:bg-white/5 dark:text-white">
									AR
								</div>
								<div className="min-w-0">
									<p className="font-medium text-sm text-text-strong-950 dark:text-white">
										Alex Rivera
									</p>
									<p className="truncate text-text-sub-600 text-xs dark:text-white/60">
										Meeting rescheduled for next Thursday
									</p>
								</div>
							</div>
							<div className="flex items-center gap-4 shrink-0 pl-3">
								<span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-text-sub-600 text-xs dark:bg-white/5 dark:text-white/60">
									Replied
								</span>
								<span className="text-text-soft-400 text-xs dark:text-white/40">
									3h ago
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Quick Actions Panel (1 col wide on desktop) */}
				<div className="space-y-6">
					<div className="rounded-2xl border border-stroke-soft-100 bg-white p-6 dark:border-white/5 dark:bg-white/[0.01]">
						<h3 className="mb-4 font-medium text-base text-text-strong-950 dark:text-white">
							Quick Actions
						</h3>
						<div className="grid gap-3">
							<Link
								href="/emails"
								className="flex items-center gap-3 rounded-xl border border-stroke-soft-100 bg-white p-3 font-medium text-sm text-text-sub-600 transition-all hover:bg-bg-weak-50 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/70 dark:hover:bg-white/5"
							>
								<div className="rounded-lg bg-zinc-50 p-1.5 dark:bg-white/5">
									<Mail className="h-4 w-4 text-text-sub-600 dark:text-white/60" />
								</div>
								<span>Send Email</span>
							</Link>

							<Link
								href="/contacts"
								className="flex items-center gap-3 rounded-xl border border-stroke-soft-100 bg-white p-3 font-medium text-sm text-text-sub-600 transition-all hover:bg-bg-weak-50 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/70 dark:hover:bg-white/5"
							>
								<div className="rounded-lg bg-zinc-50 p-1.5 dark:bg-white/5">
									<Users className="h-4 w-4 text-text-sub-600 dark:text-white/60" />
								</div>
								<span>Add Contact</span>
							</Link>

							<Link
								href="/workflows"
								className="flex items-center gap-3 rounded-xl border border-stroke-soft-100 bg-white p-3 font-medium text-sm text-text-sub-600 transition-all hover:bg-bg-weak-50 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/70 dark:hover:bg-white/5"
							>
								<div className="rounded-lg bg-zinc-50 p-1.5 dark:bg-white/5">
									<GitBranch className="h-4 w-4 text-text-sub-600 dark:text-white/60" />
								</div>
								<span>Create Workflow</span>
							</Link>

							<Link
								href="/domain"
								className="flex items-center gap-3 rounded-xl border border-stroke-soft-100 bg-white p-3 font-medium text-sm text-text-sub-600 transition-all hover:bg-bg-weak-50 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/70 dark:hover:bg-white/5"
							>
								<div className="rounded-lg bg-zinc-50 p-1.5 dark:bg-white/5">
									<Globe className="h-4 w-4 text-text-sub-600 dark:text-white/60" />
								</div>
								<span>Manage Domains</span>
							</Link>
						</div>
					</div>

					<div className="rounded-2xl border border-stroke-soft-100 bg-white p-5 dark:border-white/5 dark:bg-white/[0.01]">
						<div className="flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
							<span className="font-semibold text-sm text-text-strong-950 dark:text-white">
								System Health
							</span>
						</div>
						<p className="mt-2 text-text-sub-600 text-xs dark:text-white/60">
							All inbound MTA & SMTP server relays are operational.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
