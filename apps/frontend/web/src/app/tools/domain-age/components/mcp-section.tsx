import { AgentToolsGrid } from "../../../features/transaction-emails/components/agent-tools-section";
import { SectionHeading } from "../../components/section-heading";

export function McpSection({
	title,
	description,
	mcpDescription,
}: {
	title: readonly [string, string];
	description: string;
	mcpDescription: string;
}) {
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
				title={title}
				description={description}
			/>
			<AgentToolsGrid
				mcpLede="Connect Reloop to your AI agent."
				mcpDescription={mcpDescription}
			/>
		</section>
	);
}
