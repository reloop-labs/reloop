const communityStats = [
	{
		value: "2,500+",
		label: "Discord members active in the community.",
		description:
			"Real-time support, events, and collaboration with developers building on Reloop.",
	},
	{
		value: "1,200+",
		label: "GitHub stars from the open-source community.",
		description:
			"Growing adoption of self-hosted email infrastructure across teams worldwide.",
	},
	{
		value: "150+",
		label: "Contributors shipping code and fixes.",
		description:
			"Developers from around the world improving Reloop through pull requests and reviews.",
	},
	{
		value: "50+",
		label: "Countries represented in our community.",
		description:
			"A global network of builders sharing knowledge and best practices for email.",
	},
];

export function CommunityStats() {
	return (
		<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-white dark:border-white/10 dark:bg-[#0a0a0a]">
			{communityStats.map((stat) => (
				<div
					key={stat.label}
					className="grid grid-cols-1 gap-4 border-stroke-soft-200 border-t px-6 py-8 first:border-t-0 sm:px-8 sm:py-10 lg:grid-cols-[minmax(140px,200px)_minmax(200px,280px)_1fr] lg:items-center lg:gap-0 dark:border-white/10"
				>
					<div className="font-semibold text-4xl text-text-strong-950 tracking-tight sm:text-[2.75rem] dark:text-white">
						{stat.value}
					</div>
					<p className="text-sm text-text-sub-600 leading-snug lg:border-stroke-soft-200 lg:border-l lg:px-8 dark:text-white/40 dark:lg:border-white/10">
						{stat.label}
					</p>
					<p className="text-sm text-text-sub-600 leading-relaxed lg:px-8 dark:text-white/50">
						{stat.description}
					</p>
				</div>
			))}
		</div>
	);
}

export { communityStats };
