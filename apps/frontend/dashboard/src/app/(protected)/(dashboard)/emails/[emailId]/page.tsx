import { pageMetadata } from "#/app/_lib/page-metadata";
import { EmailDetailPage } from "./client";

export const metadata = pageMetadata(
	"Email Detail · Reloop",
	"View email delivery details.",
);

export default async function EmailDetailRoute({
	params,
}: {
	params: Promise<{ emailId: string }>;
}) {
	const { emailId } = await params;
	return <EmailDetailPage emailId={emailId} />;
}
