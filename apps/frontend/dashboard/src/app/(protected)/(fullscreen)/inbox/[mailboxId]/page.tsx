import { InboxFolderPage } from "./folder-client";

export const instant = false;

export default async function MailboxInboxRoute({
	params,
}: {
	params: Promise<{ mailboxId: string }>;
}) {
	await params;
	return <InboxFolderPage />;
}
