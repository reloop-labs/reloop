import Link from "next/link";
import type { LanguageDefinition } from "../languages";

export default function LanguageCta({
	language,
}: {
	language: LanguageDefinition;
}) {
	return (
		<section
			id="cta"
			className="w-full border-stroke-soft-200 border-t py-20 lg:py-24 dark:border-white/10"
		>
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="mx-auto flex max-w-3xl flex-col items-center text-center">
					<span className="font-mono text-text-sub-600 text-xs uppercase tracking-wider dark:text-white/50">
						Ready for Production • {language.name}
					</span>
					<h2 className="mt-4 font-bold font-sans text-3xl text-text-strong-950 tracking-tight sm:text-4xl dark:text-white">
						Start sending with {language.name} today.
					</h2>
					<p className="mt-4 max-w-xl text-base text-text-sub-600 leading-relaxed dark:text-white/60">
						Get your API key, configure domain DNS records, and build reliable
						email infrastructure with official {language.name} support.
					</p>

					<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
						<a
							href="/dashboard/signup"
							className="inline-flex h-11 items-center justify-center rounded-full bg-text-strong-950 px-7 font-medium text-sm text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black dark:hover:opacity-90"
						>
							Get API Key
						</a>
						<Link
							href={language.docsPath}
							className="inline-flex h-11 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-7 font-medium text-sm text-text-strong-950 transition-colors hover:bg-bg-soft-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
						>
							{language.name} Documentation &rarr;
						</Link>
					</div>

					<div className="mt-10">
						<Link
							href="/languages"
							className="font-mono text-text-sub-600 text-xs transition-colors hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
						>
							&larr; View all supported languages &amp; runtimes
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
