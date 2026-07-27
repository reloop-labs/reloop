import { SentFolderPage } from "../folder-client";

export const instant = false;

export default async function MailboxSentRoute({
	params,
}: {
	params: Promise<{ mailboxId: string }>;
}) {
	await params;
	return <SentFolderPage />;
}
