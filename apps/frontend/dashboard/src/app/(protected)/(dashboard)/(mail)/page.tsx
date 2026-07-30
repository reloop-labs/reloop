import { pageMetadata } from "#/app/_lib/page-metadata";
import { EmailList } from "./client";

export const metadata = pageMetadata(
	"Sent Emails · Reloop",
	"Track and monitor your sent outbound transactional emails.",
);

// Client list (org/session gates) — not eligible for instant navigation.
export const instant = false;

export default function SentEmailsHomeRoute() {
	return <EmailList />;
}
