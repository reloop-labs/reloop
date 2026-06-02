"use client";

const useCases = [
	{
		title: "Transactional Email",
		description: "Guarantee delivery for critical, real-time user updates.",
		items: [
			"Password reset",
			"Order confirmation",
			"Account verification",
			"Payment receipts",
		],
	},
	{
		title: "Automated Emails",
		description: "Automate user journeys and engagement flows.",
		items: [
			"Welcome series",
			"Renewal reminders",
			"Re-engagement",
			"Drip campaigns",
		],
	},
	{
		title: "Marketing Emails",
		description: "High-volume newsletters and promotional campaigns.",
		items: ["Product launches", "Newsletters", "Promotions", "Events"],
	},
	{
		title: "System & Monitoring",
		description: "Zero-latency technical and admin communications.",
		items: ["Error logs", "Downtime alerts", "Reports", "Approvals"],
	},
	{
		title: "AI Agent Inbox",
		description:
			"A dedicated inbox for AI agents to manage and respond to emails like a human.",
		items: [
			"Native agent inbox",
			"Autonomous drafting",
			"Human-in-the-loop",
			"Contextual memory",
		],
	},
	{
		title: "Receive Email",
		description: "Seamlessly process and route inbound mail to your systems.",
		items: [
			"Inbound webhooks",
			"JSON parsing",
			"Spam filtering",
			"Attachment handling",
		],
	},
];

const UseCase = () => {
	return (
		<section id="use-cases" className="min-h-screen">
			<div className="mx-auto max-w-[1320px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
				<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
					Use cases
				</p>
				<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
					Built for every Single Need
				</h2>
				<div className="mt-20 grid overflow-hidden rounded-4xl border border-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10">
					{useCases.map((useCase, i) => (
						<div
							key={useCase.title}
							className="flex flex-col border-stroke-soft-200 border-t border-l-0 bg-bg-weak-50 p-8 transition-colors duration-300 first:border-t-0 sm:border-t sm:border-l lg:border-t lg:border-l lg:p-10 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/[0.02] sm:[&:nth-child(-n+2)]:border-t-0 lg:[&:nth-child(-n+3)]:border-t-0 sm:[&:nth-child(2n+1)]:border-l-0 lg:[&:nth-child(3n+1)]:border-l-0"
						>
							<span className="font-semibold text-sm text-text-soft-400 tabular-nums dark:text-white/28">
								{String(i + 1).padStart(2, "0")}
							</span>
							<h3 className="mt-4 font-semibold text-lg text-text-strong-950 leading-snug dark:text-white">
								{useCase.title}
							</h3>
							<p className="mt-4 font-medium text-text-sub-600 leading-relaxed dark:text-white/50">
								{useCase.description}
							</p>
							<ul className="mt-6 list-inside list-disc space-y-1 text-text-sub-600 dark:text-white/50">
								{useCase.items.map((item) => (
									<li key={item} className="font-medium text-sm">
										{item}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default UseCase;
