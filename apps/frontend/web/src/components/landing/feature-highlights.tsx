import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { ReactNode } from "react";

export interface FeatureHighlight {
	id: string;
	icon: string;
	title: string;
	badge?: string;
	description: ReactNode;
}

export const featureHighlights: FeatureHighlight[] = [
	{
		id: "cost-efficiency",
		icon: "graph-up",
		title: "Cost Efficiency",
		description: "10x lower volume cost vs legacy email providers.",
	},
	{
		id: "open-source",
		icon: "globe",
		title: "Open Source",
		description: "100% transparent core engine, yours to self-host.",
	},
	{
		id: "zero-lock-in",
		icon: "book-open",
		title: "Zero Lock-in",
		description: "Standard SMTP & REST APIs; bring your own IPs.",
	},
	{
		id: "developer-experience",
		icon: "message-body",
		title: "Developer Experience",
		description: "React email templates, TypeScript SDKs, & clean APIs.",
	},
	{
		id: "agent-inboxes",
		icon: "headset",
		title: "Agent Inboxes",
		description: "Built-in AI agent parsing, webhooks & MCP.",
	},
	{
		id: "inbox-placement",
		icon: "shield",
		title: "Inbox Placement",
		description: "SPF, DKIM, and DMARC setup so mail lands where it should.",
	},
	{
		id: "inbound-email",
		icon: "mail-receive",
		title: "Inbound Email",
		description: "Receive at your domain, parse the body, POST it to your app.",
	},
	{
		id: "live-events",
		icon: "activity",
		title: "Live Events",
		description: "Opens, clicks, bounces, and complaints as they happen.",
	},
	{
		id: "host-it-yourself",
		icon: "server",
		title: "Host It Yourself",
		description: "Same APIs on your machines, or Reloop Cloud. Switch later.",
	},
	{
		id: "templates",
		icon: "layout",
		title: "Templates",
		description: "Visual editor and React email. Variables, no extra tool.",
	},
];

export function FeatureHighlightsGrid({
	items = featureHighlights,
	columns = 5,
	stacked = false,
}: {
	items?: FeatureHighlight[];
	columns?: 3 | 5;
	/** Icon sits on the title, not pinned to the top of a tall cell. */
	stacked?: boolean;
}) {
	return (
		<div
			className={cn(
				"grid grid-cols-1 sm:grid-cols-2",
				columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-5",
			)}
		>
			{items.map((tab) => (
				<div
					key={tab.id}
					className={cn(
						"flex flex-col border-stroke-soft-200 border-r border-b px-6 py-7 lg:px-7 lg:py-8 dark:border-white/10",
						stacked
							? "gap-4 py-8 sm:py-9 lg:py-10"
							: "min-h-[13.5rem] justify-between sm:min-h-[15rem]",
						columns === 3
							? "max-sm:border-r-0 max-sm:last:border-b-0 max-lg:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(3n)]:border-r-0 sm:max-lg:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-last-child(-n+3)]:border-b-0"
							: "max-sm:border-r-0 max-sm:last:border-b-0 max-lg:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(5n)]:border-r-0 sm:max-lg:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-last-child(-n+5)]:border-b-0",
					)}
				>
					<Icon
						name={tab.icon}
						className="size-5 text-text-sub-600 dark:text-white/40"
					/>
					<div>
						<div className="flex items-center gap-2">
							<p className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
								{tab.title}
							</p>
							{tab.badge ? (
								<span className="rounded-md bg-stroke-soft-200/80 px-1.5 py-0.5 font-semibold text-[10px] text-text-sub-600 dark:bg-white/15 dark:text-white/80">
									{tab.badge}
								</span>
							) : null}
						</div>
						<p className="mt-1.5 line-clamp-2 max-w-[16rem] text-[13px] text-text-sub-600 leading-snug dark:text-white/50">
							{tab.description}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}
