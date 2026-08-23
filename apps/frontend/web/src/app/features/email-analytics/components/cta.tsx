import { FeatureCta } from "@reloop/web/components/landing/cta";
import { hostedSignupHref } from "@reloop/web/lib/site";

export default function CTA() {
	return (
		<FeatureCta
			title="Total clarity on your email deliverability."
			titleMuted="Start for free."
			description="Join thousands of developers tracking email delivery, engagement, and bounce diagnostics in real time with Reloop."
			primary={{ label: "Get started free", href: hostedSignupHref }}
			secondary={{
				label: "Read Analytics Docs",
				href: "/docs",
			}}
		/>
	);
}
