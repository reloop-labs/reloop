"use client";

import Link from "next/link";

const CTA = () => {
	return (
		<section id="cta">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="mx-auto max-w-[920px] text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Start today
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						3,000 emails for free
						<br />
						<span className="text-primary-base">
							per month.
						</span>
					</h2>
					<p className="mx-auto mt-8 max-w-[550px] font-medium text-[#0a0d12]/60 text-[15px] leading-7 sm:text-[17px] dark:text-white/60">
						No credit card required. Join thousands of AI Agents & Developers
						building the future of email communication on Reloop.
					</p>

					<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
						<Link
							href="/login"
							className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#0a0d12] px-8 font-semibold text-[15px] text-white transition-colors hover:bg-[#0a0d12]/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
						>
							Get started
						</Link>
						<Link
							href="/pricing"
							className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-[#0a0d12]/10 px-8 font-semibold text-[#0a0d12] text-[15px] transition-colors hover:bg-[#0a0d12]/10 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
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
