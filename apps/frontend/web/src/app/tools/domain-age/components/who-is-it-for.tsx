import { cn } from "@reloop/ui/cn";

type AudienceColumn = {
	title: string;
	items: string[];
};

const AUDIENCE_COLUMNS: AudienceColumn[] = [
	{
		title: "Marketers",
		items: ["Cold outreach timing", "Newsletter warmup", "List hygiene", "Blast risk checks", "Re-engagement windows", "Campaign go/no-go", "Deliverability QA"],
	},
	{
		title: "Developers",
		items: ["Signup domain gating", "Onboarding fraud checks", "API pre-send validation", "Automated warmup guards", "Multi-tenant age checks", "DNS health probes", "Alerting hooks"],
	},
	{
		title: "Founders",
		items: ["New brand launch", "Domain purchase due diligence", "Investor diligence", "Warmup planning", "Scale-up timing", "Reputation roadmap", "Inbox placement prep"],
	},
	{
		title: "IT & Security",
		items: ["NRD filter awareness", "SPF/DKIM readiness", "Parking vs production DNS", "Expiry risk monitoring", "Abuse triage", "Vendor domain audits", "Post-incident reviews"],
	},
];

export function WhoIsItFor() {
	return (
		<section id="who-is-it-for" aria-labelledby="who-is-it-for-heading" className="w-full">
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] text-primary-base uppercase">Who is it for</p>
				<h2 id="who-is-it-for-heading" className="text-balance font-medium text-[1.45rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[1.7rem] dark:text-white">Who should check domain age?</h2>
				<p className="max-w-3xl text-[15px] text-stone-500 leading-relaxed sm:text-[16px] dark:text-white/60">Anyone who sends email from a domain that might be too new to be trusted.</p>
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
						<div key={column.title} className={cn("flex flex-col border-stroke-soft-100 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 dark:border-white/10", borderClass)}>
							<div className="flex items-center gap-2">
								<span className="h-3.5 w-[2px] shrink-0 rounded-full bg-primary-base" aria-hidden="true" />
								<h3 className="font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-[16px] dark:text-white">{column.title}</h3>
							</div>
							<ul className="mt-6 space-y-3.5 sm:mt-7">
								{column.items.map((item) => (
									<li key={item} className="flex items-start gap-2.5 text-[13.5px] text-text-sub-600 leading-snug sm:text-[14px] dark:text-white/70">
										<span className="mt-0.5 flex size-[17px] shrink-0 items-center justify-center rounded-full bg-primary-base/10 text-primary-base dark:bg-primary-base/20" aria-hidden="true">
											<svg className="size-2.5 stroke-[2.25]" viewBox="0 0 12 12" fill="none" stroke="currentColor" aria-hidden="true">
												<path d="M2.5 6.5L4.8 8.8L9.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
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
