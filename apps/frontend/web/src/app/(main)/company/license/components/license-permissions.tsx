const terms = [
	{
		number: "01",
		title: "Personal use",
		description:
			"Use, copy, modify, and distribute Reloop for personal projects.",
	},
	{
		number: "02",
		title: "Internal company use",
		description:
			"Deploy Reloop inside your organization for internal email infrastructure.",
	},
	{
		number: "03",
		title: "No commercial redistribution",
		description:
			"You may not sell, sublicense, or commercially redistribute the software.",
	},
	{
		number: "04",
		title: "No competing hosted services",
		description:
			"You may not offer Reloop—or a modified version—as a commercial SaaS, PaaS, or similar hosted service, or to compete with Reloop Labs.",
	},
];

const bentoCellClass =
	"border-stroke-soft-200 border-t border-l-0 bg-transparent p-8 transition-colors duration-300 first:border-t-0 hover:bg-black/[0.01] sm:border-t sm:border-l lg:p-10 dark:border-white/10 dark:hover:bg-white/[0.02] sm:[&:nth-child(-n+2)]:border-t-0 sm:[&:nth-child(2n+1)]:border-l-0";

export function LicensePermissions() {
	return (
		<div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-24">
			<div className="lg:w-[480px] lg:shrink-0">
				<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
					Usage terms
				</p>
				<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
					What you can
					<br />& cannot do.
				</h2>
				<p className="mt-6 max-w-[420px] text-[15px] text-text-sub-600 leading-7 sm:text-[16px] dark:text-white/50">
					Apache 2.0 with additional terms defined by Reloop Labs. Free for
					personal and internal use via self-hosting.
				</p>
				<p className="mt-6 max-w-[420px] text-[14px] text-text-sub-600 leading-7 dark:text-white/40">
					There is no commercial license.{" "}
					<a
						href="/resources/self-hosting-guide"
						className="font-semibold text-text-strong-950 underline decoration-stroke-soft-200 underline-offset-4 transition-colors hover:text-primary-base dark:text-white dark:decoration-white/20 dark:hover:text-primary-base"
					>
						Self-host Reloop
					</a>{" "}
					on your own infrastructure.
				</p>
			</div>

			<div className="flex-1">
				<div className="grid overflow-hidden rounded-2xl border border-stroke-soft-200 sm:grid-cols-2 dark:border-white/10">
					{terms.map((item) => (
						<div key={item.number} className={bentoCellClass}>
							<span className="font-semibold text-sm text-text-soft-400 tabular-nums dark:text-white/28">
								{item.number}
							</span>
							<h3 className="mt-3 font-semibold text-[17px] text-text-strong-950 leading-snug sm:text-[18px] dark:text-white">
								{item.title}
							</h3>
							<p className="mt-3 text-[14px] text-text-sub-600 leading-[1.7] sm:text-[15px] dark:text-white/50">
								{item.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
