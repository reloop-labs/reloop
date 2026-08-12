import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { frameworks } from "../frameworks";
import { LanguageIcon } from "./language-icon";

export default function FrameworksGrid() {
	return (
		<section
			id="frameworks"
			className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white"
		>
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<div className="border-stroke-soft-200 border-b px-6 py-10 sm:px-10 sm:py-12 lg:px-12 dark:border-white/10">
					<p className="font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/45">
						Framework integrations
					</p>
					<h2 className="mt-2 font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						Send email from your stack.
					</h2>
					<p className="mt-1.5 max-w-xl text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						Copy-paste guides for Next.js, Django, Laravel, Rails, Spring Boot,
						and more—built on the official SDKs.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-px bg-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:bg-white/10">
					{frameworks.map((fw) => (
						<article key={fw.slug} className="contents">
							<Link
								href={`/frameworks/${fw.slug}`}
								className="group flex flex-col gap-4 bg-bg-white-0 p-6 transition-colors duration-150 hover:bg-bg-weak-50 sm:p-8 dark:bg-black dark:hover:bg-white/[0.03]"
							>
								<div className="flex items-start justify-between gap-3">
									<div
										className="inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.04]"
										style={{ color: `#${fw.icon.hex}` }}
									>
										<LanguageIcon icon={fw.icon} className="size-5" />
									</div>
									<Icon
										name="arrow-up-right"
										className="size-3.5 text-text-sub-600 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 dark:text-white/50"
										aria-hidden
									/>
								</div>

								<div>
									<h3 className="font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-base dark:text-white">
										{fw.name} email
									</h3>
									<p className="mt-1 text-[11px] text-text-sub-600 dark:text-white/45">
										<span className="font-mono">{fw.languageName}</span>
										<span className="mx-1.5 text-text-soft-400">·</span>
										{fw.runtimeHint}
									</p>
									<p className="mt-2.5 line-clamp-3 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/55">
										{fw.shortDescription}
									</p>
								</div>

								<div className="mt-auto flex flex-wrap gap-1.5">
									{fw.highlights.slice(0, 3).map((tag) => (
										<span
											key={tag}
											className="rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-2 py-0.5 font-mono text-[10px] text-text-sub-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/50"
										>
											{tag}
										</span>
									))}
								</div>
							</Link>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
