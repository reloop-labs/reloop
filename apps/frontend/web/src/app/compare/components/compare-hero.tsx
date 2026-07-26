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
		<div className="relative overflow-hidden bg-transparent pt-20 sm:pt-24">
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<CompareStage>
					{icon ? (
						<div className="mb-8 sm:mb-10">
							<CompareHeroIcons icon={icon} />
						</div>
					) : null}

					<h1 className="font-serif text-[2.4rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.6rem] dark:text-white">
						{titleLines.map((line, i) => (
							<span key={line}>
								{line}
								{i < titleLines.length - 1 && <br />}
							</span>
						))}
					</h1>

					{description ? (
						<p className="mx-auto mt-7 max-w-[620px] text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
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
				</CompareStage>
			</div>
		</div>
	);
}
