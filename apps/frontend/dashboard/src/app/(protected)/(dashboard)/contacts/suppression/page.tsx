import { pageMetadata } from "#/app/_lib/page-metadata";
import { SuppressionList } from "./client";

export const metadata = pageMetadata(
	"Suppression · Reloop",
	"Addresses that are excluded from sending.",
);

export default function ContactSuppressionRoute() {
	return <SuppressionList />;
}
