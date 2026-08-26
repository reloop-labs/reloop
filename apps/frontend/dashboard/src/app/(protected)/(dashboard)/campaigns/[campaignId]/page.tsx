import { pageMetadata } from "#/app/_lib/page-metadata";
import { CampaignDetailPage } from "./client";

export const metadata = pageMetadata(
	"Campaign Analytics · Reloop",
	"View campaign performance, delivery rates, and email preview.",
);

export default async function CampaignDetailRoute({
	params,
}: {
	params: Promise<{ campaignId: string }>;
}) {
	const { campaignId } = await params;
	return <CampaignDetailPage />;
}
