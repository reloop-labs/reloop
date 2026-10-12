import { AgentToolsGrid } from "../../../features/transaction-emails/components/agent-tools-section";
import { SectionHeading } from "../../components/section-heading";

export function McpSection() {
	return (
		<section
			id="agent-tools"
			aria-labelledby="agent-tools-heading"
			className="w-full bg-bg-white-0 dark:bg-black"
		>
			<SectionHeading
				id="agent-tools-heading"
				eyebrow="AI native"
				icon="robot"
				title={["Check domain reputation", "from your AI agent"]}
				description="Connect Claude, Cursor, or any MCP client to Reloop and let your agent audit a sending domain before it sends."
			/>
			<AgentToolsGrid
				mcpLede="Connect Reloop to your AI agent."
				mcpDescription="Let Claude, Cursor, or Codex score a domain's reputation and fix what's failing."
			/>
		</section>
	);
}
