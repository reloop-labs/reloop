import type { Metadata } from "next";
import { EmailList } from "../components/email-list";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Sent Emails · Reloop",
	description: "Track and monitor your sent outbound transactional emails.",
};

export default function SentEmailsPage() {
	return <EmailList />;
}
