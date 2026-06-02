"use client";

import Link from "next/link";

export default function CTA() {
	return (
		<section className="border-[#0a0d12]/5 border-t bg-white py-24 text-[#0a0d12] sm:py-32">
			<div className="mx-auto max-w-[920px] px-4 text-center">
				<p className="font-semibold text-[#0a0d12]/40 text-[11px] uppercase tracking-[0.16em]">
					Start today
				</p>
				<h2 className="mt-4 font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
					Ready to launch your next campaign?
					<br />
					<span className="text-[#0a0d12]/40">Start for free.</span>
				</h2>
				<p className="mx-auto mt-8 max-w-[550px] font-medium text-[#0a0d12]/60 text-[15px] leading-7 sm:text-[17px]">
					Bring designers, copywriters, and developers together on Reloop today. Start sending your first campaign in minutes.
				</p>

				<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
					<Link
						href="/dashboard/signup"
						className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#0a0d12] px-8 font-semibold text-[15px] text-white transition-colors hover:bg-[#0a0d12]/90"
					>
						Get started
					</Link>
					<Link
						href="/docs"
						className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-[#0a0d12]/10 px-8 font-semibold text-[#0a0d12] text-[15px] transition-colors hover:bg-[#0a0d12]/10"
					>
						Read Campaign Docs
					</Link>
				</div>
			</div>
		</section>
	);
}
