import { TrashFolderPage } from "../folder-client";

export const instant = false;

export default async function MailboxTrashRoute({
	params,
}: {
	params: Promise<{ mailboxId: string }>;
}) {
	await params;
	return <TrashFolderPage />;
}
