import { pageMetadata } from "#/app/_lib/page-metadata";
import { DomainSetupPage } from "./client";

export const metadata = pageMetadata(
	"Configure DNS · Reloop",
	"Add DNS records and verify your domain.",
);

export default async function DomainSetupRoute({
	params,
}: {
	params: Promise<{ domainId: string }>;
}) {
	const { domainId } = await params;
	return <DomainSetupPage domainId={domainId} />;
}
