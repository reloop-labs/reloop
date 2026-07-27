import { ContactsLayoutClient } from "./layout-client";

export default function ContactsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ContactsLayoutClient>{children}</ContactsLayoutClient>;
}
