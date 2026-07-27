export const instant = false;

// TanStack's structural label route rendered the mailbox shell with no folder.
export default async function MailboxLabelIndexRoute({
	params,
}: {
	params: Promise<{ mailboxId: string }>;
}) {
	await params;
	return null;
}
