import { PageSection, SectionHeading } from "@reloop/web/components/page-shell";
import { mcpPrompts } from "@reloop/web/lib/landing/ai-tools/mcp";
import { PromptGrid } from "./prompt-grid";

export default function Prompts() {
	return (
		<div id="prompts">
			<PageSection alt>
				<SectionHeading
					title="Ask your agent to…"
					description="Copy a prompt into your client once Reloop is connected."
				/>
				<PromptGrid prompts={mcpPrompts} />
			</PageSection>
		</div>
	);
}
