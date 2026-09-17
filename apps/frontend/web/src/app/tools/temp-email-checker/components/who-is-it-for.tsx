import { cn } from "@reloop/ui/cn";

type AudienceColumn = {
	title: string;
	items: string[];
};

const AUDIENCE_COLUMNS: AudienceColumn[] = [
	{
		title: "Developers",
		items: [
			"Signup protection",
			"Registration forms",
			"Auth middleware hooks",
			"Account creation APIs",
			"Guest checkout flows",
			"Profile email updates",
			"Inbound webhook triage",
		],
	},
	{
		title: "Fraud & Security",
		items: [
			"Free trial gatekeeping",
			"API credit protection",
			"Referral fraud defense",
			"Multi-account blocks",
			"Promo code validation",
			"Bot signup mitigation",
			"Freemium abuse audits",
		],
	},
	{
		title: "Growth & Marketing",
		items: [
			"Product waitlists",
			"Gated content downloads",
			"Newsletter subscriptions",
			"Webinar registrations",
			"Demo request forms",
			"Lead qualification",
			"Pre-campaign list scrubs",
		],
	},
	{
		title: "Support & Trust",
		items: [
			"Payment dispute triage",
			"Chargeback investigations",
			"Suspicious user audits",
			"Customer support tickets",
			"Admin dashboard lookup",
			"Abuse incident triage",
			"Account recovery checks",
		],
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
					Who is <span className="text-primary-base">Reloop&rsquo;s</span> Temp
					Email Checker for?
				</h2>
				<p className="mt-4 max-w-3xl text-[15px] text-stone-500 leading-relaxed sm:text-[16px] dark:text-white/60">
					Anyone who needs to know if an address is real without ever probing
					the mailbox.
				</p>
			</div>

			<div className="grid grid-cols-1 border-stroke-soft-100 border-b sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10">
				{AUDIENCE_COLUMNS.map((column, index) => {
					const borderClass =
						index === 0
							? "border-b sm:border-r lg:border-b-0 lg:border-r"
							: index === 1
								? "border-b sm:border-r-0 lg:border-b-0 lg:border-r"
								: index === 2
									? "border-b sm:border-b-0 sm:border-r lg:border-b-0 lg:border-r"
									: "border-b-0 sm:border-b-0 sm:border-r-0 lg:border-r-0";

					return (
						<div
							key={column.title}
							className={cn(
								"flex flex-col border-stroke-soft-100 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 dark:border-white/10",
								borderClass,
							)}
						>
							{/* Column header with vertical accent bar */}
							<div className="flex items-center gap-2">
								<span
									className="h-3.5 w-[2px] shrink-0 rounded-full bg-primary-base"
									aria-hidden="true"
								/>
								<h3 className="font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-[16px] dark:text-white">
									{column.title}
								</h3>
							</div>

							{/* Feature checkmark list */}
							<ul className="mt-6 space-y-3.5 sm:mt-7">
								{column.items.map((item) => (
									<li
										key={item}
										className="flex items-start gap-2.5 text-[13.5px] text-text-sub-600 leading-snug sm:text-[14px] dark:text-white/70"
									>
										<span
											className="mt-0.5 flex size-[17px] shrink-0 items-center justify-center rounded-full bg-primary-base/10 text-primary-base dark:bg-primary-base/20"
											aria-hidden="true"
										>
											<svg
												className="size-2.5 stroke-[2.25]"
												viewBox="0 0 12 12"
												fill="none"
												stroke="currentColor"
												aria-hidden="true"
											>
												<path
													d="M2.5 6.5L4.8 8.8L9.5 3.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
										</span>
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
					);
				})}
			</div>
		</section>
	);
}
