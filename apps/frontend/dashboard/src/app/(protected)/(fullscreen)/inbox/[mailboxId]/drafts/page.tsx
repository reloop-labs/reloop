import { DraftsFolderPage } from "../folder-client";

export const instant = false;

export default async function MailboxDraftsRoute({
	params,
}: {
	params: Promise<{ mailboxId: string }>;
}) {
	await params;
	return <DraftsFolderPage />;
}
