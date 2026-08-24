"use client";

import { cn } from "@reloop/ui/cn";
import { Icon, type IconName } from "@reloop/ui/icon";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

type AnalyticsTab = "deliverability" | "engagement" | "bounces" | "events";

const TABS: {
	id: AnalyticsTab;
	label: string;
	icon: IconName;
	description: string;
}[] = [
	{
		id: "deliverability",
		label: "Deliverability Funnel",
		icon: "graph-up",
		description: "End-to-end send-to-inbox pipeline metrics",
	},
	{
		id: "engagement",
		label: "Click & Open Heatmap",
		icon: "cursor-click",
		description: "Per-link interactions and recipient behavior",
	},
	{
		id: "bounces",
		label: "Bounce Diagnostics",
		icon: "alert-triangle",
		description: "SMTP 5xx/4xx codes & root cause analysis",
	},
	{
		id: "events",
		label: "Live Event Stream",
		icon: "activity",
		description: "Real-time webhook and delivery stream",
	},
];

const LINK_METRICS = [
	{
		url: "https://reloop.sh/dashboard/verify?token=abc",
		label: "Verify Account CTA",
		clicks: 14280,
		ctr: "68.4%",
		uniqueUsers: 13910,
	},
	{
		url: "https://reloop.sh/docs/quickstart",
		label: "Documentation Guide",
		clicks: 5620,
		ctr: "26.9%",
		uniqueUsers: 4980,
	},
	{
		url: "https://reloop.sh/community",
		label: "Discord Community",
		clicks: 2140,
		ctr: "10.2%",
		uniqueUsers: 1950,
	},
	{
		url: "https://github.com/reloop-labs/reloop",
		label: "GitHub Repo Star",
		clicks: 3410,
		ctr: "16.3%",
		uniqueUsers: 3120,
	},
];

const CLIENT_BREAKDOWN = [
	{ client: "Apple Mail (MPP / Native)", share: "48.2%", count: "14,210" },
	{ client: "Gmail Web & App", share: "34.6%", count: "10,200" },
	{ client: "Microsoft Outlook (M365)", share: "11.4%", count: "3,360" },
	{ client: "Proton & Other Privacy Clients", share: "5.8%", count: "1,710" },
];

const BOUNCE_CASES = [
	{
		code: "550 5.1.1",
		type: "Hard Bounce",
		reason: "Recipient mailbox does not exist",
		provider: "Google Workspace (gmail-smtp-in.l.google.com)",
		count: 34,
		recommendation: "Auto-suppressed from future campaign lists.",
		severity: "red",
	},
	{
		code: "451 4.7.1",
		type: "Soft Bounce / Deferred",
		reason: "Greylisted by recipient MTA, retry in 300s",
		provider: "Outlook (protection.outlook.com)",
		count: 89,
		recommendation: "Reloop automated retry engine will deliver within 5m.",
		severity: "yellow",
	},
	{
		code: "554 5.7.1",
		type: "Policy Block",
		reason: "DMARC policy p=reject failed alignment",
		provider: "Yahoo Mail (mta5.am0.yahoodns.net)",
		count: 2,
		recommendation: "Verify DKIM selector alignment in DNS settings.",
		severity: "red",
	},
	{
		code: "452 4.2.2",
		type: "Mailbox Full",
		reason: "Over quota; recipient storage exhausted",
		provider: "iCloud Mail (mx1.mail.icloud.com)",
		count: 12,
		recommendation: "Scheduled for 3 backoff retries over 24 hours.",
		severity: "yellow",
	},
];

const LIVE_EVENTS = [
	{
		id: "evt_991823",
		type: "email.delivered",
		recipient: "alex@northwind.io",
		latency: "42ms",
		ip: "198.51.100.24",
		mta: "mx.northwind.io [250 2.0.0 OK]",
		time: "Just now",
		status: "delivered",
	},
	{
		id: "evt_991822",
		type: "email.opened",
		recipient: "maya.chen@stripe.com",
		latency: "3.2s after send",
		ip: "66.249.88.1",
		mta: "Apple Mail Proxy (iOS 18)",
		time: "2s ago",
		status: "opened",
	},
	{
		id: "evt_991821",
		type: "email.clicked",
		recipient: "sarah@acme.dev",
		latency: "8.4s after send",
		ip: "172.56.21.90",
		mta: "URL: /dashboard/verify",
		time: "7s ago",
		status: "clicked",
	},
	{
		id: "evt_991820",
		type: "email.delivered",
		recipient: "dev@linear.app",
		latency: "38ms",
		ip: "198.51.100.18",
		mta: "Google Workspace [250 2.0.0 OK]",
		time: "12s ago",
		status: "delivered",
	},
	{
		id: "evt_991819",
		type: "email.bounced",
		recipient: "invalid-user@acme.org",
		latency: "61ms",
		ip: "198.51.100.12",
		mta: "550 5.1.1 User unknown",
		time: "19s ago",
		status: "bounced",
	},
];

export default function Sandbox() {
	const [activeTab, setActiveTab] = useState<AnalyticsTab>("deliverability");
	const reduceMotion = useReducedMotion();

	return (
		<section
			id="interactive-analytics"
			className="relative w-full py-16 sm:py-24"
		>
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="text-center">
					<div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 font-medium text-blue-600 text-xs dark:text-blue-400">
						<Icon name="fat-row" className="size-3.5" />
						<span>Interactive Inspector</span>
					</div>
					<h2 className="mt-4 font-serif text-[2.4rem] text-text-strong-950 leading-[1.08] tracking-tight sm:text-[3.2rem] lg:text-[3.8rem] dark:text-white">
						Explore Deep Email Telemetry
					</h2>
					<p className="mx-auto mt-4 max-w-2xl text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60">
						Interact with live deliverability waterfalls, link attribution
						matrices, raw SMTP bounce codes, and real-time event ingestion
						feeds.
					</p>
				</div>

				{/* Tab Selection */}
				<div className="mt-12 flex justify-center">
					<div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/70 p-1.5 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.03]">
						{TABS.map((tab) => {
							const isSelected = activeTab === tab.id;
							return (
								<button
									key={tab.id}
									type="button"
									onClick={() => setActiveTab(tab.id)}
									className={cn(
										"relative flex items-center gap-2 rounded-xl px-4 py-2.5 font-medium text-[13px] transition-colors sm:text-sm",
										isSelected
											? "text-text-strong-950 dark:text-white"
											: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white",
									)}
								>
									{isSelected && (
										<motion.div
											layoutId="analytics-tab-indicator"
											className="absolute inset-0 rounded-xl bg-white shadow-xs dark:bg-white/10"
											transition={{
												type: "spring",
												bounce: 0.15,
												duration: 0.4,
											}}
										/>
									)}
									<Icon name={tab.icon} className="relative z-10 size-4" />
									<span className="relative z-10">{tab.label}</span>
								</button>
							);
						})}
					</div>
				</div>

				{/* Stage Content */}
				<div className="mt-8 overflow-hidden rounded-3xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#0c0d0e]">
					<div className="border-stroke-soft-200 border-b bg-bg-weak-50/60 px-6 py-4 dark:border-white/10 dark:bg-white/[0.02]">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div className="flex items-center gap-3">
								<span className="size-2.5 animate-pulse rounded-full bg-emerald-500" />
								<span className="font-semibold text-[14px] text-text-strong-950 dark:text-white">
									{TABS.find((t) => t.id === activeTab)?.label}
								</span>
								<span className="hidden text-text-sub-600 text-xs sm:inline dark:text-white/40">
									— {TABS.find((t) => t.id === activeTab)?.description}
								</span>
							</div>
							<div className="flex items-center gap-2 font-mono text-[12px] text-text-sub-600 dark:text-white/45">
								<span className="rounded-md border border-stroke-soft-200 bg-bg-white-0 px-2 py-0.5 dark:border-white/10 dark:bg-white/5">
									Production Cluster (us-east-1)
								</span>
							</div>
						</div>
					</div>

					<div className="p-6 sm:p-8 lg:p-10">
						<AnimatePresence mode="wait">
							{activeTab === "deliverability" && (
								<motion.div
									key="deliverability"
									initial={
										reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }
									}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.25 }}
									className="space-y-8"
								>
									{/* Deliverability Stats Row */}
									<div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
										<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.02]">
											<p className="font-medium text-text-sub-600 text-xs dark:text-white/50">
												Total Ingested
											</p>
											<p className="mt-1 font-bold text-2xl text-text-strong-950 tabular-nums sm:text-3xl dark:text-white">
												128,450
											</p>
											<p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
												+12.4% vs last period
											</p>
										</div>
										<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.02]">
											<p className="font-medium text-text-sub-600 text-xs dark:text-white/50">
												Delivered Rate
											</p>
											<p className="mt-1 font-bold text-2xl text-text-strong-950 tabular-nums sm:text-3xl dark:text-white">
												99.4%
											</p>
											<p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
												127,680 emails delivered
											</p>
										</div>
										<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.02]">
											<p className="font-medium text-text-sub-600 text-xs dark:text-white/50">
												Unique Open Rate
											</p>
											<p className="mt-1 font-bold text-2xl text-text-strong-950 tabular-nums sm:text-3xl dark:text-white">
												46.8%
											</p>
											<p className="mt-1 text-[11px] text-blue-600 dark:text-blue-400">
												59,750 verified opens
											</p>
										</div>
										<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.02]">
											<p className="font-medium text-text-sub-600 text-xs dark:text-white/50">
												Spam Complaint Rate
											</p>
											<p className="mt-1 font-bold text-2xl text-text-strong-950 tabular-nums sm:text-3xl dark:text-white">
												0.01%
											</p>
											<p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
												Far below 0.10% threshold
											</p>
										</div>
									</div>

									{/* Deliverability Pipeline Waterfall */}
									<div className="rounded-2xl border border-stroke-soft-200 p-6 dark:border-white/10 dark:bg-white/[0.01]">
										<h4 className="font-semibold text-sm text-text-strong-950 dark:text-white">
											Delivery Pipeline Funnel
										</h4>
										<div className="mt-6 space-y-4">
											<div>
												<div className="flex justify-between font-mono text-xs">
													<span className="text-text-sub-600 dark:text-white/60">
														1. API Ingestion & SPF/DKIM Signing
													</span>
													<span className="font-semibold text-text-strong-950 dark:text-white">
														128,450 (100%)
													</span>
												</div>
												<div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-stroke-soft-200 dark:bg-white/10">
													<div className="h-full w-full rounded-full bg-blue-500" />
												</div>
											</div>
											<div>
												<div className="flex justify-between font-mono text-xs">
													<span className="text-text-sub-600 dark:text-white/60">
														2. MTA Acceptance & TLS Handshake
													</span>
													<span className="font-semibold text-text-strong-950 dark:text-white">
														127,680 (99.4%)
													</span>
												</div>
												<div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-stroke-soft-200 dark:bg-white/10">
													<div className="h-full w-[99.4%] rounded-full bg-emerald-500" />
												</div>
											</div>
											<div>
												<div className="flex justify-between font-mono text-xs">
													<span className="text-text-sub-600 dark:text-white/60">
														3. Inbox Placement (Non-Spam Folder)
													</span>
													<span className="font-semibold text-text-strong-950 dark:text-white">
														125,120 (97.4%)
													</span>
												</div>
												<div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-stroke-soft-200 dark:bg-white/10">
													<div className="h-full w-[97.4%] rounded-full bg-purple-500" />
												</div>
											</div>
											<div>
												<div className="flex justify-between font-mono text-xs">
													<span className="text-text-sub-600 dark:text-white/60">
														4. Human Verified Engagement (Open / Click)
													</span>
													<span className="font-semibold text-text-strong-950 dark:text-white">
														60,110 (46.8%)
													</span>
												</div>
												<div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-stroke-soft-200 dark:bg-white/10">
													<div className="h-full w-[46.8%] rounded-full bg-amber-500" />
												</div>
											</div>
										</div>
									</div>
								</motion.div>
							)}

							{activeTab === "engagement" && (
								<motion.div
									key="engagement"
									initial={
										reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }
									}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.25 }}
									className="grid grid-cols-1 gap-8 lg:grid-cols-3"
								>
									{/* Top Clicked Links */}
									<div className="space-y-4 lg:col-span-2">
										<h4 className="font-semibold text-sm text-text-strong-950 dark:text-white">
											Link Performance & CTR Attribution
										</h4>
										<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 dark:border-white/10">
											<div className="divide-y divide-stroke-soft-200 dark:divide-white/10">
												{LINK_METRICS.map((link) => (
													<div
														key={link.url}
														className="flex flex-col gap-2 p-4 transition-colors hover:bg-bg-weak-50/50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-white/[0.02]"
													>
														<div className="min-w-0 flex-1">
															<p className="font-medium text-[13.5px] text-text-strong-950 dark:text-white">
																{link.label}
															</p>
															<p className="truncate font-mono text-text-sub-600 text-xs dark:text-white/45">
																{link.url}
															</p>
														</div>
														<div className="flex items-center gap-6 self-end sm:self-center">
															<div className="text-right">
																<p className="font-bold text-sm text-text-strong-950 dark:text-white">
																	{link.clicks.toLocaleString()}
																</p>
																<p className="text-[11px] text-text-sub-600 dark:text-white/40">
																	Clicks
																</p>
															</div>
															<div className="min-w-[60px] text-right">
																<p className="font-bold text-emerald-600 text-sm dark:text-emerald-400">
																	{link.ctr}
																</p>
																<p className="text-[11px] text-text-sub-600 dark:text-white/40">
																	CTR
																</p>
															</div>
														</div>
													</div>
												))}
											</div>
										</div>
									</div>

									{/* Client Breakdown */}
									<div className="space-y-4">
										<h4 className="font-semibold text-sm text-text-strong-950 dark:text-white">
											Email Clients & Devices
										</h4>
										<div className="rounded-2xl border border-stroke-soft-200 p-5 dark:border-white/10 dark:bg-white/[0.01]">
											<div className="space-y-4">
												{CLIENT_BREAKDOWN.map((item) => (
													<div key={item.client}>
														<div className="flex justify-between text-xs">
															<span className="font-medium text-text-strong-950 dark:text-white">
																{item.client}
															</span>
															<span className="font-mono text-text-sub-600 dark:text-white/60">
																{item.share}
															</span>
														</div>
														<div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stroke-soft-200 dark:bg-white/10">
															<div
																className="h-full rounded-full bg-blue-500"
																style={{ width: item.share }}
															/>
														</div>
													</div>
												))}
											</div>
										</div>
									</div>
								</motion.div>
							)}

							{activeTab === "bounces" && (
								<motion.div
									key="bounces"
									initial={
										reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }
									}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.25 }}
									className="space-y-4"
								>
									<div className="flex items-center justify-between">
										<h4 className="font-semibold text-sm text-text-strong-950 dark:text-white">
											SMTP Code Diagnostics & Root Cause Analysis
										</h4>
										<span className="font-mono text-text-sub-600 text-xs dark:text-white/50">
											Total Bounces: 137 (0.11%)
										</span>
									</div>

									<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 dark:border-white/10">
										<div className="divide-y divide-stroke-soft-200 dark:divide-white/10">
											{BOUNCE_CASES.map((b) => (
												<div
													key={b.code}
													className="p-5 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.02]"
												>
													<div className="flex flex-wrap items-center justify-between gap-2">
														<div className="flex items-center gap-3">
															<span
																className={cn(
																	"rounded-md px-2 py-0.5 font-bold font-mono text-xs",
																	b.severity === "red"
																		? "bg-red-500/10 text-red-600 dark:text-red-400"
																		: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
																)}
															>
																{b.code}
															</span>
															<span className="font-semibold text-[13.5px] text-text-strong-950 dark:text-white">
																{b.type}
															</span>
															<span className="text-text-sub-600 text-xs dark:text-white/40">
																({b.count} occurrences)
															</span>
														</div>
														<span className="font-mono text-[11.5px] text-text-sub-600 dark:text-white/50">
															{b.provider}
														</span>
													</div>
													<p className="mt-2 text-[13px] text-text-sub-600 dark:text-white/70">
														<strong className="text-text-strong-950 dark:text-white">
															MTA Reason:
														</strong>{" "}
														{b.reason}
													</p>
													<div className="mt-2 rounded-lg bg-stroke-soft-200/50 px-3 py-1.5 font-mono text-[12px] text-text-sub-600 dark:bg-white/5 dark:text-white/60">
														💡 Action: {b.recommendation}
													</div>
												</div>
											))}
										</div>
									</div>
								</motion.div>
							)}

							{activeTab === "events" && (
								<motion.div
									key="events"
									initial={
										reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }
									}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.25 }}
									className="space-y-4"
								>
									<div className="flex items-center justify-between">
										<h4 className="font-semibold text-sm text-text-strong-950 dark:text-white">
											Live Webhook & WebSocket Event Ticker
										</h4>
										<span className="inline-flex items-center gap-1.5 font-mono text-emerald-600 text-xs dark:text-emerald-400">
											<span className="size-1.5 animate-ping rounded-full bg-emerald-500" />
											Streaming events
										</span>
									</div>

									<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 dark:border-white/10">
										<div className="divide-y divide-stroke-soft-200 font-mono text-xs dark:divide-white/10">
											{LIVE_EVENTS.map((evt) => (
												<div
													key={evt.id}
													className="flex flex-col gap-2 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between dark:hover:bg-white/[0.02]"
												>
													<div className="flex items-center gap-3">
														<span
															className={cn(
																"rounded-md px-2 py-0.5 font-semibold text-[11px]",
																evt.status === "delivered" &&
																	"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
																evt.status === "opened" &&
																	"bg-purple-500/10 text-purple-600 dark:text-purple-400",
																evt.status === "clicked" &&
																	"bg-blue-500/10 text-blue-600 dark:text-blue-400",
																evt.status === "bounced" &&
																	"bg-red-500/10 text-red-600 dark:text-red-400",
															)}
														>
															{evt.type}
														</span>
														<span className="text-text-strong-950 dark:text-white">
															{evt.recipient}
														</span>
													</div>
													<div className="flex flex-wrap items-center gap-4 text-text-sub-600 dark:text-white/50">
														<span>{evt.mta}</span>
														<span className="text-text-strong-950 dark:text-white/80">
															⚡ {evt.latency}
														</span>
														<span>{evt.time}</span>
													</div>
												</div>
											))}
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</section>
	);
}
