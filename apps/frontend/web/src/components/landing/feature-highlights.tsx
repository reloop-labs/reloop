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
				"grid grid-cols-1 divide-y divide-stroke-soft-200 text-left sm:grid-cols-2 sm:divide-x dark:divide-white/10",
				columns === 3 ? "lg:grid-cols-3" : "md:grid-cols-5",
			)}
		>
			{items.map((tab) => (
				<div
					key={tab.id}
					className={
						stacked
							? "flex flex-col gap-4 px-6 py-8 sm:px-7 sm:py-9 lg:px-8 lg:py-10"
							: "flex min-h-[11.5rem] flex-col justify-between px-6 py-7 sm:min-h-[13rem] md:min-h-[14.5rem] lg:px-7 lg:py-8"
					}
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
						<p
							className={cn(
								"mt-1.5 text-[13px] text-text-sub-600 leading-snug dark:text-white/50",
								!stacked && "max-w-[16rem]",
							)}
						>
							{tab.description}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}
