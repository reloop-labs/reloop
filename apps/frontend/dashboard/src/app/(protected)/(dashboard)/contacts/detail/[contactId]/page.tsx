import { pageMetadata } from "#/app/_lib/page-metadata";
import { ContactDetailContent } from "./client";

export const metadata = pageMetadata(
	"Contact Detail · Reloop",
	"View and manage contact details.",
);

export default async function ContactDetailRoute({
	params,
}: {
	params: Promise<{ contactId: string }>;
}) {
	const { contactId } = await params;
	return <ContactDetailContent contactId={contactId} />;
}
