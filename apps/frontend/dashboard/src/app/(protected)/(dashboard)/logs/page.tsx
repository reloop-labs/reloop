import { pageMetadata } from "#/app/_lib/page-metadata";
import { LogsPage } from "./client";

export const metadata = pageMetadata(
	"Logs · Reloop",
	"Inspect API request and delivery logs for your workspace.",
);

export default function LogsRoute() {
	return <LogsPage />;
}
