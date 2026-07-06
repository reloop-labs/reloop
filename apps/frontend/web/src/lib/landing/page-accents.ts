export type PageAccent =
	| "emerald"
	| "blue"
	| "violet"
	| "orange"
	| "rose"
	| "indigo"
	| "cyan"
	| "amber"
	| "slate";

export const accentStyles: Record<
	PageAccent,
	{
		bg: string;
		text: string;
		ring: string;
		code: string;
		badge: string;
		hoverBorder: string;
		groupHoverText: string;
	}
> = {
	emerald: {
		bg: "bg-emerald-500",
		text: "text-emerald-600 dark:text-emerald-400",
		ring: "ring-emerald-500/20",
		code: "from-emerald-950 to-[#0a0f0d]",
		badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
		hoverBorder: "hover:border-emerald-500/40 dark:hover:border-emerald-400/30",
		groupHoverText:
			"group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
	},
	blue: {
		bg: "bg-blue-500",
		text: "text-blue-600 dark:text-blue-400",
		ring: "ring-blue-500/20",
		code: "from-blue-950 to-[#0a0d14]",
		badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
		hoverBorder: "hover:border-blue-500/40 dark:hover:border-blue-400/30",
		groupHoverText: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
	},
	violet: {
		bg: "bg-violet-500",
		text: "text-violet-600 dark:text-violet-400",
		ring: "ring-violet-500/20",
		code: "from-violet-950 to-[#0f0a14]",
		badge: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
		hoverBorder: "hover:border-violet-500/40 dark:hover:border-violet-400/30",
		groupHoverText:
			"group-hover:text-violet-600 dark:group-hover:text-violet-400",
	},
	orange: {
		bg: "bg-orange-500",
		text: "text-orange-600 dark:text-orange-400",
		ring: "ring-orange-500/20",
		code: "from-orange-950 to-[#140a0a]",
		badge: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
		hoverBorder: "hover:border-orange-500/40 dark:hover:border-orange-400/30",
		groupHoverText:
			"group-hover:text-orange-600 dark:group-hover:text-orange-400",
	},
	rose: {
		bg: "bg-rose-500",
		text: "text-rose-600 dark:text-rose-400",
		ring: "ring-rose-500/20",
		code: "from-rose-950 to-[#140a10]",
		badge: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
		hoverBorder: "hover:border-rose-500/40 dark:hover:border-rose-400/30",
		groupHoverText: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
	},
	indigo: {
		bg: "bg-indigo-500",
		text: "text-indigo-600 dark:text-indigo-400",
		ring: "ring-indigo-500/20",
		code: "from-indigo-950 to-[#0a0a14]",
		badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
		hoverBorder: "hover:border-indigo-500/40 dark:hover:border-indigo-400/30",
		groupHoverText:
			"group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
	},
	cyan: {
		bg: "bg-cyan-500",
		text: "text-cyan-600 dark:text-cyan-400",
		ring: "ring-cyan-500/20",
		code: "from-cyan-950 to-[#0a1214]",
		badge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
		hoverBorder: "hover:border-cyan-500/40 dark:hover:border-cyan-400/30",
		groupHoverText: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
	},
	amber: {
		bg: "bg-amber-500",
		text: "text-amber-600 dark:text-amber-400",
		ring: "ring-amber-500/20",
		code: "from-amber-950 to-[#141008]",
		badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
		hoverBorder: "hover:border-amber-500/40 dark:hover:border-amber-400/30",
		groupHoverText:
			"group-hover:text-amber-600 dark:group-hover:text-amber-400",
	},
	slate: {
		bg: "bg-slate-600",
		text: "text-slate-600 dark:text-slate-400",
		ring: "ring-slate-500/20",
		code: "from-slate-950 to-black",
		badge: "bg-slate-500/10 text-slate-700 dark:text-slate-400",
		hoverBorder: "hover:border-slate-500/40 dark:hover:border-slate-400/30",
		groupHoverText:
			"group-hover:text-slate-600 dark:group-hover:text-slate-400",
	},
};
