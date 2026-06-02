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
						Built for production traffic
					</h2>
					<p className="mx-auto mt-6 max-w-xl text-base text-text-sub-600 dark:text-white/50">
						Reliable SMTP relay infrastructure with the speed and uptime your app demands.
					</p>
				</div>

				<div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-primary-base">
							&lt;15ms
						</div>
						<div className="font-medium text-text-strong-950 dark:text-white">
							Relay latency
						</div>
						<div className="text-sm text-text-sub-600 dark:text-white/50">
							Edge-optimized SMTP handoff
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
							Production-grade availability
						</div>
					</div>
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-primary-base">14</div>
						<div className="font-medium text-text-strong-950 dark:text-white">
							Global regions
						</div>
						<div className="text-sm text-text-sub-600 dark:text-white/50">
							Low-latency relay endpoints
						</div>
					</div>
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-text-strong-950 dark:text-white">
							TLS
						</div>
						<div className="font-medium text-text-strong-950 dark:text-white">
							Required in transit
						</div>
						<div className="text-sm text-text-sub-600 dark:text-white/50">
							Ports 587 and 465 supported
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
