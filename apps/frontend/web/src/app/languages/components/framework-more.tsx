import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { frameworks, type FrameworkDefinition } from "../frameworks";
import { LanguageIcon } from "./language-icon";

export default function FrameworkMore({
	current,
}: {
	current: FrameworkDefinition;
}) {
	const others = frameworks.filter((f) => f.slug !== current.slug);

	return (
		<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<div className="flex items-end justify-between gap-4 border-stroke-soft-200 border-b px-6 py-10 sm:px-10 sm:py-12 lg:px-12 dark:border-white/10">
					<div>
						<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl dark:text-white">
							Other frameworks
						</h2>
						<p className="mt-1 text-[13.5px] text-text-sub-600 dark:text-white/55">
							Same API, framework-specific examples.
						</p>
					</div>
					<Link
						href="/languages#frameworks"
						className="hidden shrink-0 items-center gap-1 font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 sm:inline-flex dark:text-white/50 dark:hover:text-white"
					>
						View all
						<Icon name="arrow-right" className="size-3.5" aria-hidden />
					</Link>
				</div>

				{/* Two rows — name only, no language */}
				<div className="grid grid-cols-3 gap-px bg-stroke-soft-200 sm:grid-cols-5 lg:grid-cols-6 dark:bg-white/10">
					{others.map((fw) => (
						<Link
							key={fw.slug}
							href={`/frameworks/${fw.slug}`}
							className="group flex flex-col items-start gap-3 bg-bg-white-0 p-5 transition-colors hover:bg-bg-weak-50 sm:p-6 dark:bg-black dark:hover:bg-white/[0.03]"
						>
							<span
								className="inline-flex size-8 items-center justify-center rounded-lg border border-stroke-soft-200 dark:border-white/10"
								style={{ color: `#${fw.icon.hex}` }}
							>
								<LanguageIcon icon={fw.icon} className="size-4" />
							</span>
							<span className="font-medium text-[13px] text-text-strong-950 dark:text-white">
								{fw.name}
							</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
