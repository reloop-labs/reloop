import Link from "next/link";
import { frameworks } from "../frameworks";
import { LanguageIcon } from "./language-icon";
import { AlignedIconBand, SectionFrame } from "./section-frame";
import { SectionTitle } from "./section-title";

export default function FrameworksGrid() {
	return (
		<SectionFrame id="frameworks">
			<SectionTitle title="Send email from your stack." icon="code" />

			{/* Hatched side gutters align icon columns with the title padding above */}
			<AlignedIconBand>
				<div className="grid grid-cols-3 gap-px bg-stroke-soft-200 sm:grid-cols-5 lg:grid-cols-7 dark:bg-white/10">
					{frameworks.map((fw) => (
						<Link
							key={fw.slug}
							href={`/frameworks/${fw.slug}`}
							className="group flex flex-col items-start gap-2 bg-bg-white-0 p-4 transition-colors hover:bg-bg-weak-50 sm:p-5 dark:bg-black dark:hover:bg-white/[0.03]"
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
		</SectionFrame>
	);
}
