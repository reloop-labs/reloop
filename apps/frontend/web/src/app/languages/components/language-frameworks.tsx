import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { frameworksForLanguage } from "../frameworks";
import type { LanguageDefinition } from "../languages";
import { LanguageIcon } from "./language-icon";

export default function LanguageFrameworks({
	language,
}: {
	language: LanguageDefinition;
}) {
	const related = frameworksForLanguage(language.slug);
	if (related.length === 0) return null;

	return (
		<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<div className="border-stroke-soft-200 border-b px-6 py-10 sm:px-10 sm:py-12 lg:px-12 dark:border-white/10">
					<p className="font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/45">
						{language.name} frameworks
					</p>
					<h2 className="mt-2 font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl dark:text-white">
						Popular {language.name} integrations
					</h2>
					<p className="mt-1.5 max-w-xl text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						Framework-specific examples using the official {language.name} SDK.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-px bg-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:bg-white/10">
					{related.map((fw) => (
						<Link
							key={fw.slug}
							href={`/frameworks/${fw.slug}`}
							className="group flex flex-col gap-3 bg-bg-white-0 p-6 transition-colors duration-150 hover:bg-bg-weak-50 sm:p-8 dark:bg-black dark:hover:bg-white/[0.03]"
						>
							<div className="flex items-start justify-between gap-3">
								<div
									className="inline-flex size-9 items-center justify-center rounded-xl border border-stroke-soft-200 dark:border-white/10"
									style={{ color: `#${fw.icon.hex}` }}
								>
									<LanguageIcon icon={fw.icon} className="size-4" />
								</div>
								<Icon
									name="arrow-up-right"
									className="size-3.5 text-text-sub-600 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 dark:text-white/50"
									aria-hidden
								/>
							</div>
							<div>
								<h3 className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
									{fw.name}
								</h3>
								<p className="mt-1.5 line-clamp-2 text-[13px] text-text-sub-600 dark:text-white/55">
									{fw.shortDescription}
								</p>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
