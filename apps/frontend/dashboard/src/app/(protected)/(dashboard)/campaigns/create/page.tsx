import { pageMetadata } from "#/app/_lib/page-metadata";
import { CreateCampaignPage } from "./client";

export const metadata = pageMetadata(
	"Create Campaign · Reloop",
	"Compose and broadcast email campaigns and newsletters to your audience.",
);

export default function CreateCampaignRoute() {
	return <CreateCampaignPage />;
}
