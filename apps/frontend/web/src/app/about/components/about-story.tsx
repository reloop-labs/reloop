type StoryChapter = {
	period: string;
	title: string;
	paragraphs: string[];
};

const story: StoryChapter[] = [
	{
		period: "The black-box problem",
		title: "Every application needs email. Incumbent platforms keep routing hidden.",
		paragraphs: [
			"Password resets, receipts, onboarding flows, campaigns: email is in every software product we build. Yet traditional vendors force developers to trust routing heuristics and deliverability scoring you cannot inspect. When deliverability drops at 2 a.m., the only tool available is a public status page.",
			"Volume-tiered bills escalate while black-box routing stays black-box. We wanted what engineering teams need: production-grade email infrastructure that is auditable, self-hostable, and completely transparent in source.",
		],
	},
	{
		period: "September 2025: Commit zero",
		title: "Pranav and Twinkal founded Reloop Labs.",
		paragraphs: [
			"Two engineers, one core conviction: build the complete email platform as an open-source system under Apache 2.0. Transactional sends, campaign management, high-speed SMTP relays, webhook dispatches, and deliverability analytics in one monorepo.",
			"No stealth mode and no private enterprise forks. Issues on GitHub, progress in Discord, and code anyone can clone, audit, and run. If we were going to fix email infrastructure, we were going to do it in public where every claim can be verified.",
		],
	},
	{
		period: "2025–2026: Shipping in public",
		title: "Building the full stack in one public monorepo.",
		paragraphs: [
			"TypeScript and Go SDKs, one-command Docker self-hosting, agent inboxes for autonomous workflows, and transparent deliverability tooling. Every capability landed in one unified codebase, whether you deploy it on your own servers or use reloop.sh.",
			"Reloop Labs maintains that public codebase and operates the hosted cloud. Same software, your choice of deployment. That is not marketing copy; it is our core engineering requirement.",
		],
	},
	{
		period: "2026: Production readiness",
		title: "Reloop is live worldwide. The codebase remains 100% public.",
		paragraphs: [
			"You can sign up on reloop.sh and send 3,000 emails per month free, or clone the repository and run Reloop inside your private VPC. No enterprise paywalls for essential features, and zero closed-source routing modules.",
			"We are an engineer-led team shipping weekly with a public roadmap. The foundation is open, the engine is proven, and we are committed to building the permanent open-source standard for email.",
		],
	},
];

export function AboutStory() {
	return (
		<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* Section Header */}
				<div className="border-stroke-soft-200 border-b px-6 py-14 sm:px-10 sm:py-16 lg:px-12 dark:border-white/10">
					<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						The Reloop story.
					</h2>
					<p className="mt-1.5 max-w-2xl text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						How we started, what we learned from proprietary email vendors, and why we build in public.
					</p>
				</div>

				{/* Chapters */}
				<div className="divide-y divide-stroke-soft-200 dark:divide-white/10">
					{story.map((chapter) => (
						<article
							key={chapter.period}
							className="px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14"
						>
							<div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-8">
								<div className="lg:col-span-4">
									<p className="font-mono text-[13px] text-text-sub-600 dark:text-white/50">
										{chapter.period}
									</p>
									<h3 className="mt-2 font-semibold text-[1.2rem] text-text-strong-950 leading-snug tracking-tight sm:text-[1.35rem] dark:text-white">
										{chapter.title}
									</h3>
								</div>
								<div className="space-y-4 lg:col-span-8">
									{chapter.paragraphs.map((paragraph) => (
										<p
											key={paragraph.slice(0, 40)}
											className="text-[14px] text-text-sub-600 leading-relaxed sm:text-[15px] dark:text-white/60"
										>
											{paragraph}
										</p>
									))}
								</div>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
