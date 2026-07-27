"use client";

import { MailboxLayout } from "#/features/agent-inbox/pages/mailbox-layout";

export function MailboxLayoutClient({
	children,
}: {
	children: React.ReactNode;
}) {
	return <MailboxLayout>{children}</MailboxLayout>;
}
