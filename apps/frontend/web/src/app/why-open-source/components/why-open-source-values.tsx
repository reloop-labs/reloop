const commitments = [
	{
		label: "License",
		value: "Apache 2.0",
		detail: "Permissive, public, and self-hostable",
	},
	{
		label: "Codebase parity",
		value: "1:1 parity",
		detail: "Identical engine on hosted and self-hosted",
	},
	{
		label: "Routing auditability",
		value: "100% public",
		detail: "Deliverability logic verified in source",
	},
	{
		label: "Vendor lock-in",
		value: "Zero",
		detail: "Migrate or self-host at any time",
	},
];

export function WhyOpenSourceValues() {
	return (
		<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* Section Header */}
				<div className="border-stroke-soft-200 border-b px-6 py-14 sm:px-10 sm:py-16 lg:px-12 dark:border-white/10">
					<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						Our commitments.
					</h2>
					<p className="mt-1.5 max-w-2xl text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						Four architectural guarantees that govern every release we ship.
					</p>
				</div>

				{/* 4-Column Commitments Strip */}
				<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-4 sm:divide-y-0 sm:divide-x dark:divide-white/10">
					{commitments.map((item) => (
						<div key={item.label} className="p-8 sm:p-10 lg:p-12">
							<p className="font-medium text-[13px] text-text-sub-600 dark:text-white/50">
								{item.label}
							</p>
							<p className="mt-2 font-semibold text-[24px] text-text-strong-950 tracking-tight sm:text-[26px] dark:text-white">
								{item.value}
							</p>
							<p className="mt-1.5 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/50">
								{item.detail}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
