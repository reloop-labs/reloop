"use client";

const useCases = [
	{
		title: "Transactional Email",
		description: "Provide essential, real-time user updates.",
		items: [
			"Password reset",
			"Order confirmation",
			"Account verification",
			"Payment receipts",
		],
	},
	{
		title: "Automated Emails",
		description: "Drive engagement and automate user journeys.",
		items: [
			"Welcome series for new users",
			"Trial-to-paid upgrade reminders",
			"Re-engagement emails after inactivity",
		],
	},
	{
		title: "Marketing Emails",
		description: "Build brand loyalty and conversions.",
		items: ["Product launches", "Newsletters", "Promotional offers"],
	},
	{
		title: "System or Admin Emails",
		description: "For internal or technical communication.",
		items: [
			"Error logs",
			"Server downtime alerts",
			"Admin approvals or reports",
		],
	},
];

const UseCaseGrid = () => {
	return (
		<section id="use-cases" className="bg-[#05070b] text-white">
			<div className="mx-auto max-w-[1320px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
				<div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-24">
					{/* Left column — heading */}
					<div className="lg:w-[480px] lg:shrink-0">
						<p className="font-semibold text-[11px] text-white/40 uppercase tracking-[0.16em]">
							Use cases
						</p>
						<h2 className="mt-4 text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
							Built for every
							<br />
							<span className="text-white/40">sending need.</span>
						</h2>
						<p className="mt-6 max-w-[420px] text-[15px] text-white/60 leading-7 sm:text-[16px]">
							Reloop provides the infrastructure to power all your email
							communications, from critical user alerts to high-volume marketing
							campaigns.
						</p>
					</div>

					{/* Right column — highlight grid */}
					<div className="flex-1">
						<div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
							{useCases.map((useCase) => (
								<div key={useCase.title} className="bg-[#05070b] p-8 lg:p-10">
									<h3 className="font-semibold text-[17px] text-white leading-snug sm:text-[18px]">
										{useCase.title}
									</h3>
									<p className="mt-2 text-[14px] text-white/50 leading-relaxed">
										{useCase.description}
									</p>
									<ul className="mt-3">
										{useCase.items.map((item) => (
											<li
												key={item}
												className="flex items-center gap-2.5 text-sm text-white/40"
											>
												<div className="size-1 rounded-full bg-white/20" />
												{item}
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default UseCaseGrid;
