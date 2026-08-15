import { FeatureCta } from "@reloop/web/components/landing/cta";
import { hostedSignupHref } from "@reloop/web/lib/site";

export default function CTA() {
	return (
		<FeatureCta
			title="Ready to create beautiful emails?"
			titleMuted="Start for free."
			description="Choose from our template library or build custom designs that match your brand. No credit card required."
			primary={{ label: "Get started", href: hostedSignupHref }}
			secondary={{
				label: "Template docs",
				href: "/docs",
			}}
		/>
	);
}
