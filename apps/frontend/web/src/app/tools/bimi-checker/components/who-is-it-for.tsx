import { cn } from "@reloop/ui/cn";

type AudienceColumn = {
	title: string;
	items: string[];
};

const AUDIENCE_COLUMNS: AudienceColumn[] = [
	{
		title: "Brand Owners",
		items: [
			"Inbox logo rollout",
			"Trademark & VMC planning",
			"Multi-domain audits",
			"Logo hosting checks",
			"Rebrand DNS updates",
			"Sub-brand assertions",
			"Decline (l=;) policies",
		],
	},
	{
		title: "Email Ops",
		items: [
			"DMARC enforcement",
			"BIMI record publishing",
			"SVG Tiny PS hosting",
			"DNS change validation",
			"Pre-send readiness",
			"Subdomain coverage",
			"Record syntax reviews",
		],
	},
	{
		title: "Security",
		items: [
			"Anti-phishing posture",
			"Logo spoof defense",
			"DMARC alignment",
			"VMC verification",
			"Lookalike domain triage",
			"Incident response",
			"Authentication audits",
		],
	},
	{
		title: "Agencies",
		items: [
			"Client onboarding",
			"Deliverability audits",
			"Brand rollout projects",
			"Pre-launch checks",
			"DNS migration QA",
			"Monthly health reports",
			"Shareable result links",
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
				<p className="mb-3 font-medium text-[12px] text-primary-base uppercase">
					Who is it for
				</p>
				<h2
					id="who-is-it-for-heading"
					className="text-balance font-medium text-[1.45rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[1.7rem] dark:text-white"
				>
					Where can I use reloop’s BIMI checker?
				</h2>
				<p className="max-w-3xl text-[15px] text-stone-500 leading-relaxed sm:text-[16px] dark:text-white/60">
					Anyone who needs to know if a sending domain will show a brand logo in
					supporting inboxes.
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
