import { FeatureCta } from "@reloop/web/components/landing/cta";
import { hostedSignupHref } from "@reloop/web/lib/site";

export default function CTA() {
	return (
		<FeatureCta
			title="3,000 emails for free"
			titleMuted="per month."
			description="No credit card required. Join thousands of AI Agents & Developers building the future of email communication on Reloop."
			primary={{ label: "Get started", href: hostedSignupHref }}
			secondary={{
				label: "See pricing",
				href: "/pricing",
			}}
		/>
	);
}
