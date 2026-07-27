import { SpamFolderPage } from "../folder-client";

export const instant = false;

export default async function MailboxSpamRoute({
	params,
}: {
	params: Promise<{ mailboxId: string }>;
}) {
	await params;
	return <SpamFolderPage />;
}
