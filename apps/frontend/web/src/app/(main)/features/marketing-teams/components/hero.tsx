"use client";

import * as Button from "@reloop/ui/button";

export default function Hero() {
	return (
		<div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-transparent pt-48 pb-28 sm:pt-52">
			<main className="relative z-10">
				<section className="mx-auto flex max-w-4xl flex-col px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
					<div className="mx-auto max-w-[1020px] text-center">
						<h1 className="font-serif text-[2.8rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[4.2rem] dark:text-white">
							Collaborative Campaigns
							<br />
							At Low-Latency Scale
						</h1>

						<p className="mx-auto mt-8 max-w-[620px] text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
							Bring designers, copywriters, and developers into one workspace.
							Design beautiful newsletters, manage broadcasts, and optimize
							conversions with AI assistance.
						</p>

						<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
							<a
								href="/dashboard/signup"
								className={`${Button.buttonVariants({
									variant: "neutral",
									mode: "filled",
								}).root()} h-11! rounded-2xl! px-8! font-semibold`}
							>
								Create a Campaign
							</a>
							<a
								href="/company/contact-us"
								className={`${Button.buttonVariants({
									variant: "neutral",
									mode: "stroke",
								}).root()} h-11! rounded-2xl! px-8! font-semibold`}
							>
								Book a Demo
							</a>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
