import Link from "next/link";
import { languages } from "../languages";
import { LanguageIcon } from "./language-icon";
import { AlignedIconBand, SectionFrame } from "./section-frame";
import { SectionTitle } from "./section-title";

export default function LanguagesGrid() {
	return (
		<SectionFrame id="sdk-guides">
			<SectionTitle title="SDK guides" icon="box" />

			{/* Hatched side gutters align icon columns with the title padding above */}
			<AlignedIconBand>
				<div className="grid grid-cols-1 gap-px bg-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:bg-white/10">
					{languages.map((lang) => (
						<Link
							key={lang.slug}
							href={`/sdk/${lang.slug}`}
							className="group flex flex-col items-start gap-2 bg-bg-white-0 p-4 transition-colors hover:bg-bg-weak-50 sm:p-5 dark:bg-black dark:hover:bg-white/[0.03]"
						>
							<span
								className="inline-flex size-8 items-center justify-center rounded-lg border border-stroke-soft-200 dark:border-white/10"
								style={{ color: `#${lang.icon.hex}` }}
							>
								<LanguageIcon icon={lang.icon} className="size-4" />
							</span>
							<div className="flex w-full min-w-0 flex-col gap-1">
								<span className="font-medium text-[13px] text-text-strong-950 dark:text-white">
									{lang.name}
								</span>
								<code className="block w-full truncate font-medium font-mono text-[11px] text-text-sub-600 dark:text-white/45">
									{lang.installCommand}
								</code>
							</div>
						</Link>
					))}
				</div>
			</AlignedIconBand>
		</SectionFrame>
	);
}
