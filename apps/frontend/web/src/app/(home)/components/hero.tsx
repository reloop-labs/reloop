"use client";

import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { AnimatedAlternative } from "./animated-alternative";
export default function Hero() {
	return (
		<div className="relative flex h-[calc(100dvh-100px)] items-center justify-center overflow-hidden bg-[#05070b] text-white">
			<main className="relative z-10">
				<section
					id="product"
					className="mx-auto flex max-w-4xl flex-col px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24"
				>
					<div className="mx-auto max-w-[1020px] text-center">
						<div className="mb-10 flex items-center justify-center">
							<AnimatedAlternative />
						</div>
						<h1 className="font-semibold text-[2.8rem] text-white leading-[1.05] tracking-tighter drop-shadow-[0_10px_34px_rgba(0,0,0,0.32)] sm:text-[4.2rem]">
							Email for AI Agents, Developers &{" "}
							<span className="text-white/40">Marketing teams.</span>
						</h1>
						<p className="mx-auto mt-8 max-w-[620px] text-[15px] text-white/50 leading-relaxed sm:text-[17px]">
							High-performance, open-source email infrastructure for AI agents
							and developers. Built for absolute control and scale.
						</p>

						<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
							<a
								href="/dashboard/login"
								className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-[#0a0d12] text-[14px] transition-colors hover:bg-white/92"
							>
								Start for free
							</a>
							<a
								href="/docs"
								className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-white/18 bg-black/16 px-8 font-semibold text-[15px] text-white backdrop-blur-sm transition-colors hover:bg-black/24"
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
