"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

/* ------------------------------------------------------------------ */
/*  Visual 1: Deliverability Insights                                  */
/* ------------------------------------------------------------------ */

export function DeliverabilityVisual() {
	return (
		<div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] shadow-2xl">
			<div className="flex h-full">
				<div className="w-[180px] shrink-0 border-white/5 border-r bg-white/[0.02]">
					<div className="border-white/5 border-b px-4 py-3">
						<span className="font-bold text-[10px] text-white/40 uppercase tracking-wider">
							Monitoring
						</span>
					</div>
					<div className="space-y-1 p-2">
						{["Throughput", "Latency", "Reputation", "Bounce Rate"].map(
							(item, i) => (
								<div
									key={item}
									className={cn(
										"flex items-center gap-2 rounded-md px-3 py-2 font-medium text-[11px] transition-colors",
										i === 0
											? "bg-white/10 text-white"
											: "text-white/40 hover:bg-white/5 hover:text-white/60",
									)}
								>
									<div
										className={cn(
											"size-1.5 rounded-full",
											i === 0 ? "bg-emerald-500" : "bg-white/20",
										)}
									/>
									{item}
								</div>
							),
						)}
					</div>
				</div>

				<div className="flex flex-1 flex-col gap-6 p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
								<Icon name="graph-up" className="size-4" />
							</div>
							<div>
								<div className="font-semibold text-[13px] text-white">
									Global Reputation
								</div>
								<div className="text-[11px] text-white/40">Updated 2s ago</div>
							</div>
						</div>
						<div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1">
							<div className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
							<span className="font-bold text-[10px] text-emerald-500">
								EXCELLENT
							</span>
						</div>
					</div>

					<div className="relative flex flex-1 items-end gap-1">
						{[40, 70, 45, 90, 65, 80, 50, 100, 85, 95, 70, 75, 60, 85].map(
							(h, i) => (
								<div
									key={i}
									className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-500/20 to-emerald-500/40"
									style={{ height: `${h}%` }}
								/>
							),
						)}
					</div>

					<div className="grid grid-cols-3 gap-4">
						{[
							{ label: "Deliverability", val: "99.98%" },
							{ label: "Avg. Latency", val: "142ms" },
							{ label: "Spam Score", val: "0.02" },
						].map((stat) => (
							<div
								key={stat.label}
								className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
							>
								<div className="text-[10px] text-white/30">{stat.label}</div>
								<div className="mt-1 font-semibold text-sm text-white tracking-tight">
									{stat.val}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Visual 2: Smart Pipelines                                          */
/* ------------------------------------------------------------------ */

export function PipelinesVisual() {
	return (
		<div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] shadow-2xl">
			<div className="flex h-full flex-col p-8">
				<div className="mb-8 flex items-center gap-2 border-white/5 border-b pb-4">
					<Icon name="swatch-book" className="size-4 text-white/40" />
					<span className="font-medium text-white/60 text-xs">
						pipeline_production_v2.yaml
					</span>
				</div>

				<div className="relative flex flex-1 items-center justify-between px-10">
					<div className="-translate-y-1/2 absolute inset-x-20 top-1/2 h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0" />

					{[
						{ icon: "file", label: "Request", detail: "Payload validated" },
						{
							icon: "lock",
							label: "Security",
							detail: "SPF/DKIM/DMARC",
							active: true,
						},
						{ icon: "brush", label: "Template", detail: "Dynamic injection" },
						{ icon: "send-2", label: "Relay", detail: "MTAs triggered" },
					].map((step) => (
						<div
							key={step.label}
							className="relative z-10 flex flex-col items-center gap-4"
						>
							<div
								className={cn(
									"flex size-14 items-center justify-center rounded-2xl border transition-all duration-500",
									step.active
										? "border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
										: "border-white/5 bg-white/[0.03]",
								)}
							>
								<Icon
									name={step.icon as any}
									className={cn(
										"size-6",
										step.active ? "text-emerald-500" : "text-white/20",
									)}
								/>
							</div>
							<div className="text-center">
								<div
									className={cn(
										"font-semibold text-[12px]",
										step.active ? "text-white" : "text-white/40",
									)}
								>
									{step.label}
								</div>
								<div className="text-[10px] text-white/20">{step.detail}</div>
							</div>
						</div>
					))}
				</div>

				<div className="mt-8 flex items-center gap-3 rounded-lg border border-white/5 bg-emerald-500/5 p-3">
					<div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20">
						<Icon name="check-circle" className="size-3 text-emerald-500" />
					</div>
					<span className="font-medium text-[11px] text-emerald-500/80">
						Compliance verification passed for 2,450 recipients
					</span>
				</div>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Visual 3: Template Collaboration                                   */
/* ------------------------------------------------------------------ */

export function TeamVisual() {
	return (
		<div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] shadow-2xl">
			<div className="flex h-full flex-col">
				<div className="flex items-center justify-between border-white/5 border-b bg-white/[0.02] px-4 py-2">
					<div className="flex items-center gap-1.5">
						<div className="size-2 rounded-full bg-red-400" />
						<div className="size-2 rounded-full bg-amber-400" />
						<div className="size-2 rounded-full bg-emerald-400" />
					</div>
					<div className="font-medium text-[10px] text-white/40">
						Monthly_Newsletter.reloop
					</div>
					<div className="size-4" />
				</div>

				<div className="flex flex-1 gap-6 p-6">
					<div className="w-[140px] shrink-0 space-y-4">
						<div className="space-y-1">
							<div className="font-bold text-[10px] text-white/30 uppercase">
								Components
							</div>
							{["Header", "Hero", "Button", "Footer"].map((c) => (
								<div
									key={c}
									className="rounded border border-white/5 bg-white/[0.02] p-1.5 text-[11px] text-white/60"
								>
									{c}
								</div>
							))}
						</div>
					</div>

					<div className="relative flex-1 overflow-hidden rounded border border-white/10 bg-white p-4 shadow-inner">
						<div className="mb-4 h-4 w-2/3 rounded bg-zinc-200" />
						<div className="mb-2 h-2 w-full rounded bg-zinc-100" />
						<div className="mb-2 h-2 w-full rounded bg-zinc-100" />
						<div className="mb-8 h-2 w-1/2 rounded bg-zinc-100" />
						<div className="mx-auto h-10 w-32 rounded bg-emerald-500" />

						<div className="absolute top-20 left-40 flex items-center gap-1">
							<Icon
								name="mouse"
								className="size-4 rotate-[-90deg] text-blue-500"
							/>
							<div className="whitespace-nowrap rounded-sm bg-blue-500 px-1.5 py-0.5 text-[9px] text-white shadow-lg">
								Sarah K.
							</div>
						</div>
						<div className="absolute top-40 left-10 flex items-center gap-1">
							<Icon
								name="mouse"
								className="size-4 rotate-[-90deg] text-purple-500"
							/>
							<div className="whitespace-nowrap rounded-sm bg-purple-500 px-1.5 py-0.5 text-[9px] text-white shadow-lg">
								Alex (AI)
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Visual 4: Global Infrastructure (Bonus/Alternative)                */
/* ------------------------------------------------------------------ */

export function GlobalVisual() {
	return (
		<div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] shadow-2xl">
			<div className="absolute inset-0 opacity-20">
				<svg className="h-full w-full fill-white/10" viewBox="0 0 800 400">
					<title>Global Map</title>
					<circle cx="200" cy="150" r="2" />
					<circle cx="400" cy="100" r="2" />
					<circle cx="600" cy="200" r="2" />
					<circle cx="300" cy="300" r="2" />
					<path
						d="M100 200 Q 400 50, 700 200"
						fill="none"
						stroke="white"
						strokeWidth="0.5"
						strokeDasharray="4 4"
					/>
				</svg>
			</div>

			<div className="relative flex h-full flex-col p-6">
				<div className="mb-auto flex items-center justify-between">
					<div>
						<h4 className="font-semibold text-sm text-white">
							Edge Node Distribution
						</h4>
						<p className="text-[11px] text-white/40">
							14 global SMTP regions active
						</p>
					</div>
					<div className="-space-x-2 flex">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="size-6 rounded-full border-2 border-[#0a0a0a] bg-white/[0.05]"
							/>
						))}
					</div>
				</div>

				<div className="mt-auto grid grid-cols-2 gap-4">
					{[
						{ city: "San Francisco", id: "us-west-1", speed: "12ms" },
						{ city: "Frankfurt", id: "eu-central-1", speed: "8ms" },
					].map((node) => (
						<div
							key={node.id}
							className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm"
						>
							<div className="mb-2 flex items-center justify-between">
								<span className="font-bold font-mono text-[11px] text-white/60 tracking-wider">
									{node.id}
								</span>
								<span className="font-bold text-[10px] text-emerald-500">
									{node.speed}
								</span>
							</div>
							<div className="font-semibold text-[13px] text-white">
								{node.city}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
