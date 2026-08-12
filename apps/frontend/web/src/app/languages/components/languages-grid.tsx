import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { languages } from "../languages";
import { LanguageIcon } from "./language-icon";

export default function LanguagesGrid() {
	return (
		<section
			id="sdk-guides"
			className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white"
		>
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<div className="border-stroke-soft-200 border-b px-6 py-10 sm:px-10 sm:py-12 lg:px-12 dark:border-white/10">
					<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						SDK guides
					</h2>
					<p className="mt-1.5 max-w-xl text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						Dedicated pages for each official client—install, sample code, and
						docs.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-px bg-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:bg-white/10">
					{languages.map((lang) => (
						<article key={lang.slug} className="contents">
							<Link
								href={`/languages/${lang.slug}`}
								className="group flex flex-col gap-4 bg-bg-white-0 p-6 transition-colors duration-150 hover:bg-bg-weak-50 sm:p-8 dark:bg-black dark:hover:bg-white/[0.03]"
							>
								<div className="flex items-start justify-between gap-3">
									<div
										className="inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.04]"
										style={{ color: `#${lang.icon.hex}` }}
									>
										<LanguageIcon icon={lang.icon} className="size-5" />
									</div>
									<Icon
										name="arrow-up-right"
										className="size-3.5 text-text-sub-600 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 dark:text-white/50"
										aria-hidden
									/>
								</div>

								<div>
									<h3 className="font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-base dark:text-white">
										{lang.name} email SDK
									</h3>
									<p className="mt-1 font-mono text-[11px] text-text-sub-600 dark:text-white/45">
										{lang.packageName}
									</p>
									<p className="mt-2.5 line-clamp-3 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/55">
										{lang.shortDescription}
									</p>
									<p className="mt-2 text-[12px] text-text-sub-600 dark:text-white/40">
										{lang.primaryFramework}
									</p>
								</div>

								<code className="mt-auto block truncate rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-2.5 py-1.5 font-mono text-[11px] text-text-sub-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/50">
									{lang.installCommand}
								</code>
							</Link>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
