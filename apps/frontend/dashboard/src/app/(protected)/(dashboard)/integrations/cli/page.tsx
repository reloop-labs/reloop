import { pageMetadata } from "#/app/_lib/page-metadata";
import { CliPage } from "./client";

export const metadata = pageMetadata(
	"Reloop CLI · Integrations · Reloop",
	"Send, schedule, and inspect email from your terminal or a coding agent.",
);

export default function CliRoute() {
	return <CliPage />;
}
