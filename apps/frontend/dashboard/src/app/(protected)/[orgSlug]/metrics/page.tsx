"use client";

import { MetricsChart } from "./components/metrics-chart";
import { MetricsStats } from "./components/metrics-stats";

const MetricsPage = () => {
	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
			<div className="mb-10 flex items-center justify-between">
				<div>
					<h1 className="font-semibold text-3xl text-text-strong-950 tracking-tight">
						Metrics
					</h1>
					<p className="mt-1 font-medium text-paragraph-sm text-text-soft-400">
						Analyze your email performance and delivery health.
					</p>
				</div>
			</div>

			<div className="space-y-8">
				<section>
					<MetricsStats />
				</section>

				<section>
					<MetricsChart />
				</section>

				{/* Placeholder for more granular metrics or tables */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-6 shadow-black/5 shadow-sm">
						<h3 className="mb-4 font-semibold text-text-strong-950">
							Top Domains
						</h3>
						<div className="space-y-4">
							{[
								{ domain: "gmail.com", sent: 12402, rate: "98.2%" },
								{ domain: "outlook.com", sent: 4231, rate: "97.5%" },
								{ domain: "yahoo.com", sent: 2103, rate: "94.8%" },
							].map((item) => (
								<div
									key={item.domain}
									className="flex items-center justify-between"
								>
									<span className="font-medium text-paragraph-sm text-text-sub-600">
										{item.domain}
									</span>
									<div className="flex gap-4">
										<span className="text-paragraph-xs text-text-soft-400">
											{item.sent.toLocaleString()} sent
										</span>
										<span className="font-semibold text-paragraph-xs text-success-base">
											{item.rate}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-6 shadow-black/5 shadow-sm">
						<h3 className="mb-4 font-semibold text-text-strong-950">
							Delivery Issues
						</h3>
						<div className="space-y-4">
							{[
								{ reason: "Bounced", count: 124, color: "bg-red-500" },
								{ reason: "Dropped", count: 42, color: "bg-orange-500" },
								{ reason: "Complaint", count: 12, color: "bg-yellow-500" },
							].map((item) => (
								<div
									key={item.reason}
									className="flex items-center justify-between"
								>
									<div className="flex items-center gap-2">
										<div className={`h-2 w-2 rounded-full ${item.color}`} />
										<span className="font-medium text-paragraph-sm text-text-sub-600">
											{item.reason}
										</span>
									</div>
									<span className="font-semibold text-paragraph-sm text-text-strong-950">
										{item.count}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MetricsPage;
