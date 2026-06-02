import { cn } from "@reloop/ui/cn";

export function SubFeature({ title, description }: { title: string; description: string }) {
	return (
		<div className="flex gap-4 group/card">
			<div className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-[#0a0d12]/8 dark:border-white/8 bg-white dark:bg-white/[0.02] shadow-sm text-[10px] text-emerald-500 font-bold">
				✓
			</div>
			<div>
				<h4 className="font-semibold text-[#0a0d12] dark:text-white text-sm leading-snug">
					{title}
				</h4>
				<p className="mt-1 text-[#0a0d12]/50 dark:text-white/40 text-[13px] leading-relaxed">
					{description}
				</p>
			</div>
		</div>
	);
}

export function SectionBlock({
	eyebrow,
	title,
	subtitle,
	children,
	className,
}: {
	eyebrow: string;
	title: string;
	subtitle: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("py-20 lg:py-24 transition-colors duration-300", className)}>
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="text-center max-w-3xl mx-auto mb-16">
					<p className="font-semibold text-[11px] text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.16em]">
						{eyebrow}
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.2rem] lg:text-[3.8rem] font-bold text-[#0a0d12] dark:text-white">
						{title}
					</h2>
					<p className="mt-5 text-text-sub-600 dark:text-white/60 text-[15px] leading-relaxed sm:text-[17px]">
						{subtitle}
					</p>
				</div>
				<div className="space-y-20 lg:space-y-28">{children}</div>
			</div>
		</div>
	);
}

export function FeatureRow({
	title,
	description,
	cards,
	visual: Visual,
	theme = "emerald",
	reverse = false,
}: {
	title: string;
	description: string;
	cards: { title: string; description: string }[];
	visual: React.ComponentType;
	theme?: "emerald" | "cyan" | "violet" | "rose" | "indigo";
	reverse?: boolean;
}) {
	const themes = {
		emerald: {
			glow: "from-emerald-500/20 to-teal-500/20",
			borderGlow: "group-hover:border-emerald-500/30 dark:group-hover:border-emerald-500/30",
		},
		cyan: {
			glow: "from-cyan-500/20 to-blue-500/20",
			borderGlow: "group-hover:border-cyan-500/30 dark:group-hover:border-cyan-500/30",
		},
		violet: {
			glow: "from-violet-500/20 to-fuchsia-500/20",
			borderGlow: "group-hover:border-violet-500/30 dark:group-hover:border-violet-500/30",
		},
		rose: {
			glow: "from-rose-500/20 to-orange-500/20",
			borderGlow: "group-hover:border-rose-500/30 dark:group-hover:border-rose-500/30",
		},
		indigo: {
			glow: "from-indigo-500/20 to-purple-500/20",
			borderGlow: "group-hover:border-indigo-500/30 dark:group-hover:border-indigo-500/30",
		},
	};

	const activeTheme = themes[theme];

	return (
		<div className="grid gap-12 lg:grid-cols-12 lg:items-center">
			{/* Content side */}
			<div
				className={cn(
					"lg:col-span-5 flex flex-col justify-center",
					reverse ? "lg:order-last" : "",
				)}
			>
				<h3 className="font-semibold text-[#0a0d12] dark:text-white text-[1.8rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.2rem]">
					{title}
				</h3>
				<p className="mt-4 text-[#0a0d12]/60 dark:text-white/60 text-[14px] leading-relaxed sm:text-[15px]">
					{description}
				</p>

				<div className="mt-8 flex flex-col gap-6">
					{cards.map((card) => (
						<SubFeature
							key={card.title}
							title={card.title}
							description={card.description}
						/>
					))}
				</div>
			</div>

			{/* Visual side */}
			<div className="lg:col-span-7 group relative">
				<div
					className={cn(
						"absolute -inset-4 rounded-3xl opacity-30 dark:opacity-40 blur-2xl transition duration-500 group-hover:opacity-50 dark:group-hover:opacity-60 bg-gradient-to-tr",
						activeTheme.glow,
					)}
				/>
				<div
					className={cn(
						"relative overflow-hidden rounded-2xl border border-[#0a0d12]/8 dark:border-white/10 shadow-2xl p-4 sm:p-6 lg:p-8 bg-zinc-950 transition-all duration-300",
						activeTheme.borderGlow,
					)}
				>
					<Visual />
				</div>
			</div>
		</div>
	);
}
