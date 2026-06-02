"use client";

import * as Button from "@reloop/ui/button";

export default function Hero() {
	return (
		<div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-transparent pt-40 pb-28">
			<main className="relative z-10">
				<section className="mx-auto flex max-w-4xl flex-col px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
					<div className="mx-auto max-w-[1020px] text-center">
						<h1 className="font-serif text-[2.8rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[4.2rem]">
							High-Performance
							<br />
							SMTP Relay
						</h1>

						<p className="mx-auto mt-8 max-w-[620px] text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px]">
							Send email through a managed SMTP relay built for developers.
							Point your existing mailers at Reloop with TLS, authentication,
							and sub-second delivery—no infrastructure to maintain.
						</p>

						<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
							<a
								href="/dashboard/signup"
								className={`${Button.buttonVariants({
									variant: "neutral",
									mode: "filled",
								}).root()} h-11! rounded-2xl! px-8! font-semibold`}
							>
								Get SMTP credentials
							</a>
							<a
								href="#playground"
								className={`${Button.buttonVariants({
									variant: "neutral",
									mode: "stroke",
								}).root()} h-11! rounded-2xl! px-8! font-semibold`}
							>
								View connection setup
							</a>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
