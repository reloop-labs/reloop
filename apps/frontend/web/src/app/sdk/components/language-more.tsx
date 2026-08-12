import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { type LanguageDefinition, languages } from "../languages";
import { LanguageIcon } from "./language-icon";
import { SectionTitle } from "./section-title";

export default function LanguageMore({
	current,
}: {
	current: LanguageDefinition;
}) {
	const others = languages.filter((l) => l.slug !== current.slug);

	return (
		<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<SectionTitle
					title="Other runtimes"
					icon="terminal"
					action={
						<Link
							href="/sdks"
							className="hidden items-center gap-1 font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 sm:inline-flex dark:text-white/50 dark:hover:text-white"
						>
							View all
							<Icon name="arrow-right" className="size-3.5" aria-hidden />
						</Link>
					}
				/>

				<div className="flex gap-0 overflow-x-auto">
					{others.map((lang, i) => (
						<Link
							key={lang.slug}
							href={`/sdks/${lang.slug}`}
							className={[
								"group flex min-w-[140px] flex-1 flex-col items-start gap-2 p-4 transition-colors hover:bg-bg-weak-50 sm:min-w-0 sm:p-5 dark:hover:bg-white/[0.03]",
								i < others.length - 1
									? "border-stroke-soft-200 border-r dark:border-white/10"
									: "",
							]
								.filter(Boolean)
								.join(" ")}
						>
							<span
								className="inline-flex size-8 items-center justify-center rounded-lg border border-stroke-soft-200 dark:border-white/10"
								style={{ color: `#${lang.icon.hex}` }}
							>
								<LanguageIcon icon={lang.icon} className="size-4" />
							</span>
							<span className="font-medium text-[13px] text-text-strong-950 dark:text-white">
								{lang.name}
							</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
