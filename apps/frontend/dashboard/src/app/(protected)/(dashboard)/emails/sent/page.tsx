import { pageMetadata } from "#/app/_lib/page-metadata";
import { EmailList } from "./client";

export const metadata = pageMetadata(
	"Sent Emails · Reloop",
	"Track and monitor your sent outbound transactional emails.",
);

export default function SentEmailsRoute() {
	return <EmailList />;
}
