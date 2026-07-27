import { ArchiveFolderPage } from "../folder-client";

export const instant = false;

export default async function MailboxArchiveRoute({
	params,
}: {
	params: Promise<{ mailboxId: string }>;
}) {
	await params;
	return <ArchiveFolderPage />;
}
