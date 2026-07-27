import { YouFolderPage } from "../folder-client";

export const instant = false;

export default async function MailboxYouRoute({
	params,
}: {
	params: Promise<{ mailboxId: string }>;
}) {
	await params;
	return <YouFolderPage />;
}
