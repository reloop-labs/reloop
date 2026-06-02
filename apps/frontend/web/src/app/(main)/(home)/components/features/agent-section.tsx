import { FeatureRow, SectionBlock } from "./shared";
import { AgentInboxMockup } from "./mockups";

export default function AgentSection() {
	return (
		<SectionBlock
			eyebrow="AI Agent Integration"
			title="Built for the Next Generation of AI"
			subtitle="Equip your autonomous agents with the ability to read, draft, and respond to emails natively. Reloop provides the secure cognitive bridge between LLMs and the inbox."
			className="bg-white dark:bg-black text-[#0a0d12] dark:text-white"
		>
			<FeatureRow
				title="Autonomous Inbox Actions"
				description="AI agents don't work like human users. They need streaming token response endpoints, vector-ready conversation history, and structural JSON parsing."
				theme="indigo"
				cards={[
					{
						title: "AI Agent Inbox",
						description: "A dedicated parser and mailbox built specifically to parse structured data for AI agents.",
					},
					{
						title: "Autonomous Drafts",
						description: "Automatically trigger drafting based on incoming intents, user contexts, and tools.",
					},
					{
						title: "Contextual Memory",
						description: "Easily retrieve vector-indexed email history to sustain long-term coherent agent dialogs.",
					},
				]}
				visual={AgentInboxMockup}
			/>
		</SectionBlock>
	);
}
