import { pageMetadata } from "#/app/_lib/page-metadata";
import { MetricsPage } from "./client";

export const metadata = pageMetadata(
	"Metrics · Reloop",
	"Deliverability and engagement metrics for your emails.",
);

export default function MetricsRoute() {
	return <MetricsPage />;
}
