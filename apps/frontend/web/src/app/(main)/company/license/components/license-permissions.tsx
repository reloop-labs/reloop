const permitted = [
	{
		title: "Personal use",
		description:
			"Use, copy, modify, and distribute Reloop for personal projects.",
	},
	{
		title: "Internal company use",
		description:
			"Deploy Reloop inside your organization for internal email infrastructure.",
	},
];

const restricted = [
	{
		title: "Commercial redistribution",
		description:
			"Sell, sublicense, or otherwise commercially redistribute the software.",
	},
	{
		title: "Competing hosted services",
		description:
			"Offer Reloop—or a modified version—as a commercial SaaS, PaaS, or similar hosted service.",
	},
	{
		title: "Competing products",
		description:
			"Use Reloop in any product or service whose primary purpose is to compete with Reloop Labs.",
	},
];

function PermissionList({
	items,
	variant,
}: {
	items: typeof permitted;
	variant: "permitted" | "restricted";
}) {
	const isPermitted = variant === "permitted";

	return (
		<ul className="mt-6 space-y-6 sm:mt-8 sm:space-y-7">
			{items.map((item) => (
				<li key={item.title} className="flex items-start gap-3.5">
					<span
						className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border font-semibold text-[10px] ${
							isPermitted
								? "border-emerald-500/25 bg-emerald-500/10 text-emerald-500"
								: "border-red-400/20 bg-red-400/10 text-red-400/90"
						}`}
					>
						{isPermitted ? "✓" : "✕"}
					</span>
					<div>
						<p className="font-semibold text-[15px] text-text-strong-950 leading-snug sm:text-[16px] dark:text-white">
							{item.title}
						</p>
						<p className="mt-1.5 text-[14px] text-text-sub-600 leading-relaxed sm:text-[15px] dark:text-white/45">
							{item.description}
						</p>
					</div>
				</li>
			))}
		</ul>
	);
}

export function LicensePermissions() {
	return (
		<div className="grid gap-px overflow-hidden rounded-2xl border border-stroke-soft-200 bg-stroke-soft-200 sm:grid-cols-2 dark:border-white/10 dark:bg-white/10">
			<div className="bg-bg-weak-50 p-6 sm:p-8 dark:bg-[#0a0a0a]">
				<p className="font-semibold text-[11px] text-emerald-600 uppercase tracking-[0.16em] dark:text-emerald-400/90">
					Permitted
				</p>
				<PermissionList items={permitted} variant="permitted" />
			</div>
			<div className="bg-bg-weak-50 p-6 sm:p-8 dark:bg-[#111]">
				<p className="font-semibold text-[11px] text-red-600/80 uppercase tracking-[0.16em] dark:text-red-400/80">
					Not permitted
				</p>
				<PermissionList items={restricted} variant="restricted" />
			</div>
		</div>
	);
}
