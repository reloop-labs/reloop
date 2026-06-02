"use client";

import Link from "next/link";

export default function Hero() {
	return (
		<section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-[#05070b] py-24 text-white sm:py-32">
			{/* Background Grid Pattern */}
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_80%,transparent_100%)]" />
			<div className="-translate-x-1/2 pointer-events-none absolute top-0 left-1/2 h-[500px] w-[800px] rounded-full bg-teal-600/5 blur-[120px]" />

			<div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
				<p className="font-semibold text-[11px] text-white/40 uppercase tracking-[0.16em]">
					Features / Marketing Teams
				</p>

				<h1 className="mt-6 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text font-semibold text-[2.8rem] text-transparent leading-[1.05] tracking-tighter drop-shadow-[0_10px_34px_rgba(0,0,0,0.32)] sm:text-[4.2rem]">
					Collaborative Campaigns <br />
					At Low-Latency Scale
				</h1>

				<p className="mx-auto mt-8 max-w-[620px] text-[15px] text-white/50 leading-relaxed sm:text-[17px]">
					Bring designers, copywriters, and developers into one workspace.
					Design beautiful newsletters, manage broadcasts, and optimize conversions with AI assistance.
				</p>

				<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
					<Link
						href="/dashboard/signup"
						className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-8 font-semibold text-[#0a0d12] text-[15px] transition-colors hover:bg-white/92"
					>
						Create a Campaign
					</Link>
					<Link
						href="/contact"
						className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-white/18 bg-black/16 px-8 font-semibold text-[15px] text-white backdrop-blur-sm transition-colors hover:bg-black/24"
					>
						Book a Demo
					</Link>
				</div>
			</div>
		</section>
	);
}
