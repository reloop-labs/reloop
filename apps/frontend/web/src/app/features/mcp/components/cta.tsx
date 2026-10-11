import { FeatureCta } from "@reloop/web/components/page-shell";
import {
	MCP_DASHBOARD_HREF,
	MCP_DOCS_HREF,
} from "@reloop/web/lib/landing/ai-tools/mcp";

export default function CTA() {
	return (
		<FeatureCta
			title="Connect your agent to Reloop."
			titleMuted="Sign in once."
			description="Pick your client in the dashboard and follow the steps. No API key to copy."
			primary={{ label: "Connect a client", href: MCP_DASHBOARD_HREF }}
			secondary={{ label: "MCP docs", href: MCP_DOCS_HREF }}
			compact
		/>
	);
}
