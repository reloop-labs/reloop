import { ContactsLayoutClient } from "./layout-client";

export const instant = false;

export default function ContactsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ContactsLayoutClient>{children}</ContactsLayoutClient>;
}
