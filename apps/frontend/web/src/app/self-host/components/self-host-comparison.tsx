import { Icon } from "@reloop/ui/icon";

export function SelfHostComparison() {
	const rows = [
		{ feature: "License", selfHost: "Apache 2.0 (Open Source)", cloud: "Managed Cloud" },
		{ feature: "Data Residency & Sovereignty", selfHost: "100% On-Prem / Your VPC", cloud: "Managed Global Cloud" },
		{ feature: "Sending Caps & Volume Limits", selfHost: "Unlimited (Your hardware)", cloud: "Tier-based quota" },
		{ feature: "Dedicated IP Warmup & Reputation", selfHost: "Self-managed", cloud: "Automated by Reloop" },
		{ feature: "Server & Infrastructure Maintenance", selfHost: "Self-managed", cloud: "Zero maintenance" },
		{ feature: "High-Availability Multi-Region SLA", selfHost: "Configurable by your DevOps", cloud: "99.99% Included" },
		{ feature: "AI Agent Inboxes & MCP Protocol", selfHost: "Included", cloud: "Included" },
		{ feature: "API, Webhooks, Templates, Analytics", selfHost: "Included", cloud: "Included" },
	];

	return (
		<section className="border-stroke-soft-200 border-t py-16 sm:py-20 dark:border-white/10">
			<div className="mx-auto max-w-5xl px-6 sm:px-8 md:max-w-7xl lg:px-12">
				<div className="text-center">
					<h2 className="font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl lg:text-4xl dark:text-white">
						Self-Hosted vs. Reloop Cloud
					</h2>
					<p className="mt-3 text-[14.5px] text-text-sub-600 sm:text-base dark:text-white/60">
						Same powerful API engine and modern UI, tailored to your deployment strategy.
					</p>
				</div>

				<div className="mt-12 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/30 dark:border-white/10 dark:bg-white/[0.02]">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead>
								<tr className="border-stroke-soft-200 border-b bg-bg-weak-50/80 dark:border-white/10 dark:bg-white/5">
									<th className="px-6 py-4 font-semibold text-text-strong-950 dark:text-white">Feature</th>
									<th className="px-6 py-4 font-semibold text-text-strong-950 dark:text-white">Self-Hosted</th>
									<th className="px-6 py-4 font-semibold text-text-strong-950 dark:text-white">Reloop Cloud</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-stroke-soft-200 dark:divide-white/10">
								{rows.map((row) => (
									<tr key={row.feature} className="transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.02]">
										<td className="px-6 py-4 font-medium text-text-strong-950 dark:text-white">{row.feature}</td>
										<td className="px-6 py-4 text-text-sub-600 dark:text-white/70">
											<span className="inline-flex items-center gap-1.5">
												<Icon name="check" className="size-4 text-emerald-500" />
												<span>{row.selfHost}</span>
											</span>
										</td>
										<td className="px-6 py-4 text-text-sub-600 dark:text-white/70">
											<span className="inline-flex items-center gap-1.5">
												<Icon name="check" className="size-4 text-blue-500" />
												<span>{row.cloud}</span>
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</section>
	);
}
