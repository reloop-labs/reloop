"use client";

import { EmailsShell } from "#/features/emails/emails-shell";

/** List-only chrome (header, Sent/Received tabs, sidebar). Not used on email detail. */
export function MailLayoutClient({ children }: { children: React.ReactNode }) {
	return <EmailsShell>{children}</EmailsShell>;
}
