export type CompareSource = {
	label: string;
	href: string;
	verifiedAt: string | null;
};

export const compareSources: Record<string, CompareSource> = {
	Resend: {
		label: "Resend pricing",
		href: "https://resend.com/pricing",
		verifiedAt: "2026-09-17",
	},
	SendGrid: {
		label: "SendGrid pricing",
		href: "https://sendgrid.com/pricing/",
		verifiedAt: null,
	},
	Mailgun: {
		label: "Mailgun pricing",
		href: "https://www.mailgun.com/pricing/",
		verifiedAt: "2026-09-17",
	},
	Postmark: {
		label: "Postmark pricing",
		href: "https://postmarkapp.com/pricing",
		verifiedAt: "2026-09-17",
	},
	"AWS SES": {
		label: "Amazon SES pricing",
		href: "https://aws.amazon.com/ses/pricing/",
		verifiedAt: "2026-09-17",
	},
	Loops: {
		label: "Loops pricing",
		href: "https://loops.so/pricing",
		verifiedAt: "2026-09-17",
	},
	Mailchimp: {
		label: "Mailchimp pricing",
		href: "https://mailchimp.com/pricing/marketing/",
		verifiedAt: "2026-09-17",
	},
};

export function getCompareSource(competitorName: string): CompareSource | null {
	return compareSources[competitorName] ?? null;
}
