import Link from "next/link";

const comparisons = [
	{
		href: "/compare/resend",
		category: "Transactional API",
		title: "Reloop vs Resend",
		tagline: "Modern developer APIs—and an open-source path beyond hosted-only.",
	},
	{
		href: "/compare/mailgun",
		category: "Transactional API",
		title: "Reloop vs Mailgun",
		tagline: "SMTP, inbound parsing, and a stack you can actually inspect.",
	},
	{
		href: "/compare/sendgrid",
		category: "Transactional + marketing",
		title: "Reloop vs SendGrid",
		tagline: "Enterprise email without Twilio lock-in or legacy UI baggage.",
	},
	{
		href: "/compare/aws-ses",
		category: "Cloud SMTP / API",
		title: "Reloop vs AWS SES",
		tagline: "When raw SES isn't enough—and when a full platform wins.",
	},
	{
		href: "/compare/postmark",
		category: "Transactional API",
		title: "Reloop vs Postmark",
		tagline: "Transactional speed plus campaigns, self-hosting, and source access.",
	},
	{
		href: "/compare/loops",
		category: "Product + marketing email",
		title: "Reloop vs Loops",
		tagline: "SaaS lifecycle email without bolting on a second transactional vendor.",
	},
	{
		href: "/compare/mailchimp",
		category: "Marketing + audiences",
		title: "Reloop vs Mailchimp",
		tagline: "Newsletters and API-first sends—priced by volume, not list size.",
	},
];

export function ComparisonGrid() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{comparisons.map((item) => (
				<Link
					key={item.href}
					href={item.href}
					className="group flex flex-col rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-6 transition-colors hover:border-primary-base/40 hover:bg-bg-soft-50 dark:border-white/10 dark:hover:border-primary-base/40 dark:hover:bg-white/[0.02]"
				>
					<span className="font-semibold text-[11px] text-primary-base uppercase tracking-[0.14em]">
						{item.category}
					</span>
					<h3 className="mt-2 font-semibold text-lg text-text-strong-950 group-hover:text-primary-base dark:text-white">
						{item.title}
					</h3>
					<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
						{item.tagline}
					</p>
					<span
						className="mt-4 font-semibold text-[14px] text-primary-base"
						aria-hidden="true"
					>
						Read comparison →
					</span>
				</Link>
			))}
		</div>
	);
}
