import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { languages } from "../languages";
import {
	getBrandColorStyle,
	isDarkBrandColor,
	LanguageIcon,
} from "./language-icon";
import { AlignedIconBand, SectionFrame } from "./section-frame";
import { SectionTitle } from "./section-title";

export default function LanguagesGrid() {
	return (
		<SectionFrame id="sdk-guides">
			<SectionTitle title="SDK guides" icon="box" />

			{/* Hatched side gutters align icon columns with the title padding above */}
			<AlignedIconBand>
				<div className="grid grid-cols-1 gap-px bg-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:bg-white/10">
					{languages.map((lang) => {
						const isDark = isDarkBrandColor(lang.icon.hex);
						return (
							<Link
								key={lang.slug}
								href={`/sdk/${lang.slug}`}
								className="group flex flex-col items-start gap-2 bg-white p-4 transition-colors duration-200 hover:bg-[#f7f7f7] sm:p-5 dark:bg-black dark:hover:!bg-[#0A0A0A]"
							>
								<div className="flex w-full items-start justify-between gap-2">
									<span
										className={cn(
											"inline-flex size-8 items-center justify-center rounded-[10px] border border-stroke-soft-200 dark:border-white/10",
											isDark && "text-text-strong-950 dark:text-white",
										)}
										style={getBrandColorStyle(lang.icon.hex)}
									>
										<LanguageIcon icon={lang.icon} className="size-4" />
									</span>
									<Icon
										name="arrow-right"
										className="size-3.5 text-text-sub-600 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-text-strong-950 group-hover:opacity-100 dark:text-white/40 dark:group-hover:text-white"
										aria-hidden
									/>
								</div>
								<div className="flex w-full min-w-0 flex-col gap-1">
									<span className="pl-0.5 font-medium text-[13px] text-text-strong-950 dark:text-white">
										{lang.name}
									</span>
									<code className="block w-full truncate pl-0.5 font-medium font-mono text-[11px] text-text-sub-600 dark:text-white/45">
										{lang.installCommand}
									</code>
								</div>
							</Link>
						);
					})}
				</div>
			</AlignedIconBand>
		</SectionFrame>
	);
}
