import { cn } from "@reloop/ui/cn";

export function SubFeature({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<div className="group/card flex gap-4">
			<div className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-[#0a0d12]/8 bg-white font-bold text-[10px] text-emerald-500 shadow-sm dark:border-white/8 dark:bg-white/[0.02]">
				✓
			</div>
			<div>
				<h4 className="font-semibold text-[#0a0d12] text-sm leading-snug dark:text-white">
					{title}
				</h4>
				<p className="mt-1 text-[#0a0d12]/50 text-[13px] leading-relaxed dark:text-white/40">
					{description}
				</p>
			</div>
		</div>
	);
}

export function SectionBlock({
	title,
	subtitle,
	children,
	className,
}: {
	title: string;
	subtitle: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn("py-20 transition-colors duration-300 lg:py-24", className)}
		>
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="mx-auto mb-16 max-w-3xl text-center">
					<h2 className="font-bold font-serif text-[#0a0d12] text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.2rem] lg:text-[3.8rem] dark:text-white">
						{title}
					</h2>
					<p className="mt-5 text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/60">
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
	theme = "emerald",
	reverse = false,
}: {
	title: string;
	description: string;
	cards: { title: string; description: string }[];
	theme?: "emerald" | "cyan" | "violet" | "rose" | "indigo";
	reverse?: boolean;
}) {
	const themes = {
		emerald: {
			glow: "from-emerald-500/20 to-teal-500/20",
			borderGlow:
				"group-hover:border-emerald-500/30 dark:group-hover:border-emerald-500/30",
		},
		cyan: {
			glow: "from-cyan-500/20 to-blue-500/20",
			borderGlow:
				"group-hover:border-cyan-500/30 dark:group-hover:border-cyan-500/30",
		},
		violet: {
			glow: "from-violet-500/20 to-fuchsia-500/20",
			borderGlow:
				"group-hover:border-violet-500/30 dark:group-hover:border-violet-500/30",
		},
		rose: {
			glow: "from-rose-500/20 to-orange-500/20",
			borderGlow:
				"group-hover:border-rose-500/30 dark:group-hover:border-rose-500/30",
		},
		indigo: {
			glow: "from-indigo-500/20 to-purple-500/20",
			borderGlow:
				"group-hover:border-indigo-500/30 dark:group-hover:border-indigo-500/30",
		},
	};

	const activeTheme = themes[theme];

	return (
		<div className="grid gap-12 lg:grid-cols-12 lg:items-center">
			{/* Content side */}
			<div
				className={cn(
					"flex flex-col justify-center lg:col-span-5",
					reverse ? "lg:order-last" : "",
				)}
			>
				<h3 className="font-semibold text-[#0a0d12] text-[1.8rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.2rem] dark:text-white">
					{title}
				</h3>
				<p className="mt-4 text-[#0a0d12]/60 text-[14px] leading-relaxed sm:text-[15px] dark:text-white/60">
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
			<div className="group relative lg:col-span-7">
				<div
					className={cn(
						"-inset-4 absolute rounded-3xl bg-gradient-to-tr opacity-30 blur-2xl transition duration-500 group-hover:opacity-50 dark:opacity-40 dark:group-hover:opacity-60",
						activeTheme.glow,
					)}
				/>
			</div>
		</div>
	);
}
