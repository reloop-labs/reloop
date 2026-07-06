import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
	SectionHeading,
} from "@reloop/web/components/page-shell";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import { getGrosoryLinkCount, getGrosorySections } from "@reloop/web/lib/grosory-sections";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import Link from "next/link";

export const instant = false;

export const metadata = createLandingMetadata(
	"Grosory — Site Directory",
	"Browse every Reloop page: tools, use cases, alternatives, integrations, features, glossary, blog, and more.",
	"/grosory",
	[
		"Reloop sitemap",
		"site directory",
		"all Reloop pages",
		"email platform pages",
	],
);

export default function GrosoryPage() {
	const sections = getGrosorySections();
	const totalLinks = getGrosoryLinkCount();

	return (
		<MarketingPageShell
			titleLines={["Grosory"]}
			description={`A complete directory of every page on Reloop—${totalLinks} links across tools, use cases, integrations, features, and more.`}
			primaryCta={{ label: "Get started", href: "/get-started" }}
			secondaryCta={{ label: "Documentation", href: "/docs" }}
			compactHero
		>
			<PageSection flushTop narrow>
				<p className="mx-auto max-w-2xl text-center text-[15px] text-text-sub-600 leading-7 dark:text-white/50">
					Use this page to find any landing page, tool, guide, or feature on
					reloop.sh. New pages are added here automatically.
				</p>
			</PageSection>

			{sections.map((section, index) => (
				<PageSection key={section.title} alt={index % 2 === 1}>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<SectionHeading title={section.title} center={false} compact />
						{section.hub && (
							<Link
								href={section.hub.href}
								className="shrink-0 font-semibold text-primary-base text-sm hover:underline"
							>
								{section.hub.title} →
							</Link>
						)}
					</div>
					<ul className="mt-8 columns-1 gap-x-10 sm:columns-2 lg:columns-3">
						{section.links.map((link) => (
							<li key={link.href} className="mb-3 break-inside-avoid">
								<Link
									href={link.href}
									className="text-[15px] text-text-sub-600 leading-snug transition-colors hover:text-primary-base dark:text-white/60"
								>
									{link.title}
								</Link>
							</li>
						))}
					</ul>
				</PageSection>
			))}

			<FeatureCta
				{...defaultLandingCta(
					"Ready to send email?",
					"Pick any page above—or start with a free account.",
				)}
			/>
		</MarketingPageShell>
	);
}
