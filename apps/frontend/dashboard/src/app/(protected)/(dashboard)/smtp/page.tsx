import { pageMetadata } from "#/app/_lib/page-metadata";
import { SmtpPage } from "./client";

export const metadata = pageMetadata(
	"SMTP Relay · Reloop",
	"Send emails using SMTP relay with Reloop credentials.",
);

export default function SmtpRoute() {
	return <SmtpPage />;
}
