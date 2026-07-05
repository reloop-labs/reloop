import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import CTA from "./components/cta";
import Hero from "./components/hero";
import Sandbox from "./components/sandbox";
import WorksWith from "./components/works-with";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "SMTP Relay | Reloop",
	description:
		"Send email through Reloop's SMTP relay. Plain-language guide, connection settings, and examples for Nodemailer, Laravel, and more.",
	keywords: [
		"SMTP relay",
		"SMTP email service",
		"managed SMTP",
		"Nodemailer SMTP",
		"Laravel SMTP",
		"email SMTP server",
		"open source SMTP relay",
	],
	alternates: { canonical: `${getSiteUrl()}/features/smtp` },
	openGraph: {
		title: "SMTP Relay | Reloop",
		description:
			"Send email through Reloop's SMTP relay. Connection settings and examples for common mailers.",
		type: "website",
		url: `${getSiteUrl()}/features/smtp`,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "SMTP Relay | Reloop",
		description:
			"Send email through Reloop's SMTP relay. Connection settings and examples for common mailers.",
	},
};

const SmtpPage = () => {
	return (
		<div>
			<Hero />
			<WorksWith />
			<Sandbox />
			<CTA />
		</div>
	);
};

export default SmtpPage;
