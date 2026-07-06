"use client";

import * as Button from "@reloop/ui/button";

export default function Hero() {
	return (
		<div className="relative flex min-h-[70dvh] items-center justify-center overflow-hidden bg-transparent pt-48 pb-20 sm:pt-52">
			<section className="mx-auto max-w-4xl px-4 pb-8 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-[920px] text-center">
					<p className="font-semibold text-[11px] text-primary-base uppercase tracking-[0.16em]">
						SMTP relay
					</p>
					<h1 className="mt-4 font-serif text-[2.8rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[4rem] dark:text-white">
						Send email from apps
						<br />
						that already use <span className="text-primary-base">SMTP.</span>
					</h1>
					<p className="mx-auto mt-6 max-w-[560px] text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
						No new SDK required. Point your mailer at Reloop—same host, port,
						and username/password pattern you already know.
					</p>
					<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
						<a
							href="/dashboard/signup"
							className={`${Button.buttonVariants({
								variant: "neutral",
								mode: "filled",
							}).root()} h-11! rounded-full! px-8! font-semibold`}
						>
							Get SMTP credentials
						</a>
						<a
							href="#setup"
							className={`${Button.buttonVariants({
								variant: "neutral",
								mode: "stroke",
							}).root()} h-11! rounded-full! px-8! font-semibold`}
						>
							See how to connect
						</a>
					</div>
				</div>
			</section>
		</div>
	);
}
