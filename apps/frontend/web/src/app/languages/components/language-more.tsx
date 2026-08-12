import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { languages, type LanguageDefinition } from "../languages";
import { LanguageIcon } from "./language-icon";

export default function LanguageMore({
	current,
}: {
	current: LanguageDefinition;
}) {
	const others = languages.filter((l) => l.slug !== current.slug);

	return (
		<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<div className="flex items-end justify-between gap-4 border-stroke-soft-200 border-b px-6 py-10 sm:px-10 sm:py-12 lg:px-12 dark:border-white/10">
					<div>
						<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl dark:text-white">
							Other runtimes
						</h2>
						<p className="mt-1 text-[13.5px] text-text-sub-600 dark:text-white/55">
							Same API, native clients.
						</p>
					</div>
					<Link
						href="/languages"
						className="hidden shrink-0 items-center gap-1 font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 sm:inline-flex dark:text-white/50 dark:hover:text-white"
					>
						View all
						<Icon name="arrow-right" className="size-3.5" aria-hidden />
					</Link>
				</div>

				<div className="flex gap-0 overflow-x-auto">
					{others.map((lang, i) => (
						<Link
							key={lang.slug}
							href={`/languages/${lang.slug}`}
							className={[
								"group flex min-w-[140px] flex-1 flex-col items-start gap-3 p-5 transition-colors hover:bg-bg-weak-50 sm:min-w-0 sm:p-6 dark:hover:bg-white/[0.03]",
								i < others.length - 1
									? "border-stroke-soft-200 border-r dark:border-white/10"
									: "",
							]
								.filter(Boolean)
								.join(" ")}
						>
							<span
								className="inline-flex size-8 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.04]"
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
