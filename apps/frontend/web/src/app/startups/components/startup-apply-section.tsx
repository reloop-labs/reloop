import { Icon } from "@reloop/ui/icon";
import { StartupApplyForm } from "./startup-apply-form";

const checklist = [
	"Up to $1,000 in credits, valid 12 months",
	"Decision within 5 business days",
	"Engineer-level deliverability help",
	"No signup, no credit card",
];

export function StartupApplySection() {
	return (
		<section
			id="apply"
			className="scroll-mt-[72px] border-stroke-soft-100 border-y max-[1279px]:scroll-mt-14 dark:border-white/10"
		>
			<h1 className="sr-only">
				Reloop for Startups — Up to $1,000 in email credits
			</h1>
			<div className="grid grid-cols-1 divide-y divide-stroke-soft-100 lg:grid-cols-[1fr_1fr] lg:divide-x lg:divide-y-0 dark:divide-white/10">
				{/* Left: pitch column */}
				<div className="flex w-full min-w-0 flex-col px-6 py-10 sm:px-10 sm:py-12 lg:p-12 xl:p-16">
					<h2 className="text-balance font-semibold text-[30px] text-text-strong-950 leading-tight tracking-tight dark:text-white">
						Up to $1k transactional email credits for startups
					</h2>
					<p className="mt-4 text-balance text-[15px] text-text-sub-600 leading-relaxed dark:text-white/55">
						Get up to $1,000 in Reloop Cloud credits and engineer-level support
						for your transactional email.
					</p>
					<ul className="mt-8 space-y-3">
						{checklist.map((item) => (
							<li key={item} className="flex items-center gap-3">
								<Icon
									name="check-circle"
									className="size-4 shrink-0 text-emerald-600 dark:text-emerald-500"
								/>
								<span className="text-[14px] text-text-strong-950 dark:text-white/85">
									{item}
								</span>
							</li>
						))}
					</ul>
					<div className="mt-10 space-y-5 *:space-y-1.5">
						<div>
							<h3 className="text-[14px] text-text-sub-600 dark:text-white/55">
								Email
							</h3>
							<a
								className="font-medium text-[14px] text-text-strong-950 hover:underline dark:text-white"
								href="mailto:support@reloop.sh"
							>
								support@reloop.sh
							</a>
						</div>
						<div>
							<h3 className="text-[14px] text-text-sub-600 dark:text-white/55">
								Response time
							</h3>
							<p className="font-medium text-[14px] text-text-strong-950 dark:text-white">
								Within 5 business days
							</p>
						</div>
						<div>
							<h3 className="text-[14px] text-text-sub-600 dark:text-white/55">
								Eligibility
							</h3>
							<p className="font-medium text-[14px] text-text-strong-950 dark:text-white">
								Pre-seed to Series A
								<br />
								or bootstrapped
							</p>
						</div>
					</div>
				</div>

				{/* Right: form */}
				<div className="min-w-0 px-6 py-10 sm:px-10 sm:py-12 lg:p-12 xl:p-16">
					<StartupApplyForm />
				</div>
			</div>
		</section>
	);
}
