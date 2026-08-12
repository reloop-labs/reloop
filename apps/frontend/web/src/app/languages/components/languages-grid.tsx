import Link from "next/link";
import { languages } from "../languages";
import { LanguageIcon } from "./language-icon";

export default function LanguagesGrid() {
	return (
		<section id="languages" className="w-full py-16 sm:py-20 lg:py-24">
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col gap-2">
					<p className="font-mono text-text-sub-600 text-xs uppercase tracking-wider dark:text-white/50">
						SDK Directory • 9 Packages
					</p>
					<h2 className="font-sans font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl dark:text-white">
						Select your language guide
					</h2>
					<p className="max-w-2xl text-base text-text-sub-600 leading-relaxed dark:text-white/60">
						Each official repository includes complete installation
						instructions, authentication patterns, error handling, and framework
						integration quickstarts.
					</p>
				</div>

				<div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-stroke-soft-200 bg-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10 dark:bg-white/10">
					{languages.map((lang, i) => (
						<Link
							key={lang.slug}
							href={`/languages/${lang.slug}`}
							className="group flex flex-col justify-between bg-bg-white-0 p-6 transition-colors duration-200 hover:bg-bg-weak-50 dark:bg-bg-black-950 dark:hover:bg-white/[0.02]"
						>
							<div>
								<div className="flex items-center justify-between">
									<div
										className="inline-flex size-9 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50 transition-transform group-hover:scale-105 dark:border-white/10 dark:bg-white/5"
										style={{ color: `#${lang.icon.hex}` }}
									>
										<LanguageIcon icon={lang.icon} className="size-4" />
									</div>
									<span className="font-mono text-text-sub-600 text-xs tabular-nums dark:text-white/40">
										0{i + 1}
									</span>
								</div>

								<h3 className="mt-4 font-semibold text-base text-text-strong-950 transition-colors group-hover:text-primary-base dark:text-white">
									{lang.name}
								</h3>

								<p className="mt-2 line-clamp-3 text-text-sub-600 text-xs leading-relaxed dark:text-white/60">
									{lang.shortDescription}
								</p>

								{/* Framework highlights */}
								<div className="mt-4 flex flex-wrap gap-1.5">
									{lang.highlights.map((h) => (
										<span
											key={h}
											className="rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-2 py-0.5 font-mono text-[11px] text-text-sub-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60"
										>
											{h}
										</span>
									))}
								</div>
							</div>

							<div className="mt-6 border-stroke-soft-200 border-t pt-4 dark:border-white/10">
								<code className="block truncate font-mono text-[11px] text-text-sub-600 dark:text-white/50">
									{lang.installCommand}
								</code>
								<span className="mt-2 inline-flex items-center gap-1 font-medium text-primary-base text-xs transition-opacity group-hover:opacity-80">
									View {lang.name} SDK guide &rarr;
								</span>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
