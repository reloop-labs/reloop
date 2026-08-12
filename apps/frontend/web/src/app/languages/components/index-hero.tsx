import * as Button from "@reloop/ui/button";
import Link from "next/link";

export default function IndexHero() {
	return (
		<section className="relative w-full border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/[0.04] via-sky-400/[0.02] to-transparent dark:from-blue-500/[0.08] dark:via-transparent" />

			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-200 border-x px-6 pt-28 pb-12 text-left sm:px-10 sm:pt-32 sm:pb-14 md:max-w-7xl lg:px-12 dark:border-white/10">
				<p className="font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/45">
					Official SDKs
				</p>
				<h1 className="mt-3 max-w-2xl font-semibold text-3xl text-text-strong-950 leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.6rem] dark:text-white">
					Send email in your language.
				</h1>
				<p className="mt-4 max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/60">
					Framework guides for Next.js, Django, Laravel, and more—plus official
					SDKs for Node.js, Python, Go, Rust, PHP, Ruby, Elixir, Java, and .NET.
				</p>

				<div className="mt-8 flex flex-wrap items-center gap-3">
					<a
						href="/dashboard/signup"
						className={`${Button.buttonVariants({
							variant: "neutral",
							mode: "filled",
						}).root()} inline-flex h-10! rounded-full! px-6! font-medium text-sm! dark:bg-white dark:text-black dark:hover:bg-white/90`}
					>
						Get API Key
					</a>
					<Link
						href="#frameworks"
						className={`${Button.buttonVariants({
							variant: "neutral",
							mode: "stroke",
						}).root()} inline-flex h-10! rounded-full! px-6! font-medium text-sm!`}
					>
						Browse frameworks →
					</Link>
				</div>
			</div>
		</section>
	);
}
