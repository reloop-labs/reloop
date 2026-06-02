"use client";
import * as Button from "@reloop/ui/button";
import { AnimatedAlternative } from "./animated-alternative";

export default function Hero() {
	return (
		<div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-transparent pt-40 pb-28">
			<main className="relative z-10">
				<section
					id="product"
					className="mx-auto flex max-w-4xl flex-col px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24"
				>
					<div className="mx-auto max-w-[1020px] text-center">
						<div className="mb-10 flex items-center justify-center">
							<AnimatedAlternative />
						</div>
						<h1 className="font-serif text-[2.8rem] leading-[1.05] tracking-tighter sm:text-[4.2rem]">
							Email for AI Agents, Developers & Marketing teams.
						</h1>
						<p className="mx-auto mt-8 max-w-[620px] text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px]">
							High-performance, open-source email infrastructure for AI agents
							and developers. Built for absolute control and scale.
						</p>

						<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
							<a
								href="/dashboard/login"
								className={`${Button.buttonVariants({
									variant: "neutral",
									mode: "filled",
								}).root()} h-11! rounded-2xl! px-8! font-semibold`}
							>
								Start for free
							</a>
							<a
								href="/docs"
								className={`${Button.buttonVariants({
									variant: "neutral",
									mode: "stroke",
								}).root()} h-11! rounded-2xl! px-8! font-semibold`}
							>
								Documentation
							</a>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
