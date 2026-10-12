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
				title={["Check temp emails", "from your AI agent"]}
				description="Connect Claude, Cursor, or any MCP client to Reloop and let your agent catch throwaway addresses on its own."
			/>
			<AgentToolsGrid
				mcpLede="Connect Reloop to your AI agent."
				mcpDescription="Let Claude, Cursor, or Codex check addresses before they send."
			/>
		</section>
	);
}
