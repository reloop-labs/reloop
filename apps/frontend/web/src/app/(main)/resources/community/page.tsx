import {
	cardGridClass,
	FeatureCta,
	MarketingPageShell,
	metricsGridClass,
	PageSection,
	SectionHeading,
} from "@reloop/web/components/page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Community | Reloop",
	description:
		"Join the Reloop community on Discord, GitHub, and social channels. Connect with developers building open-source email infrastructure.",
	openGraph: {
		title: "Community | Reloop",
		description:
			"Join the Reloop community on Discord, GitHub, and social channels.",
		type: "website",
	},
};

const platforms = [
	{
		title: "Discord Community",
		description:
			"Real-time discussions, support, and community events. Get help from the team and fellow developers.",
		href: "https://discord.gg/bHnkBcp7xR",
		label: "Join Discord",
	},
	{
		title: "GitHub Discussions",
		description:
			"Feature requests, technical discussions, and roadmap input. Contribute code and report issues.",
		href: "https://github.com/reloop-labs/reloop/discussions",
		label: "View Discussions",
	},
	{
		title: "Twitter / X",
		description:
			"Product updates, tips, and community highlights. Share your Reloop success stories.",
		href: "https://twitter.com/reloophq",
		label: "Follow @reloophq",
	},
];

const CommunityPage = () => {
	return (
		<MarketingPageShell
			titleLines={["Join the Reloop", "Community"]}
			description="Connect with developers, share knowledge, and help shape the future of email infrastructure."
			primaryCta={{ label: "Join Discord", href: "https://discord.gg/bHnkBcp7xR" }}
			secondaryCta={{
				label: "Contribute on GitHub",
				href: "https://github.com/reloop-labs/reloop",
			}}
		>
			<PageSection>
				<SectionHeading
					title="Where our community meets"
					description="Find us across platforms where developers collaborate on email infrastructure."
				/>
				<div className={cardGridClass}>
					{platforms.map((platform) => (
						<div
							key={platform.title}
							className="flex flex-col rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-8 dark:border-white/10"
						>
							<h3 className="mb-3 font-semibold text-lg text-text-strong-950 dark:text-white">
								{platform.title}
							</h3>
							<p className="mb-6 flex-1 text-sm text-text-sub-600 leading-relaxed dark:text-white/50">
								{platform.description}
							</p>
							<a
								href={platform.href}
								target="_blank"
								rel="noopener noreferrer"
								className="font-semibold text-primary-base text-sm hover:underline"
							>
								{platform.label} →
							</a>
						</div>
					))}
				</div>
			</PageSection>

			<PageSection alt>
				<SectionHeading
					title="A growing community"
					description="Thousands of developers are already part of the Reloop ecosystem."
				/>
				<div className={metricsGridClass}>
					{[
						{ value: "2,500+", label: "Discord members", accent: true },
						{ value: "1,200+", label: "GitHub stars", accent: false },
						{ value: "150+", label: "Contributors", accent: true },
						{ value: "50+", label: "Countries", accent: false },
					].map((stat) => (
						<div key={stat.label} className="text-center">
							<div
								className={`mb-4 font-bold text-4xl ${stat.accent ? "text-primary-base" : "text-text-strong-950 dark:text-white"}`}
							>
								{stat.value}
							</div>
							<div className="font-medium text-text-strong-950 dark:text-white">
								{stat.label}
							</div>
						</div>
					))}
				</div>
			</PageSection>

			<FeatureCta
				title="Ready to join?"
				titleMuted="We'd love to meet you."
				description="Whether you need help, want to contribute code, or connect with peers—there's a place for you."
				primary={{ label: "Join Discord", href: "https://discord.gg/bHnkBcp7xR" }}
				secondary={{
					label: "Star on GitHub",
					href: "https://github.com/reloop-labs/reloop",
				}}
			/>
		</MarketingPageShell>
	);
};

export default CommunityPage;
