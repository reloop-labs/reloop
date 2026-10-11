import { FeatureCta } from "@reloop/web/components/page-shell";
import { CLI_DOCS_HREF } from "@reloop/web/lib/landing/ai-tools/cli";
import { hostedSignupHref } from "@reloop/web/lib/site";

export default function CTA() {
	return (
		<FeatureCta
			title="Send email from your terminal."
			titleMuted="One command to start."
			description="Create a free account, run init, and send your first email from the shell or your agent."
			primary={{ label: "Get started", href: hostedSignupHref }}
			secondary={{ label: "CLI docs", href: CLI_DOCS_HREF }}
			compact
		/>
	);
}
