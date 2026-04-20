"use client";

import Link from "next/link";

const CTA = () => {
	return (
		<section id="cta" className="">
			<div className="mx-auto max-w-[1320px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
				<div className="mx-auto max-w-[920px] text-center">
					<p className="font-semibold text-[11px] text-white/40 uppercase tracking-[0.16em]">
						Start today
					</p>
					<h2 className="mt-4 font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						10K emails for free
						<br />
						<span className="text-white/40">per month.</span>
					</h2>
					<p className="mx-auto mt-8 max-w-[520px] text-[15px] text-white/70 leading-7 sm:text-[17px]">
						No credit card required. Join thousands of developers building the
						future of email communication on Reloop.
					</p>

					<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
						<Link
							href="/login"
							className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 font-semibold text-[15px] text-black transition-colors hover:bg-white/90"
						>
							Get started
						</Link>
						<Link
							href="/pricing"
							className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-8 font-semibold text-[15px] text-white transition-colors hover:bg-white/10"
						>
							See pricing
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CTA;
