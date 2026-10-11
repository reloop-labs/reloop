import { pageMetadata } from "#/app/_lib/page-metadata";
import { SmtpTestStepPage } from "./client";

export const metadata = pageMetadata(
	"Send a test email · Reloop",
	"Send a test email through your SMTP server.",
);

export default async function SmtpTestStepRoute({
	params,
}: {
	params: Promise<{ providerId: string }>;
}) {
	const { providerId } = await params;
	return <SmtpTestStepPage providerId={providerId} />;
}
