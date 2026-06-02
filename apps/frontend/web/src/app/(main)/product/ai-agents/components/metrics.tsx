"use client";

export default function Metrics() {
	return (
		<section className="border-[#0a0d12]/5 border-t bg-white py-24 sm:py-32">
			<div className="mx-auto max-w-4xl text-center">
				<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
					Built for Automated Scale
				</h2>
				<p className="mx-auto mt-6 max-w-xl text-[#0a0d12]/50 text-base">
					Supercharge your AI workflows with mailboxes engineered for sub-second speeds.
				</p>

				<div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-purple-600">
							&lt;15ms
						</div>
						<div className="font-medium text-gray-900">
							API Latency
						</div>
						<div className="text-sm text-text-sub-600">
							Instant parsing for agent queries
						</div>
					</div>
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-blue-600">
							100%
						</div>
						<div className="font-medium text-gray-900">
							Type-Safe JSON
						</div>
						<div className="text-sm text-text-sub-600">
							Validates output against schemas
						</div>
					</div>
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-indigo-600">
							0%
						</div>
						<div className="font-medium text-gray-900">
							Injection Leaks
						</div>
						<div className="text-sm text-text-sub-600">
							Robust pre-send email sanitation
						</div>
					</div>
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-emerald-600">
							99.99%
						</div>
						<div className="font-medium text-gray-900">
							Uptime SLA
						</div>
						<div className="text-sm text-text-sub-600">
							Reliable infrastructure for production
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
