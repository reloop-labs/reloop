import { FeatureCta } from "@reloop/web/components/page-shell";
import { hostedSignupHref } from "@reloop/web/lib/site";

export default function CTA() {
	return (
		<FeatureCta
			title="Ready to send?"
			titleMuted="Get SMTP credentials."
			description="Sign up, create credentials in the dashboard, and point your mailer at Reloop."
			primary={{ label: "Get started", href: hostedSignupHref }}
			secondary={{ label: "SMTP docs", href: "/docs/quickstart/smtp" }}
			compact
		/>
	);
}
