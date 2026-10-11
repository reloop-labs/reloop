import { pageMetadata } from "#/app/_lib/page-metadata";
import { AddSmtpPage } from "./client";

export const metadata = pageMetadata(
	"Connect to SMTP Server · Reloop",
	"Connect your own SMTP server and send a test email.",
);

export default function AddSmtpRoute() {
	return <AddSmtpPage />;
}
