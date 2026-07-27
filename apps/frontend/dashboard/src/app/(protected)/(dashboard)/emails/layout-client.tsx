"use client";

import { EmailsShell } from "#/features/emails/emails-shell";

export function EmailsLayoutClient({
	children,
}: {
	children: React.ReactNode;
}) {
	return <EmailsShell>{children}</EmailsShell>;
}
