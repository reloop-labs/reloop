import { StarredFolderPage } from "../folder-client";

export const instant = false;

export default async function MailboxStarredRoute({
	params,
}: {
	params: Promise<{ mailboxId: string }>;
}) {
	await params;
	return <StarredFolderPage />;
}
