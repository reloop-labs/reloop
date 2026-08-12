import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { frameworks } from "../frameworks";
import {
	getBrandColorStyle,
	isDarkBrandColor,
	LanguageIcon,
} from "./language-icon";
import { AlignedIconBand, SectionFrame } from "./section-frame";
import { SectionTitle } from "./section-title";

export default function FrameworksGrid() {
	return (
		<SectionFrame id="frameworks">
			<SectionTitle title="Send email from your stack." icon="code" />

			{/* Hatched side gutters align icon columns with the title padding above */}
			<AlignedIconBand>
				<div className="grid grid-cols-3 gap-px bg-stroke-soft-200 sm:grid-cols-5 lg:grid-cols-7 dark:bg-white/10">
					{frameworks.map((fw) => {
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
		</SectionFrame>
	);
}
