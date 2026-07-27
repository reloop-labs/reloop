import { pageMetadata } from "#/app/_lib/page-metadata";
import { InboxLayoutClient } from "./layout-client";

export const metadata = pageMetadata(
	"Inbox · Reloop",
	"Agent email inbox for conversations and drafts.",
);

export default function InboxLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <InboxLayoutClient>{children}</InboxLayoutClient>;
}
