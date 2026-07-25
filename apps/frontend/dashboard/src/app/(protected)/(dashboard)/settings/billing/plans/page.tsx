import { pageMetadata } from "#/app/_lib/page-metadata";
import { PlansPage } from "./client";

export const metadata = pageMetadata(
	"Plans · Reloop",
	"Compare Reloop plans and request upgrades.",
);

export default function PlansRoute() {
	return <PlansPage />;
}
