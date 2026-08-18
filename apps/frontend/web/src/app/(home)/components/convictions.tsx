import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

const values = [
	{
		icon: "graph-up",
		title: "Cost Efficiency",
		description: "10x lower volume cost vs legacy email providers.",
	},
	{
		icon: "globe",
		title: "Open Source",
		description: "100% transparent core engine, yours to self-host.",
	},
	{
		icon: "book-open",
		title: "Zero Lock-in",
		description: "Standard SMTP & REST APIs; bring your own IPs.",
	},
	{
		icon: "message-body",
		title: "Developer Experience",
		description: "React email templates, TypeScript SDKs, & clean APIs.",
	},
	{
		icon: "headset",
		title: "Agent Inboxes",
		description: "Built-in AI agent parsing, webhooks & MCP.",
	},
	{
		icon: "shield",
		title: "Inbox Placement",
		description: "SPF, DKIM, and DMARC setup so mail lands where it should.",
	},
	{
		icon: "mail-receive",
		title: "Inbound Email",
		description: "Receive at your domain, parse the body, POST it to your app.",
	},
	{
		icon: "activity",
		title: "Live Events",
		description: "Opens, clicks, bounces, and complaints as they happen.",
	},
	{
		icon: "server",
		title: "Host It Yourself",
		description: "Same APIs on your machines, or Reloop Cloud. Switch later.",
	},
	{
		icon: "layout",
		title: "Templates",
		description: "Visual editor and React email. Variables, no extra tool.",
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
							"flex min-h-[13.5rem] flex-col justify-between border-stroke-soft-200 border-r border-b px-6 py-7 sm:min-h-[15rem] lg:px-7 lg:py-8 dark:border-white/10",
							"max-sm:border-r-0 max-sm:last:border-b-0 max-lg:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(5n)]:border-r-0 sm:max-lg:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-last-child(-n+5)]:border-b-0",
						)}
					>
						<Icon
							name={item.icon}
							className="size-5 text-text-sub-600 dark:text-white/40"
						/>
						<div>
							<p className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
								{item.title}
							</p>
							<p className="mt-1.5 max-w-[16rem] text-[13px] text-text-sub-600 leading-snug dark:text-white/50">
								{item.description}
							</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
