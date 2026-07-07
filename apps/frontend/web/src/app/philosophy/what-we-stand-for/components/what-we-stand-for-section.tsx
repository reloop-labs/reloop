import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

type ValueItem = {
	title: string;
	description: string;
	icon: string;
	iconColor: string;
	iconBorder: string;
};

type PrincipleItem = {
	title: string;
	description: string;
	points: string[];
	icon: string;
	iconColor: string;
	iconBorder: string;
};

const coreValues: ValueItem[] = [
	{
		title: "Show the work",
		description:
			"Source code, pricing, and routing logic you can read—not trust on a sales call.",
		icon: "eye-outline",
		iconColor: "text-orange-500 dark:text-orange-400",
		iconBorder: "border-orange-500/25 dark:border-orange-400/30",
	},
	{
		title: "Ship what you ask for",
		description:
			"GitHub issues and community PRs drive the roadmap—not a closed quarterly plan.",
		icon: "users",
		iconColor: "text-blue-500 dark:text-blue-400",
		iconBorder: "border-blue-500/25 dark:border-blue-400/30",
	},
	{
		title: "Never stop at good enough",
		description:
			"Every release should make sending email faster, simpler, or easier to debug.",
		icon: "graph-up",
		iconColor: "text-violet-500 dark:text-violet-400",
		iconBorder: "border-violet-500/25 dark:border-violet-400/30",
	},
	{
		title: "Security you can verify",
		description:
			"Open code, self-hosting, and auditable routing—because email is critical infrastructure.",
		icon: "shield-check",
		iconColor: "text-red-500 dark:text-red-400",
		iconBorder: "border-red-500/25 dark:border-red-400/30",
	},
	{
		title: "Complexity is a bug",
		description:
			"If it's hard to deploy, debug, or leave—treat that as a defect, not a feature.",
		icon: "tag",
		iconColor: "text-amber-500 dark:text-amber-400",
		iconBorder: "border-amber-500/25 dark:border-amber-400/30",
	},
	{
		title: "Built for builders",
		description:
			"Typed SDKs, clear docs, and SMTP that works with the stack you already run.",
		icon: "terminal",
		iconColor: "text-primary-base",
		iconBorder: "border-primary-base/25",
	},
];

const principles: PrincipleItem[] = [
	{
		title: "Open source by default",
		description: "The product and the process are public.",
		points: [
			"Apache 2.0 codebase on GitHub",
			"Issues and PRs in the open",
			"Same code—hosted or self-deployed",
		],
		icon: "code",
		iconColor: "text-violet-500 dark:text-violet-400",
		iconBorder: "border-violet-500/25 dark:border-violet-400/30",
	},
	{
		title: "You steer the roadmap",
		description: "We prioritize what teams actually need in production.",
		points: [
			"Feature requests tracked publicly",
			"Bugs filed and fixed in the open",
			"Outside contributors welcome",
		],
		icon: "users",
		iconColor: "text-blue-500 dark:text-blue-400",
		iconBorder: "border-blue-500/25 dark:border-blue-400/30",
	},
	{
		title: "Trust through visibility",
		description: "You shouldn't wonder how email leaves your app.",
		points: [
			"Routing logic readable in source",
			"Deploy on your own servers",
			"Clear logs when a send fails",
		],
		icon: "shield-check",
		iconColor: "text-emerald-500 dark:text-emerald-400",
		iconBorder: "border-emerald-500/25 dark:border-emerald-400/30",
	},
];

function ValueCard({ item }: { item: ValueItem }) {
	return (
		<div className="flex flex-col bg-bg-white-0 p-8 transition-colors duration-300 hover:bg-neutral-950/[0.004] lg:p-10 dark:bg-transparent dark:hover:bg-white/[0.012]">
			<div
				className={cn(
					"inline-flex size-10 items-center justify-center rounded-xl border bg-transparent",
					item.iconBorder,
				)}
			>
				<Icon name={item.icon} className={cn("size-5", item.iconColor)} />
			</div>
			<h3 className="mt-6 font-semibold text-[15px] text-text-strong-950 leading-snug sm:text-[17px] dark:text-white">
				{item.title}
			</h3>
			<p className="mt-3 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
				{item.description}
			</p>
		</div>
	);
}

function PrincipleCard({ item }: { item: PrincipleItem }) {
	return (
		<div className="flex flex-col bg-bg-white-0 p-8 transition-colors duration-300 hover:bg-neutral-950/[0.004] lg:p-10 dark:bg-transparent dark:hover:bg-white/[0.012]">
			<div
				className={cn(
					"inline-flex size-10 items-center justify-center rounded-xl border bg-transparent",
					item.iconBorder,
				)}
			>
				<Icon name={item.icon} className={cn("size-5", item.iconColor)} />
			</div>
			<h3 className="mt-6 font-semibold text-[15px] text-text-strong-950 leading-snug sm:text-[17px] dark:text-white">
				{item.title}
			</h3>
			<p className="mt-3 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
				{item.description}
			</p>
			<ul className="mt-6 space-y-2.5">
				{item.points.map((point) => (
					<li
						key={point}
						className="flex items-start gap-3 text-[14px] leading-snug"
					>
						<Icon
							name="check-circle"
							className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/35"
						/>
						<span className="text-text-sub-600 dark:text-white/60">
							{point}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}

function ValuesGrid() {
	return (
		<div className="overflow-hidden rounded-4xl border border-stroke-soft-200 bg-stroke-soft-200 dark:border-white/10 dark:bg-white/10">
			<div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
				{coreValues.map((item) => (
					<ValueCard key={item.title} item={item} />
				))}
			</div>
		</div>
	);
}

function PrinciplesGrid() {
	return (
		<div className="overflow-hidden rounded-4xl border border-stroke-soft-200 bg-stroke-soft-200 dark:border-white/10 dark:bg-white/10">
			<div className="grid gap-px lg:grid-cols-3">
				{principles.map((item) => (
					<PrincipleCard key={item.title} item={item} />
				))}
			</div>
		</div>
	);
}

export function WhatWeStandForSection() {
	return (
		<>
			<div className="mb-12 text-center lg:mb-16">
				<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
					How we decide
					<br />
					<span className="text-primary-base">what ships.</span>
				</h2>
				<p className="mx-auto mt-4 max-w-lg text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
					No poster on a wall. Rules we use when choosing features, defaults,
					and what stays open source.
				</p>
			</div>

			<ValuesGrid />

			<div className="mt-24">
				<div className="mb-12 text-center lg:mb-16">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						In practice
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Promises you can
						<br />
						<span className="text-primary-base">check in GitHub.</span>
					</h2>
					<p className="mx-auto mt-4 max-w-lg text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						Three ways these values show up in the product—not just on this
						page.
					</p>
				</div>
				<PrinciplesGrid />
			</div>
		</>
	);
}
