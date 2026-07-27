import { MailboxLayoutClient } from "./layout-client";

export const instant = false;

export default function MailboxRouteLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <MailboxLayoutClient>{children}</MailboxLayoutClient>;
}
