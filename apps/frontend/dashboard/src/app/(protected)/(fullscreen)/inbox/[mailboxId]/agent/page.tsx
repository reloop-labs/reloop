import { AgentFolderPage } from "../folder-client";

export const instant = false;

export default async function MailboxAgentRoute({
	params,
}: {
	params: Promise<{ mailboxId: string }>;
}) {
	await params;
	return <AgentFolderPage />;
}
