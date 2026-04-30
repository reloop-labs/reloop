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
];

const UseCase = () => {
	return (
		<section id="use-cases" className="min-h-screen bg-[#05070b] text-white">
			<div className="mx-auto max-w-[1320px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
				<p className="font-semibold text-[11px] text-white/40 uppercase tracking-[0.16em]">
					Use cases
				</p>
				<h2 className="mt-4 font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
					Built for every <span className="text-white/40">sending need.</span>
				</h2>
				<div className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
					{useCases.map((useCase, i) => (
						<div
							key={useCase.title}
							className="flex flex-col bg-[#05070b] p-8 lg:p-10"
						>
							<span className="font-semibold text-sm text-white/28 tabular-nums">
								{String(i + 1).padStart(2, "0")}
							</span>
							<h3 className="mt-4 font-semibold text-lg text-white leading-snug">
								{useCase.title}
							</h3>
							<p className="mt-4 font-medium text-white/50 leading-relaxed">
								{useCase.description}
							</p>
							<ul className="mt-6 list-inside list-disc space-y-1 text-white/50">
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
