import type { Metadata } from "next";
import { EmailList } from "../components/email-list";

export const metadata: Metadata = {
	title: "Sent Emails · Reloop",
	description: "Track and monitor your sent outbound transactional emails.",
};

export default function SentEmailsPage() {
	return <EmailList />;
}
