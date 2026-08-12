import Link from "next/link";
import { frameworks } from "../frameworks";
import { LanguageIcon } from "./language-icon";

export default function FrameworksGrid() {
	return (
		<section
			id="frameworks"
			className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white"
		>
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<div className="border-stroke-soft-200 border-b px-6 py-10 sm:px-10 sm:py-12 lg:px-12 dark:border-white/10">
					<p className="font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/45">
						Framework integrations
					</p>
					<h2 className="mt-2 font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						Send email from your stack.
					</h2>
					<p className="mt-1.5 max-w-xl text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						Copy-paste guides for Next.js, Django, Laravel, Rails, Spring Boot,
						and more—built on the official SDKs.
					</p>
				</div>

				{/* Two rows of compact framework chips (name only — no language) */}
				<div className="grid grid-cols-3 gap-px bg-stroke-soft-200 sm:grid-cols-5 lg:grid-cols-7 dark:bg-white/10">
					{frameworks.map((fw) => (
						<Link
							key={fw.slug}
							href={`/frameworks/${fw.slug}`}
							className="group flex flex-col items-start gap-3 bg-bg-white-0 p-5 transition-colors hover:bg-bg-weak-50 sm:p-6 dark:bg-black dark:hover:bg-white/[0.03]"
						>
							<span
								className="inline-flex size-8 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.04]"
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
