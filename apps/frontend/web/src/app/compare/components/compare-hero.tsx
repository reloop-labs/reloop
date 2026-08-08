"use client";

import { HeroCtaLink } from "@reloop/web/components/landing/hero";
import type { FeatureCtaLink } from "@reloop/web/components/landing/types";
import type { SimpleIcon } from "simple-icons";
import { CompareHeroIcons } from "./compare-hero-icons";
import { CompareStage } from "./compare-stage";

/**
 * Compare top fold: brand tiles + title + description + CTAs
 * framed in the soft stage card. Rails intentionally start below this.
 */
export function CompareHero({
	titleLines,
	description,
	primaryCta,
	secondaryCta,
	icon,
}: {
	titleLines: string[];
	description?: string;
	primaryCta?: FeatureCtaLink;
	secondaryCta?: FeatureCtaLink;
	icon?: Pick<SimpleIcon, "hex" | "path">;
}) {
	return (
		<div className="relative overflow-hidden border-stroke-soft-200 border-b bg-transparent px-0 pt-20 sm:pt-24 dark:border-white/10">
			{/* Stage fills the frame; text/icons stay readable via their own max-widths */}
			<CompareStage>
				{icon ? (
					<div className="mb-8 sm:mb-10">
						<CompareHeroIcons icon={icon} />
					</div>
				) : null}

				<div className="mx-auto w-full max-w-3xl">
					<h1 className="font-semibold text-3xl text-text-strong-950 leading-[110%] tracking-[-0.8px] sm:text-[40px] dark:text-white">
						{titleLines.map((line, i) => (
							<span key={line}>
								{line}
								{i < titleLines.length - 1 && <br />}
							</span>
						))}
					</h1>

					{description ? (
						<p className="mx-auto mt-7 max-w-[620px] text-balance font-medium text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
							{description}
						</p>
					) : null}

					{primaryCta ? (
						<div className="mt-7 flex flex-wrap items-center justify-center gap-4">
							<HeroCtaLink
								href={primaryCta.href}
								label={primaryCta.label}
								external={primaryCta.external}
								variant="primary"
							/>
							{secondaryCta ? (
								<HeroCtaLink
									href={secondaryCta.href}
									label={secondaryCta.label}
									external={secondaryCta.external}
									variant="secondary"
								/>
							) : null}
						</div>
					) : null}
				</div>
			</CompareStage>
		</div>
	);
}
