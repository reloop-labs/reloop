import type { Metadata } from "next";
import { ReceivedEmailList } from "../components/received-email-list";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Received Emails · Reloop",
	description:
		"View and filter inbound emails received by your workspace mailboxes.",
};

export default function ReceivedEmailsPage() {
	return <ReceivedEmailList />;
}
