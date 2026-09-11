import { Suspense } from "react";
import { pageMetadata } from "#/app/_lib/page-metadata";
import { CampaignEditorPage } from "./client";

export const metadata = pageMetadata(
	"Campaign Editor · Reloop",
	"Design and customize your broadcast email campaign draft.",
);

// Client-only editor (nuqs URL state + email builder) — not eligible for instant navigation.
export const instant = false;

export default async function CampaignEditorRoute({
	params,
}: {
	params: Promise<{ campaignId: string }>;
}) {
	const { campaignId } = await params;
	return (
		<Suspense fallback={null}>
			<CampaignEditorPage campaignId={campaignId} />
		</Suspense>
	);
}
