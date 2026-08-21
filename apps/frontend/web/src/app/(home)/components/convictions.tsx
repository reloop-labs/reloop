"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useEffect, useState } from "react";

function MicroCost() {
	return (
		<div className="pointer-events-none flex select-none items-center gap-1 font-mono text-[11px]">
			<span className="text-text-sub-600 dark:text-white/40">$</span>
			<div className="relative h-4 overflow-hidden font-medium text-text-strong-950 dark:text-white">
				<div className="flex animate-[ticker_5s_ease-in-out_infinite] flex-col">
					<span>120.00</span>
					<span>12.00</span>
					<span>0.80</span>
					<span>120.00</span>
				</div>
			</div>
			<span className="ml-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.2 font-mono font-semibold text-[9.5px] text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
				-90%
			</span>
		</div>
	);
}

function MicroOpenSource() {
	const [stars, setStars] = useState("GitHub");

	useEffect(() => {
		fetch("https://api.github.com/repos/reloop-labs/reloop")
			.then((res) => res.json())
			.then((data) => {
				if (data && typeof data.stargazers_count === "number") {
					const count = data.stargazers_count;
					if (count >= 1000) {
						setStars(`${(count / 1000).toFixed(1)}k stars`);
					} else {
						setStars(`${count} stars`);
					}
				}
			})
			.catch(() => {});
	}, []);

	return (
		<a
			href="https://github.com/reloop-labs/reloop"
			target="_blank"
			rel="noreferrer"
			className="group/github flex cursor-pointer items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-weak-50/50 px-2.5 py-0.5 font-medium font-mono text-[10.5px] text-text-strong-950 transition-colors hover:border-stroke-strong-950 hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:border-white/40 dark:hover:bg-white/[0.08]"
		>
			<Icon
				name="social-github"
				className="size-3 text-text-strong-950 transition-transform duration-150 group-hover/github:scale-110 dark:text-white"
			/>
			<span>{stars}</span>
		</a>
	);
}

function MicroZeroLockin() {
	return (
		<div className="pointer-events-none flex select-none items-center gap-1.5 font-mono text-[10.5px] text-text-sub-600 dark:text-white/60">
			<span className="font-medium text-text-strong-950 dark:text-white">
				SMTP :587
			</span>
			<span className="text-text-sub-600/40 dark:text-white/30">⇄</span>
			<span className="font-medium text-text-strong-950 dark:text-white">
				REST :443
			</span>
		</div>
	);
}

function MicroDevExp() {
	return (
		<div className="pointer-events-none flex select-none items-center rounded border border-stroke-soft-200/80 bg-bg-weak-50/40 px-2 py-0.5 font-mono text-[10px] text-text-strong-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-white">
			<span className="text-text-sub-600 dark:text-white/40">&lt;</span>
			<span className="font-medium">Email</span>
			<span className="ml-0.5 text-text-sub-600 dark:text-white/50">to</span>
			<span className="text-text-sub-600/60 dark:text-white/30">=</span>
			<span className="font-medium text-text-strong-950 dark:text-white">
				&#123;user&#125;
			</span>
			<span className="ml-0.5 text-text-sub-600 dark:text-white/40">/&gt;</span>
		</div>
	);
}

function MicroAgentInbox() {
	return (
		<div className="pointer-events-none flex select-none items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-weak-50/50 px-2.5 py-0.5 font-mono text-[10.5px] dark:border-white/10 dark:bg-white/[0.04]">
			<span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
			<span className="font-medium text-text-strong-950 dark:text-white">
				mcp: send_email()
			</span>
			<span className="rounded bg-amber-500/10 px-1 py-0.2 font-semibold text-[8.5px] text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
				AI
			</span>
		</div>
	);
}

function MicroPlacement() {
	return (
		<div className="pointer-events-none flex select-none items-center gap-1 font-mono text-[10px]">
			<span className="rounded bg-emerald-500/10 px-1.5 py-0.2 font-medium text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
				SPF ✓
			</span>
			<span className="rounded bg-emerald-500/10 px-1.5 py-0.2 font-medium text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
				DKIM ✓
			</span>
			<span className="rounded bg-text-strong-950/5 px-1.5 py-0.2 font-medium text-text-sub-600 dark:bg-white/5 dark:text-white/60">
				DMARC
			</span>
		</div>
	);
}

function MicroInbound() {
	return (
		<div className="pointer-events-none flex select-none items-center gap-2 font-mono text-[10.5px] text-text-sub-600 dark:text-white/60">
			<span className="text-sm text-text-strong-950 dark:text-white">✉</span>
			<span className="text-text-sub-600/40 dark:text-white/30">→</span>
			<span className="rounded border border-stroke-soft-200 bg-bg-weak-50/60 px-1.5 py-0.2 font-medium text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
				&#123; webhook &#125;
			</span>
		</div>
	);
}

function MicroEvents() {
	return (
		<div className="pointer-events-none relative h-4.5 w-full max-w-[150px] select-none overflow-hidden font-mono text-[10px]">
			<div className="flex animate-[scrollEvents_6s_ease-in-out_infinite] flex-col items-center gap-1">
				<div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
					<span className="size-1 rounded-full bg-emerald-500" />
					<span>delivered 1s ago</span>
				</div>
				<div className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
					<span className="size-1 rounded-full bg-sky-500" />
					<span>opened 4s ago</span>
				</div>
				<div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
					<span className="size-1 rounded-full bg-indigo-500" />
					<span>clicked link 8s ago</span>
				</div>
				<div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
					<span className="size-1 rounded-full bg-emerald-500" />
					<span>delivered 1s ago</span>
				</div>
			</div>
		</div>
	);
}

function MicroSelfHost() {
	return (
		<div className="pointer-events-none flex select-none items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-weak-50/50 px-2.5 py-0.5 font-mono text-[10.5px] dark:border-white/10 dark:bg-white/[0.04]">
			<span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
			<span className="font-medium text-text-strong-950 dark:text-white">
				docker: healthy
			</span>
			<div className="flex items-center gap-0.5">
				<span className="h-1.5 w-0.5 rounded-xs bg-emerald-500/50" />
				<span className="h-2.5 w-0.5 rounded-xs bg-emerald-500" />
				<span className="h-1 w-0.5 rounded-xs bg-emerald-500/30" />
			</div>
		</div>
	);
}

function MicroTemplates() {
	return (
		<div className="pointer-events-none flex select-none items-center font-mono text-[11px]">
			<span className="text-text-sub-600 dark:text-white/50">Hello,&nbsp;</span>
			<div className="relative h-4 overflow-hidden font-semibold text-text-strong-950 dark:text-white">
				<div className="flex animate-[ticker_4s_ease-in-out_infinite] flex-col">
					<span>&#123;&#123;name&#125;&#125;</span>
					<span>Alex</span>
					<span>Sarah</span>
					<span>&#123;&#123;name&#125;&#125;</span>
				</div>
			</div>
		</div>
	);
}

const values = [
	{
		icon: "graph-up",
		title: "Cost Efficiency",
		description: "Send-based hosted pricing from $10/month for 25k emails/month; $0.80 per 1k emails.",
		widget: <MicroCost />,
	},
	{
		icon: "globe",
		title: "Open Source",
		description: "100% transparent core engine, yours to self-host.",
		widget: <MicroOpenSource />,
	},
	{
		icon: "book-open",
		title: "Zero Lock-in",
		description: "Standard SMTP & REST APIs; bring your own IPs.",
		widget: <MicroZeroLockin />,
	},
	{
		icon: "message-body",
		title: "Developer Experience",
		description: "React email templates, TypeScript SDKs, & clean APIs.",
		widget: <MicroDevExp />,
	},
	{
		icon: "headset",
		title: "Agent Inboxes",
		description: "Built-in AI agent parsing, webhooks & MCP.",
		widget: <MicroAgentInbox />,
	},
	{
		icon: "shield",
		title: "Inbox Placement",
		description: "SPF, DKIM, and DMARC setup so mail lands where it should.",
		widget: <MicroPlacement />,
	},
	{
		icon: "mail-receive",
		title: "Inbound Email",
		description: "Receive at your domain, parse the body, POST it to your app.",
		widget: <MicroInbound />,
	},
	{
		icon: "activity",
		title: "Live Events",
		description: "Opens, clicks, bounces, and complaints as they happen.",
		widget: <MicroEvents />,
	},
	{
		icon: "server",
		title: "Host It Yourself",
		description: "Same APIs on your machines, or Reloop Cloud. Switch later.",
		widget: <MicroSelfHost />,
	},
	{
		icon: "layout",
		title: "Templates",
		description: "Visual editor and React email. Variables, no extra tool.",
		widget: <MicroTemplates />,
	},
] as const;

export default function Convictions({
	title = "What Reloop gives you",
	description,
	showHeading = false,
}: {
	title?: string;
	description?: string;
	showHeading?: boolean;
} = {}) {
	return (
		<section aria-labelledby="convictions-heading">
			{showHeading ? (
				<div className="border-stroke-soft-200 border-b px-6 py-12 text-center sm:px-8 sm:py-16 md:px-12 dark:border-white/10">
					<h2
						id="convictions-heading"
						className="font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl lg:text-4xl dark:text-white"
					>
						{title}
					</h2>
					{description && (
						<p className="mt-3 text-[14.5px] text-text-sub-600 sm:text-base dark:text-white/60">
							{description}
						</p>
					)}
				</div>
			) : (
				<h2 id="convictions-heading" className="sr-only">
					{title}
				</h2>
			)}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
				{values.map((item) => (
					<div
						key={item.title}
						className={cn(
							"group relative flex min-h-[13.5rem] flex-col justify-between border-stroke-soft-200 border-r border-b px-6 py-7 sm:min-h-[15rem] lg:px-7 lg:py-8 dark:border-white/10",
							"max-sm:border-r-0 max-sm:last:border-b-0 max-lg:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(5n)]:border-r-0 sm:max-lg:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-last-child(-n+5)]:border-b-0",
						)}
					>
						{/* Micro-UI Visual Stage in the upper area */}
						<div className="my-auto flex h-12 w-full items-center justify-center">
							{item.widget}
						</div>

						{/* Bottom: Icon + Title inline, then description */}
						<div>
							<div className="flex items-center gap-2">
								<Icon
									name={item.icon}
									className="size-4 shrink-0 text-text-sub-600 dark:text-white/50"
								/>
								<p className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
									{item.title}
								</p>
							</div>
							<p className="mt-1.5 text-[13px] text-text-sub-600 leading-snug dark:text-white/50">
								{item.description}
							</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
