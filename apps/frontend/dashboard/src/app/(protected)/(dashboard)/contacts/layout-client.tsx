"use client";

import { ContactsShell } from "#/features/contacts/contacts-shell";

export function ContactsLayoutClient({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ContactsShell>{children}</ContactsShell>;
}
