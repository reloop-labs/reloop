import { FeatureRow, SectionBlock } from "./shared";

export default function MarketingSection() {
	return (
		<SectionBlock
			eyebrow="Visuals & Campaigns"
			title="Empower Your Product & Marketing Teams"
			subtitle="Design beautiful templates with AI assistance, broadcast layout campaigns safely, and collaborate on revisions in real-time."
			className="bg-white text-[#0a0d12] dark:bg-black dark:text-white"
		>
			{/* Subsection 1: AI Templates & Campaigns */}
			<FeatureRow
				title="AI Templates & Broadcasts"
				description="Generate rich newsletters, product announcements, and transactional templates using prompt engineering and dynamic variable tags."
				theme="violet"
				cards={[
					{
						title: "AI-Powered Templates",
						description:
							"Describe the campaign goal and let our AI compile optimized, responsive layout structures.",
					},
					{
						title: "Dynamic variable tags",
						description:
							"Safely inject names, purchase stats, and user accounts inside generated templates.",
					},
					{
						title: "Campaign Broadcasts",
						description:
							"Broadcast campaign alerts to your entire mailing list with robust signature verification.",
					},
				]}
			/>

			{/* Subsection 2: Live Collaboration */}
			<FeatureRow
				title="Live Editor & Team Collaboration"
				description="Stop editing markup in isolation. Reloop's real-time workspace allows designers, copywriters, and developers to build together."
				theme="cyan"
				reverse
				cards={[
					{
						title: "Live Visual Previews",
						description:
							"See your changes instantly across dozens of desktop and mobile devices while you build.",
					},
					{
						title: "Collaborate Without Friction",
						description:
							"Bring designers and developers together in one workspace with shared styles and built-in feedback.",
					},
					{
						title: "Zero-Risk Deployments",
						description:
							"Every change is versioned, so you can roll back instantly or review full diffs before going live.",
					},
				]}
			/>
		</SectionBlock>
	);
}
