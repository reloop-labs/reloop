import { FeatureCta } from "@reloop/web/components/landing/cta";
import { hostedSignupHref } from "@reloop/web/lib/site";

export default function CTA() {
	return (
		<FeatureCta
			title="Give your AI Agents an inbox."
			titleMuted="Start for free."
			description="Connect your LLMs, LangChain, or Autogen framework to Reloop today and empower your autonomous workforce with real-time email operations."
			primary={{ label: "Get started", href: hostedSignupHref }}
			secondary={{
				label: "Read SDK Docs",
				href: "/docs",
			}}
		/>
	);
}
