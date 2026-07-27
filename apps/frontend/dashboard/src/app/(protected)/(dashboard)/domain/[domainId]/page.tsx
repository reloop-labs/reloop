import { pageMetadata } from "#/app/_lib/page-metadata";
import { DomainDetailPage } from "./client";

export const metadata = pageMetadata(
	"Domain · Reloop",
	"View domain status, DNS records, and configuration.",
);

export default async function DomainDetailRoute({
	params,
}: {
	params: Promise<{ domainId: string }>;
}) {
	const { domainId } = await params;
	return <DomainDetailPage domainId={domainId} />;
}
