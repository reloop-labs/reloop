export interface HeroTabItem {
	id: string;
	title: string;
	badge?: string;
	description: string;
}

const HERO_TABS: HeroTabItem[] = [
	{
		id: "cost-efficiency",
		title: "Cost Efficiency",
		description: "10x lower volume cost vs legacy email providers.",
	},
	{
		id: "open-source",
		title: "Open Source",
		description: "100% transparent core engine, yours to self-host.",
	},
	{
		id: "zero-lock-in",
		title: "Zero Lock-in",
		description: "Standard SMTP & REST APIs; bring your own IPs.",
	},
	{
		id: "developer-experience",
		title: "Developer Experience",
		description: "React email templates, TypeScript SDKs, & clean APIs.",
	},
	{
		id: "agent-inboxes",
		title: "Agent Inboxes",
		description: "Built-in AI agent parsing, webhooks & MCP.",
	},
];

export function CompareHeroHeader() {
	return (
		<div className="w-full border-stroke-soft-200 border-b bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			{/* Top Hero Text Section (Left Aligned matching Careers Page) */}
			<div className="px-6 pt-28 pb-14 text-left sm:px-10 sm:pt-32 sm:pb-16 lg:px-12">
				<h1 className="max-w-3xl font-semibold text-3xl text-text-strong-950 leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.6rem] dark:text-white">
					Reloop vs the competition.
				</h1>

				<p className="mt-4 max-w-2xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/60">
					Compare Reloop against leading email service providers. Learn how
					Reloop delivers 10x lower costs, open-source transparency, and unified
					email infrastructure.
				</p>
			</div>

			{/* 5-Column Static Grid Strip */}
			<div className="border-stroke-soft-200 border-t dark:border-white/10">
				<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 px-7 text-left sm:grid-cols-2 sm:divide-x sm:divide-y-0 md:grid-cols-5 dark:divide-white/10">
					{HERO_TABS.map((tab) => (
						<div
							key={tab.id}
							className="flex flex-col justify-between p-5 text-left"
						>
							<div>
								<div className="flex items-center gap-2">
									<span className="font-semibold text-[14px] text-text-strong-950 dark:text-white">
										{tab.title}
									</span>
									{tab.badge ? (
										<span className="rounded-md bg-stroke-soft-200/80 px-1.5 py-0.5 font-semibold text-[10px] text-text-sub-600 dark:bg-white/15 dark:text-white/80">
											{tab.badge}
										</span>
									) : null}
								</div>
								<p className="mt-2 text-[13px] text-text-sub-600 leading-snug dark:text-white/60">
									{tab.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
