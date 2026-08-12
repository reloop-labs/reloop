"use client";

import * as Button from "@reloop/ui/button";

export default function IndexHero() {
	return (
		<section className="relative flex flex-col items-center justify-center pt-32 pb-16 sm:pt-40 sm:pb-24">
			<div className="mx-auto flex max-w-4xl flex-col px-4 text-center sm:px-6 lg:px-8">
				{/* Vercel Masthead / Meta Badge */}
				<div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-3.5 py-1 font-mono text-text-sub-600 text-xs dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70">
					<span className="size-1.5 rounded-full bg-emerald-500" />
					<span>OFFICIAL SDK INDEX • 9 RUNTIMES SUPPORTED</span>
				</div>

				{/* Primary Claim Title */}
				<h1 className="font-sans font-bold text-4xl text-text-strong-950 leading-[1.08] tracking-tight sm:text-6xl dark:text-white">
					Send email in your native runtime.
				</h1>

				{/* Subheadline / Orientation */}
				<p className="mx-auto mt-6 max-w-2xl text-base text-text-sub-600 leading-relaxed sm:text-lg dark:text-white/60">
					Official Reloop SDKs for Node.js, Python, Go, Rust, PHP, Ruby, Elixir, Java, and .NET. Fully typed, zero unnecessary runtime overhead, and pre-configured for modern serverless and cloud environments.
				</p>

				{/* Actions */}
				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					<a
						href="/dashboard/signup"
						className={`${Button.buttonVariants({
							variant: "neutral",
							mode: "filled",
						}).root()} h-11! rounded-full! px-7! font-medium text-sm`}
					>
						Get API Key
					</a>
					<a
						href="#sdk-explorer"
						className={`${Button.buttonVariants({
							variant: "neutral",
							mode: "stroke",
						}).root()} h-11! rounded-full! px-7! font-medium text-sm`}
					>
						Explore SDKs &rarr;
					</a>
				</div>

				{/* Stat Strip (Vercel primitive .vbg-stat-strip concept) */}
				<div className="mt-14 grid grid-cols-3 divide-x divide-stroke-soft-200 border-stroke-soft-200 border-y py-6 dark:divide-white/10 dark:border-white/10">
					<div className="flex flex-col items-center px-2">
						<span className="font-mono font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl tabular-nums dark:text-white">
							09
						</span>
						<span className="mt-1 text-text-sub-600 text-xs dark:text-white/50">
							Official Runtimes
						</span>
					</div>
					<div className="flex flex-col items-center px-2">
						<span className="font-mono font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl tabular-nums dark:text-white">
							100%
						</span>
						<span className="mt-1 text-text-sub-600 text-xs dark:text-white/50">
							Type Coverage
						</span>
					</div>
					<div className="flex flex-col items-center px-2">
						<span className="font-mono font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl tabular-nums dark:text-white">
							&lt;50ms
						</span>
						<span className="mt-1 text-text-sub-600 text-xs dark:text-white/50">
							p99 Delivery Latency
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
