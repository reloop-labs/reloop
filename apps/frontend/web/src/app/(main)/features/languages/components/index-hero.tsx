"use client";

import * as Button from "@reloop/ui/button";

export default function IndexHero() {
	return (
		<div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-transparent pt-40 pb-28">
			<main className="relative z-10">
				<section className="mx-auto flex max-w-4xl flex-col px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
					<div className="mx-auto max-w-[1020px] text-center">
						<h1 className="font-serif text-[2.8rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[4.2rem]">
							Send Email In
							<br />
							Your Language
						</h1>

						<p className="mx-auto mt-8 max-w-[620px] text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px]">
							Official Reloop SDKs for Node.js, Python, Go, Rust, PHP, Ruby,
							Elixir, Java, and .NET. Install, authenticate, and send your first
							message in minutes.
						</p>

						<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
							<a
								href="/dashboard/signup"
								className={`${Button.buttonVariants({
									variant: "neutral",
									mode: "filled",
								}).root()} h-11! rounded-2xl! px-8! font-semibold`}
							>
								Get API key
							</a>
							<a
								href="#languages"
								className={`${Button.buttonVariants({
									variant: "neutral",
									mode: "stroke",
								}).root()} h-11! rounded-2xl! px-8! font-semibold`}
							>
								Browse SDKs
							</a>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
