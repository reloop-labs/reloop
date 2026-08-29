import { pageMetadata } from "#/app/_lib/page-metadata";
import { CampaignsPage } from "./client";

export const metadata = pageMetadata(
	"Campaigns · Reloop",
	"Broadcast email campaigns, newsletters, and announcements to all contacts.",
);

export default function CampaignsRoute() {
	return <CampaignsPage />;
}
