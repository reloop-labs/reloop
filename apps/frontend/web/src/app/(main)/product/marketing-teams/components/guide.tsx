"use client";

export default function Guide() {
	return (
		<section className="border-[#0a0d12]/5 border-t bg-[#f8f8f8] py-24 text-[#0a0d12] sm:py-32">
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="mb-20 text-center">
					<p className="font-semibold text-[#0a0d12]/40 text-[11px] uppercase tracking-[0.16em]">
						Get Started
					</p>
					<h2 className="mt-4 font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						Setup in 3 Steps
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-[#0a0d12]/50 text-base">
						Deploy newsletter campaigns and automated drip flows in minutes.
					</p>
				</div>

				<div className="grid gap-px overflow-hidden rounded-2xl border border-[#0a0d12]/8 bg-[#0a0d12]/8 md:grid-cols-3">
					<div className="flex flex-col justify-between bg-white p-8 lg:p-10">
						<div>
							<div className="flex size-8 items-center justify-center rounded-lg bg-[#0a0d12] font-bold font-mono text-white text-xs">
								1
							</div>
							<h3 className="mt-4 font-semibold text-[#0a0d12] text-lg leading-snug">
								Design Templates
							</h3>
							<p className="mt-4 text-[#0a0d12]/56 text-[14px] leading-[1.7]">
								Use our live collaborative canvas or write clean React code to build responsive templates in real-time.
							</p>
						</div>
					</div>

					<div className="flex flex-col justify-between bg-white p-8 lg:p-10">
						<div>
							<div className="flex size-8 items-center justify-center rounded-lg bg-[#0a0d12] font-bold font-mono text-white text-xs">
								2
							</div>
							<h3 className="mt-4 font-semibold text-[#0a0d12] text-lg leading-snug">
								Verify SPF / DKIM
							</h3>
							<p className="mt-4 text-[#0a0d12]/56 text-[14px] leading-[1.7]">
								Configure domain records on the dashboard to automatically pass DMARC and ISP safety tests, ensuring inbox delivery.
							</p>
						</div>
					</div>

					<div className="flex flex-col justify-between bg-white p-8 lg:p-10">
						<div>
							<div className="flex size-8 items-center justify-center rounded-lg bg-[#0a0d12] font-bold font-mono text-white text-xs">
								3
							</div>
							<h3 className="mt-4 font-semibold text-[#0a0d12] text-lg leading-snug">
								Broadcast at Scale
							</h3>
							<p className="mt-4 text-[#0a0d12]/56 text-[14px] leading-[1.7]">
								Trigger newsletters to your segments via Reloop SDK or API endpoints and monitor clicks and conversions in real-time.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
