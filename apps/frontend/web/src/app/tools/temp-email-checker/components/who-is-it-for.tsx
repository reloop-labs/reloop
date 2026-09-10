const AUDIENCES = [
	{
		title: "Developers & fraud teams",
		description:
			"Block throwaway signups at registration with syntax, disposable catalogue, and MX signals in one call.",
	},
	{
		title: "Growth & lifecycle marketers",
		description:
			"Keep lists clean so onboarding, activation, and re-engagement emails reach real inboxes.",
	},
	{
		title: "Support & trust teams",
		description:
			"Quickly verify suspicious addresses during reviews, disputes, and abuse triage — without ever probing the mailbox.",
	},
];

export function WhoIsItFor() {
	return (
		<section
			id="who-is-it-for"
			aria-labelledby="who-is-it-for-heading"
			className="w-full"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] uppercase">
					<span className="text-primary-base">02.</span>{" "}
					<span className="text-text-sub-600 dark:text-white/50">
						Who is it for
					</span>
				</p>
				<h2
					id="who-is-it-for-heading"
					className="text-balance font-semibold text-2xl text-text-strong-950 tracking-[-0.025em] sm:text-3xl lg:text-[2rem] lg:leading-[1.15] dark:text-white"
				>
					Who is <span className="text-primary-base">Reloop&rsquo;s</span>{" "}
					Temp Email Checker for?
				</h2>
				<p className="mt-4 max-w-3xl text-[15px] text-stone-500 leading-relaxed sm:text-[16px] dark:text-white/60">
					Anyone who needs to know if an address is real — without ever
					probing the mailbox.
				</p>
			</div>

			<div className="grid grid-cols-1 divide-y divide-stroke-soft-100 border-stroke-soft-100 border-b lg:grid-cols-3 lg:divide-x lg:divide-y-0 dark:divide-white/10 dark:border-white/10">
				{AUDIENCES.map((audience) => (
					<div
						key={audience.title}
						className="flex flex-col px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10"
					>
						<h3 className="text-balance font-semibold text-text-strong-950 text-[16px] tracking-[-0.025em] dark:text-white">
							{audience.title}
						</h3>
						<p className="mt-3 text-[13px] text-stone-500 leading-relaxed dark:text-white/60">
							{audience.description}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}
