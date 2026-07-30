import { pageMetadata } from "#/app/_lib/page-metadata";
import { ReceivedEmailList } from "./client";

export const metadata = pageMetadata(
	"Received Emails · Reloop",
	"View and filter inbound emails received by your workspace mailboxes.",
);

export default function ReceivedEmailsRoute() {
	return <ReceivedEmailList />;
}
