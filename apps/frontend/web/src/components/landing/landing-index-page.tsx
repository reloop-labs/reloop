import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import Link from "next/link";

export function LandingIndexPage({
	titleLines,
	description,
	items,
	cta,
}: {
	titleLines: string[];
	description: string;
	items: { title: string; description: string; href: string }[];
	cta: {
		title: string;
		titleMuted?: string;
		description: string;
		primary: { label: string; href: string };
		secondary?: { label: string; href: string };
	};
}) {
	return (
		<MarketingPageShell
			titleLines={titleLines}
			description={description}
			compactHero
		>
			<PageSection flushTop>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{items.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="group flex flex-col rounded-2xl border border-stroke-soft-200/80 bg-bg-weak-50/50 p-6 transition-all hover:border-stroke-soft-300 hover:bg-bg-soft-50 dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/15"
						>
							<h2 className="font-semibold text-[17px] text-text-strong-950 group-hover:text-primary-base dark:text-white">
								{item.title}
							</h2>
							<p className="mt-2 flex-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
								{item.description}
							</p>
							<span className="mt-4 font-semibold text-primary-base text-sm">
								Learn more →
							</span>
						</Link>
					))}
				</div>
			</PageSection>
			<FeatureCta {...cta} />
		</MarketingPageShell>
	);
}
