import { LabelFolderPage } from "../../folder-client";

export const instant = false;

export default async function MailboxLabelRoute({
	params,
}: {
	params: Promise<{ mailboxId: string; labelId: string }>;
}) {
	await params;
	return <LabelFolderPage />;
}
