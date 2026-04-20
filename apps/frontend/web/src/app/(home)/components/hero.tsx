"use client";

import { Icon } from "@reloop/ui/icon";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
	return (
		<div className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">
			{/* Backdrop Image */}
			<div className="pointer-events-none absolute inset-0">
				<Image
					src="/images/landing-bg.jpg"
					alt=""
					fill
					className="object-cover object-center"
					priority
				/>
			</div>

			<main className="relative z-10">
				<section
					id="product"
					className="mx-auto flex max-w-[1320px] flex-col items-center justify-center px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8 lg:pt-40 lg:pb-24"
				>
					<div className="mx-auto max-w-[1120px] text-center">
						<h1 className="font-semibold text-[3.65rem] text-white leading-[0.93] tracking-tighter drop-shadow-[0_10px_34px_rgba(0,0,0,0.32)] sm:text-[4.85rem] lg:text-[6.4rem]">
							The core of your
							<br />
							mail infrastructure.
						</h1>

						<p className="mx-auto mt-8 max-w-[820px] text-[15px] text-white/70 leading-7 sm:text-[17px]">
							Send, verify, and automate emails with sub-900ms latency. Open
							source, reliable, and built to scale for modern developer teams.
						</p>

						<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
							<Link
								href="/login"
								className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-white px-5 py-3 font-semibold text-[#0a0d12] text-[14px] transition-colors hover:bg-white/92"
							>
								Start for free
							</Link>
							<a
								href="https://github.com/reloop-labs/reloop"
								target="_blank"
								rel="noreferrer"
								className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-white/18 bg-black/16 px-8 font-semibold text-[15px] text-white backdrop-blur-sm transition-colors hover:bg-black/24"
							>
								<Icon name="social-github" className="size-4" />
								View on GitHub
							</a>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
