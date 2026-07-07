import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

type PrincipleItem = {
	title: string;
	description: string;
	points: string[];
	icon: string;
	iconColor: string;
	iconBorder: string;
};

type StackItem = {
	title: string;
	description: string;
	icon: string;
	iconColor: string;
	iconBorder: string;
};

const principles: PrincipleItem[] = [
	{
		title: "Code quality is non-negotiable",
		description:
			"Clean, readable, well-tested code isn't optional—it's how we keep email infrastructure maintainable at scale.",
		points: [
			"High test coverage across services",
			"Mandatory code reviews for all changes",
			"Automated linting and formatting",
		],
		icon: "check-circle",
		iconColor: "text-blue-500 dark:text-blue-400",
		iconBorder: "border-blue-500/25 dark:border-blue-400/30",
	},
	{
		title: "Performance is a feature",
		description:
			"Every millisecond matters when you're processing millions of emails. We optimize relentlessly and measure everything.",
		points: [
			"Sub-100ms API response times",
			"Horizontal scaling by design",
			"Continuous performance monitoring",
		],
		icon: "graph-up",
		iconColor: "text-emerald-500 dark:text-emerald-400",
		iconBorder: "border-emerald-500/25 dark:border-emerald-400/30",
	},
	{
		title: "Built for 99.9% uptime",
		description:
			"Email infrastructure can't go down. We architect for resilience with redundancy and automatic failover at every layer.",
		points: [
			"Multi-region deployment",
			"Automatic failover mechanisms",
			"24/7 monitoring and alerting",
		],
		icon: "shield-check",
		iconColor: "text-violet-500 dark:text-violet-400",
		iconBorder: "border-violet-500/25 dark:border-violet-400/30",
	},
];

const stack: StackItem[] = [
	{
		title: "Modern languages",
		description:
			"TypeScript for type safety, Go for performance-critical services, and Rust where every microsecond counts.",
		icon: "code",
		iconColor: "text-blue-500 dark:text-blue-400",
		iconBorder: "border-blue-500/25 dark:border-blue-400/30",
	},
	{
		title: "Battle-tested databases",
		description:
			"PostgreSQL for relational data, Redis for caching, and ClickHouse for analytics—each chosen for its strengths.",
		icon: "database",
		iconColor: "text-emerald-500 dark:text-emerald-400",
		iconBorder: "border-emerald-500/25 dark:border-emerald-400/30",
	},
	{
		title: "Cloud-native architecture",
		description:
			"Kubernetes for orchestration, Docker for containerization, and Terraform for infrastructure as code.",
		icon: "globe",
		iconColor: "text-violet-500 dark:text-violet-400",
		iconBorder: "border-violet-500/25 dark:border-violet-400/30",
	},
	{
		title: "Observability first",
		description:
			"Prometheus for metrics, Grafana for visualization, and distributed tracing across every service.",
		icon: "chart-pie",
		iconColor: "text-orange-500 dark:text-orange-400",
		iconBorder: "border-orange-500/25 dark:border-orange-400/30",
	},
	{
		title: "Security by default",
		description:
			"Zero-trust networking, encrypted everything, and automated security scanning in CI/CD.",
		icon: "shield",
		iconColor: "text-red-500 dark:text-red-400",
		iconBorder: "border-red-500/25 dark:border-red-400/30",
	},
	{
		title: "Developer experience",
		description:
			"Modern tooling, fast feedback loops, and workflows that make contributing to Reloop straightforward.",
		icon: "terminal",
		iconColor: "text-primary-base",
		iconBorder: "border-primary-base/25",
	},
];

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

function StackCard({ item }: { item: StackItem }) {
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

export function EngineeringSection() {
	return (
		<>
			<div className="mb-12 text-center lg:mb-16">
				<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
					How we build
				</p>
				<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
					Principles that guide
					<br />
					<span className="text-primary-base">every commit.</span>
				</h2>
				<p className="mx-auto mt-4 max-w-lg text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
					Reliability, performance, and maintainability aren't slogans—they're
					engineering requirements we hold ourselves to on every layer of the
					stack.
				</p>
			</div>

			<div className="overflow-hidden rounded-4xl border border-stroke-soft-200 bg-stroke-soft-200 dark:border-white/10 dark:bg-white/10">
				<div className="grid gap-px lg:grid-cols-3">
					{principles.map((item) => (
						<PrincipleCard key={item.title} item={item} />
					))}
				</div>
			</div>

			<div className="mt-24">
				<div className="mb-12 text-center lg:mb-16">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						The stack
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Technologies chosen
						<br />
						<span className="text-primary-base">for the job.</span>
					</h2>
					<p className="mx-auto mt-4 max-w-lg text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						We pick tools for their ability to scale, their community support,
						and how well they align with these engineering values.
					</p>
				</div>

				<div className="overflow-hidden rounded-4xl border border-stroke-soft-200 bg-stroke-soft-200 dark:border-white/10 dark:bg-white/10">
					<div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
						{stack.map((item) => (
							<StackCard key={item.title} item={item} />
						))}
					</div>
				</div>
			</div>
		</>
	);
}
