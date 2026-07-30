import { MailLayoutClient } from "./layout-client";

/**
 * Shared layout for sent (`/`) and received (`/receive`) only.
 * Email detail lives under `/emails/[id]` without this chrome.
 */
export default function MailLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <MailLayoutClient>{children}</MailLayoutClient>;
}
