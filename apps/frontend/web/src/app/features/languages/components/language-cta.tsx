import Link from "next/link";
import type { LanguageDefinition } from "../languages";

export default function LanguageCta({
	language,
}: {
	language: LanguageDefinition;
}) {
	return (
		<section id="cta">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="mx-auto max-w-[920px] text-center">
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						Start sending with {language.name}
					</h2>
					<p className="mx-auto mt-8 max-w-[550px] font-medium text-[#0a0d12]/60 text-[15px] leading-7 dark:text-white/60">
						Get your API key and explore framework-specific tutorials in our
						documentation.
					</p>

					<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
						<Link
							href="/dashboard/signup"
							className="inline-flex h-12 items-center justify-center rounded-full bg-[#0a0d12] px-8 font-semibold text-[15px] text-white transition-colors hover:bg-[#0a0d12]/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
						>
							Get started
						</Link>
						<Link
							href={language.docsPath}
							className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-[#0a0d12]/10 px-8 font-semibold text-[#0a0d12] text-[15px] transition-colors hover:bg-[#0a0d12]/10 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
						>
							{language.name} documentation
						</Link>
					</div>

					<p className="mt-8 text-sm text-text-sub-600 dark:text-white/50">
						<Link
							href="/features/languages"
							className="text-primary-base hover:underline"
						>
							← All languages
						</Link>
					</p>
				</div>
			</div>
		</section>
	);
}
