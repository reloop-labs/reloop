import Link from "next/link";

const allComparisons = [
	{ href: "/compare/resend", label: "Resend" },
	{ href: "/compare/mailgun", label: "Mailgun" },
	{ href: "/compare/sendgrid", label: "SendGrid" },
	{ href: "/compare/aws-ses", label: "AWS SES" },
	{ href: "/compare/postmark", label: "Postmark" },
	{ href: "/compare/loops", label: "Loops" },
	{ href: "/compare/mailchimp", label: "Mailchimp" },
];

export function CompareOtherLinks({ currentHref }: { currentHref: string }) {
	const others = allComparisons.filter((item) => item.href !== currentHref);

	return (
		<div className="mx-auto max-w-3xl">
			<p className="text-center font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
				More comparisons
			</p>
			<div className="mt-4 flex flex-wrap justify-center gap-2">
				{others.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className="rounded-xl border border-stroke-soft-200 px-4 py-2 font-semibold text-[14px] text-text-strong-950 transition-colors hover:border-primary-base/40 hover:text-primary-base dark:border-white/10 dark:text-white"
					>
						vs {item.label}
					</Link>
				))}
			</div>
		</div>
	);
}
