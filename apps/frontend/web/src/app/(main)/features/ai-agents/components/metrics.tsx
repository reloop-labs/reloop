"use client";

export default function Metrics() {
	return (
		<section id="metrics">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Performance
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						Built for Automated Scale
					</h2>
					<p className="mx-auto mt-6 max-w-xl text-base text-text-sub-600 dark:text-white/50">
						Supercharge your AI workflows with mailboxes engineered for sub-second speeds.
					</p>
				</div>

				<div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-primary-base">
							&lt;15ms
						</div>
						<div className="font-medium text-text-strong-950 dark:text-white">
							API Latency
						</div>
						<div className="text-sm text-text-sub-600 dark:text-white/50">
							Instant parsing for agent queries
						</div>
					</div>
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-text-strong-950 dark:text-white">
							100%
						</div>
						<div className="font-medium text-text-strong-950 dark:text-white">
							Type-Safe JSON
						</div>
						<div className="text-sm text-text-sub-600 dark:text-white/50">
							Validates output against schemas
						</div>
					</div>
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-primary-base">
							0%
						</div>
						<div className="font-medium text-text-strong-950 dark:text-white">
							Injection Leaks
						</div>
						<div className="text-sm text-text-sub-600 dark:text-white/50">
							Robust pre-send email sanitation
						</div>
					</div>
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-text-strong-950 dark:text-white">
							99.99%
						</div>
						<div className="font-medium text-text-strong-950 dark:text-white">
							Uptime SLA
						</div>
						<div className="text-sm text-text-sub-600 dark:text-white/50">
							Reliable infrastructure for production
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
