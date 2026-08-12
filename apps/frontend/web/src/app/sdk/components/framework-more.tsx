import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { type FrameworkDefinition, frameworks } from "../frameworks";
import {
	getBrandColorStyle,
	isDarkBrandColor,
	LanguageIcon,
} from "./language-icon";
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
							href="/frameworks"
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
						{others.map((fw) => {
							const isDark = isDarkBrandColor(fw.icon.hex);
							return (
								<Link
									key={fw.slug}
									href={`/frameworks/${fw.slug}`}
									className="group flex flex-col items-start gap-2 bg-bg-white-0 p-4 transition-colors hover:bg-bg-weak-50 sm:p-5 dark:bg-black dark:hover:bg-white/[0.04]"
								>
									<div className="flex w-full items-start justify-between gap-2">
										<span
											className={cn(
												"inline-flex size-8 items-center justify-center rounded-[10px] border border-stroke-soft-200 dark:border-white/10",
												isDark && "text-text-strong-950 dark:text-white",
											)}
											style={getBrandColorStyle(fw.icon.hex)}
										>
											<LanguageIcon icon={fw.icon} className="size-4" />
										</span>
										<Icon
											name="arrow-right"
											className="size-3.5 text-text-sub-600 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-text-strong-950 group-hover:opacity-100 dark:text-white/40 dark:group-hover:text-white"
											aria-hidden
										/>
									</div>
									<span className="pl-0.5 font-medium text-[13px] text-text-strong-950 dark:text-white">
										{fw.name}
									</span>
								</Link>
							);
						})}
					</div>
				</AlignedIconBand>
			</div>
		</section>
	);
}
