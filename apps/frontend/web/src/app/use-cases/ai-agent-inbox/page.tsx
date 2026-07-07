import { ConsoleFirstLayout } from "@reloop/web/components/landing/use-cases/layouts";
import AiAgentWidget from "@reloop/web/components/landing/use-cases/widgets/ai-agent";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/use-cases/ai-agent-inbox";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function AiAgentInboxPage() {
	return (
		<ConsoleFirstLayout config={config}>
			<AiAgentWidget />
		</ConsoleFirstLayout>
	);
}
