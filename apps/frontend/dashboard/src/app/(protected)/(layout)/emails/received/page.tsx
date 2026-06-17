import type { Metadata } from "next";
import { ReceivedEmailList } from "../components/received-email-list";

export const metadata: Metadata = {
	title: "Received Emails · Reloop",
	description:
		"View and filter inbound emails received by your workspace mailboxes.",
};

export default function ReceivedEmailsPage() {
	return <ReceivedEmailList />;
}
