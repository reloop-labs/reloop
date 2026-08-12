import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { frameworksForLanguage } from "../frameworks";
import type { LanguageDefinition } from "../languages";
import {
	getBrandColorStyle,
	isDarkBrandColor,
	LanguageIcon,
} from "./language-icon";
import { SectionTitle } from "./section-title";

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
				<SectionTitle
					title={`Popular ${language.name} integrations`}
					icon="code"
				/>

				<div className="grid grid-cols-1 gap-px bg-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:bg-white/10">
					{related.map((fw) => {
						const isDark = isDarkBrandColor(fw.icon.hex);
						return (
							<Link
								key={fw.slug}
								href={`/frameworks/${fw.slug}`}
								className="group flex flex-col gap-3 bg-bg-white-0 p-6 transition-colors duration-150 hover:bg-bg-weak-50 sm:p-8 dark:bg-black dark:hover:bg-white/[0.04]"
							>
								<div className="flex items-start justify-between gap-3">
									<div
										className={cn(
											"inline-flex size-9 items-center justify-center rounded-xl border border-stroke-soft-200 dark:border-white/10",
											isDark && "text-text-strong-950 dark:text-white",
										)}
										style={getBrandColorStyle(fw.icon.hex)}
									>
										<LanguageIcon icon={fw.icon} className="size-4" />
									</div>
									<Icon
										name="arrow-right"
										className="size-3.5 text-text-sub-600 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-text-strong-950 group-hover:opacity-100 dark:text-white/40 dark:group-hover:text-white"
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
						);
					})}
				</div>
			</div>
		</section>
	);
}
