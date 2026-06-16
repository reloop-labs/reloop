import Link from "next/link";
import { languages } from "../languages";
import { LanguageIcon } from "./language-icon";

export default function LanguagesGrid() {
	return (
		<section id="languages">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="text-center">
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						Choose your stack
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-base text-text-sub-600 dark:text-white/50">
						Each SDK includes install guides, code samples, and links to
						framework-specific docs.
					</p>
				</div>

				<div className="mt-20 grid gap-px overflow-hidden rounded-4xl border border-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10">
					{languages.map((lang, i) => (
						<Link
							key={lang.slug}
							href={`/features/languages/${lang.slug}`}
							className="group flex flex-col border-stroke-soft-200 border-t border-l-0 bg-bg-weak-50 p-8 transition-colors duration-300 first:border-t-0 hover:bg-bg-soft-50 sm:border-t sm:border-l lg:border-t lg:border-l lg:p-10 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/[0.02] sm:[&:nth-child(-n+2)]:border-t-0 lg:[&:nth-child(-n+3)]:border-t-0 sm:[&:nth-child(2n+1)]:border-l-0 lg:[&:nth-child(3n)]:border-l lg:[&:nth-child(3n+1)]:border-l-0 lg:[&:nth-child(3n+2)]:border-l"
						>
							<span className="font-semibold text-sm text-text-soft-400 tabular-nums dark:text-white/28">
								{String(i + 1).padStart(2, "0")}
							</span>
							<div
								className="mt-4 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10"
								style={{ color: `#${lang.icon.hex}` }}
							>
								<LanguageIcon icon={lang.icon} className="size-5" />
							</div>
							<h3 className="mt-4 font-semibold text-lg text-text-strong-950 leading-snug group-hover:text-primary-base dark:text-white">
								{lang.name}
							</h3>
							<p className="mt-3 line-clamp-3 font-medium text-sm text-text-sub-600 leading-relaxed dark:text-white/50">
								{lang.shortDescription}
							</p>
							<code className="mt-4 block truncate rounded-lg border border-stroke-soft-200 bg-bg-soft-50 px-3 py-2 font-mono text-[11px] text-text-sub-600 dark:border-white/10">
								{lang.installCommand}
							</code>
							<span className="mt-4 font-semibold text-primary-base text-sm">
								View {lang.name} guide →
							</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
