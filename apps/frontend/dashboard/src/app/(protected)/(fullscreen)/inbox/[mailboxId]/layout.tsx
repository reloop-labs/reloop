import { MailboxLayoutClient } from "./layout-client";

export default function MailboxRouteLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <MailboxLayoutClient>{children}</MailboxLayoutClient>;
}
