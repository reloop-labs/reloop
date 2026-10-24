import { pageMetadata } from "#/app/_lib/page-metadata";
import { ConnectedAppsPage } from "./client";

export const metadata = pageMetadata(
	"Connected Apps · Reloop",
	"See and disconnect the apps, AI assistants, and CLIs with access to this organization.",
);

export default function ConnectedAppsRoute() {
	return <ConnectedAppsPage />;
}
