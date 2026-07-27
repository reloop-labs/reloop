import { NeedsApprovalFolderPage } from "../folder-client";

export const instant = false;

export default async function MailboxNeedsApprovalRoute({
	params,
}: {
	params: Promise<{ mailboxId: string }>;
}) {
	await params;
	return <NeedsApprovalFolderPage />;
}
