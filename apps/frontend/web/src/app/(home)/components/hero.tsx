"use client";
import * as Button from "@reloop/ui/button";
import Link from "next/link";
import { AnimatedAlternative } from "./animated-alternative";

export default function Hero() {
	return (
		<div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-transparent pt-48 pb-28 sm:pt-52">
			<main className="relative z-10">
				<section
					id="features"
					className="mx-auto flex max-w-4xl flex-col px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24"
				>
					<div className="mx-auto max-w-[1020px] text-center">
						<div className="mb-10 flex items-center justify-center">
							<AnimatedAlternative />
						</div>
						<h1 className="font-serif text-[2.8rem] leading-[1.05] tracking-tighter sm:text-[4.2rem]">
							Email for{" "}
							<Link
								href="/features/ai-agents"
								className="relative bg-[length:6px_3px] bg-[radial-gradient(circle,_#a3a3a3_1px,_transparent_1.5px)] bg-bottom bg-repeat-x transition-all duration-300 hover:bg-[radial-gradient(circle,_var(--color-primary-base)_1px,_transparent_1.5px)] hover:text-primary-base dark:bg-[radial-gradient(circle,_#525252_1px,_transparent_1.5px)] dark:hover:bg-[radial-gradient(circle,_var(--color-primary-base)_1px,_transparent_1.5px)]"
							>
								AI Agents
							</Link>
							,{" "}
							<Link
								href="/developers"
								className="relative bg-[length:6px_3px] bg-[radial-gradient(circle,_#a3a3a3_1px,_transparent_1.5px)] bg-bottom bg-repeat-x transition-all duration-300 hover:bg-[radial-gradient(circle,_var(--color-primary-base)_1px,_transparent_1.5px)] hover:text-primary-base dark:bg-[radial-gradient(circle,_#525252_1px,_transparent_1.5px)] dark:hover:bg-[radial-gradient(circle,_var(--color-primary-base)_1px,_transparent_1.5px)]"
							>
								Developers
							</Link>{" "}
							&{" "}
							<Link
								href="/marketing-teams"
								className="relative bg-[length:6px_3px] bg-[radial-gradient(circle,_#a3a3a3_1px,_transparent_1.5px)] bg-bottom bg-repeat-x transition-all duration-300 hover:bg-[radial-gradient(circle,_var(--color-primary-base)_1px,_transparent_1.5px)] hover:text-primary-base dark:bg-[radial-gradient(circle,_#525252_1px,_transparent_1.5px)] dark:hover:bg-[radial-gradient(circle,_var(--color-primary-base)_1px,_transparent_1.5px)]"
							>
								Marketing teams
							</Link>
							.
						</h1>
						<p className="mx-auto mt-8 max-w-[620px] text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px]">
							High-performance, open-source email infrastructure—the same
							service as proprietary platforms. Use Reloop hosted or deploy it
							yourself.
						</p>

						<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
							<a
								href="/dashboard/login"
								className={`${Button.buttonVariants({
									variant: "neutral",
									mode: "filled",
								}).root()} h-11! rounded-full! px-8! font-semibold`}
							>
								Start for free
							</a>
							<a
								href="/docs"
								className={`${Button.buttonVariants({
									variant: "neutral",
									mode: "stroke",
								}).root()} h-11! rounded-full! px-8! font-semibold`}
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
