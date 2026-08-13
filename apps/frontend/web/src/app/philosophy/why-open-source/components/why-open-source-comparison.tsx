import Link from "next/link";

type ComparisonRow = {
	dimension: string;
	closed: string;
	open: string;
};

const comparisonMatrix: ComparisonRow[] = [
	{
		dimension: "Routing and deliverability",
		closed:
			"Proprietary black-box algorithms. You cannot inspect why a message was throttled, deferred, or rerouted.",
		open: "Deterministic routing rules and retry schedules. Every delivery decision is traceable in public source code.",
	},
	{
		dimension: "Deployment freedom",
		closed:
			"SaaS multi-tenant cloud only. Cannot run inside your internal VPC, private subnet, or on-premise hardware.",
		open: "Deploy via Docker Compose, Kubernetes, or bare metal on your own infrastructure, or use managed reloop.sh.",
	},
	{
		dimension: "Data sovereignty and privacy",
		closed:
			"All recipient addresses, email bodies, headers, and transmission logs reside on vendor-controlled servers.",
		open: "Zero data leaves your VPC when self-hosted. Total control for strict compliance (GDPR, HIPAA, SOC 2).",
	},
	{
		dimension: "Incident triage and debugging",
		closed:
			"Refresh a public status page and wait for level-1 support ticket responses during active outages.",
		open: "Inspect application logs, verify queue states in Redis, trace the source code, and reproduce issues locally.",
	},
	{
		dimension: "Scaling economics",
		closed:
			"Volume-tiered billing curves with steep step-up pricing that penalizes high-throughput application growth.",
		open: "Predictable flat compute costs on your own hardware, or transparent volume tiers on reloop.sh.",
	},
	{
		dimension: "Codebase integrity",
		closed:
			"Dual-tier models where advanced deliverability features and dedicated IP tooling require enterprise sales calls.",
		open: "Single public monorepo. Every feature is released under Apache 2.0 with zero hidden enterprise forks.",
	},
];

export function WhyOpenSourceComparison() {
	return (
		<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* Section Header */}
				<div className="border-stroke-soft-200 border-b px-6 py-14 sm:px-10 sm:py-16 lg:px-12 dark:border-white/10">
					<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						The operational difference.
					</h2>
					<p className="mt-1.5 max-w-2xl text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						Closed platforms ask you to trust uninspectable routing. Open source lets you verify every delivery decision in code.
					</p>
				</div>

				{/* Comparative Table */}
				<div>
					{/* Table Header on Desktop */}
					<div className="hidden grid-cols-12 border-b border-stroke-soft-200 bg-neutral-50 px-6 py-4 text-[12px] font-semibold text-text-sub-600 sm:grid sm:px-10 lg:px-12 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/50">
						<div className="col-span-3">Dimension</div>
						<div className="col-span-4">Proprietary closed source</div>
						<div className="col-span-5 text-text-strong-950 dark:text-white">
							Reloop open source
						</div>
					</div>

					{/* Rows */}
					<div className="divide-y divide-stroke-soft-200 dark:divide-white/10">
						{comparisonMatrix.map((row) => (
							<div
								key={row.dimension}
								className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-12 sm:gap-6 sm:px-10 lg:px-12 lg:py-6"
							>
								<div className="col-span-1 sm:col-span-3">
									<p className="font-semibold text-[14px] text-text-strong-950 sm:text-[15px] dark:text-white">
										{row.dimension}
									</p>
								</div>
								<div className="col-span-1 sm:col-span-4">
									<p className="text-[11px] font-semibold text-text-sub-600 uppercase tracking-wider sm:hidden dark:text-white/45">
										Proprietary closed source
									</p>
									<p className="mt-1 text-[13.5px] text-text-sub-600 leading-relaxed sm:mt-0 sm:text-[14px] dark:text-white/50">
										{row.closed}
									</p>
								</div>
								<div className="col-span-1 sm:col-span-5">
									<p className="text-[11px] font-semibold text-text-strong-950 uppercase tracking-wider sm:hidden dark:text-white">
										Reloop open source
									</p>
									<p className="mt-1 text-[13.5px] text-text-strong-950 leading-relaxed sm:mt-0 sm:text-[14px] dark:text-white/90">
										{row.open}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Footer Note */}
				<div className="border-t border-stroke-soft-200 px-6 py-6 sm:px-10 lg:px-12 dark:border-white/10">
					<p className="text-right text-[13px] text-text-sub-600 dark:text-white/45">
						Full licensing specifications are available in our{" "}
						<Link
							href="/license"
							className="font-medium text-text-strong-950 underline decoration-stroke-soft-200 underline-offset-4 hover:decoration-text-strong-950 dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
						>
							Apache 2.0 license document
						</Link>
						.
					</p>
				</div>
			</div>
		</section>
	);
}
