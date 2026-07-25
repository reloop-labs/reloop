import { pageMetadata } from "#/app/_lib/page-metadata";
import { TeamsPage } from "./client";

export const metadata = pageMetadata(
	"Teams · Reloop",
	"Manage workspace members, set access levels, and invite new users.",
);

export default function TeamsRoute() {
	return <TeamsPage />;
}
