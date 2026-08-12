import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { frameworks, type FrameworkDefinition } from "../frameworks";
import { LanguageIcon } from "./language-icon";
import { AlignedIconBand } from "./section-frame";
import { SectionTitle } from "./section-title";

export default function FrameworkMore({
	current,
}: {
	current: FrameworkDefinition;
}) {
	const others = frameworks.filter((f) => f.slug !== current.slug);

	return (
		<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<SectionTitle
					title="Other frameworks"
					icon="grid"
					action={
						<Link
							href="/languages#frameworks"
							className="hidden items-center gap-1 font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 sm:inline-flex dark:text-white/50 dark:hover:text-white"
						>
							View all
							<Icon name="arrow-right" className="size-3.5" aria-hidden />
						</Link>
					}
				/>

				{/* Hatched side gutters align icons with title padding */}
				<AlignedIconBand>
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
				</AlignedIconBand>
			</div>
		</section>
	);
}
